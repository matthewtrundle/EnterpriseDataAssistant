import { ChartData } from '../types/query';

export interface ValidationResult {
  isValid: boolean;
  correctedChart?: ChartData;
  errors: string[];
  warnings: string[];
}

export class DataValidator {
  /**
   * Validates and corrects chart configuration against actual data
   */
  static validateChartData(
    chart: ChartData,
    rawData: any[],
    query: string
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!rawData || rawData.length === 0) {
      result.isValid = false;
      result.errors.push('No data available for visualization');
      return result;
    }

    // Get available fields from the data
    const availableFields = this.getAvailableFields(rawData);
    const numericFields = this.getNumericFields(rawData);
    const categoricalFields = this.getCategoricalFields(rawData);
    const dateFields = this.getDateFields(rawData);

    // Validate and correct based on chart type
    switch (chart.type) {
      case 'bar':
        result.correctedChart = this.validateBarChart(
          chart,
          availableFields,
          numericFields,
          categoricalFields,
          query
        );
        break;
      case 'line':
        result.correctedChart = this.validateLineChart(
          chart,
          availableFields,
          numericFields,
          dateFields,
          query
        );
        break;
      case 'pie':
        result.correctedChart = this.validatePieChart(
          chart,
          availableFields,
          numericFields,
          categoricalFields
        );
        break;
      default:
        result.correctedChart = chart;
    }

    return result;
  }

  private static getAvailableFields(data: any[]): Set<string> {
    const fields = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => fields.add(key));
    });
    return fields;
  }

  private static getNumericFields(data: any[]): string[] {
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    return Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'number' || !isNaN(parseFloat(value));
    });
  }

  private static getCategoricalFields(data: any[]): string[] {
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    return Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'string' && isNaN(parseFloat(value));
    });
  }

  private static getDateFields(data: any[]): string[] {
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    return Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      if (typeof value !== 'string') return false;
      
      // Check if it's a valid date
      const date = new Date(value);
      return !isNaN(date.getTime()) && value.includes('-');
    });
  }

  private static validateBarChart(
    chart: ChartData,
    availableFields: Set<string>,
    numericFields: string[],
    categoricalFields: string[],
    query: string
  ): ChartData {
    const corrected = { ...chart };

    // Validate xKey
    if (!chart.xKey || !availableFields.has(chart.xKey)) {
      // Smart fallback based on query context
      if (query.toLowerCase().includes('product')) {
        corrected.xKey = this.findBestMatch(['product_name', 'product_category', 'product'], categoricalFields) 
          || categoricalFields[0] || 'category';
      } else if (query.toLowerCase().includes('region')) {
        corrected.xKey = this.findBestMatch(['region', 'country', 'location'], categoricalFields)
          || categoricalFields[0] || 'region';
      } else if (query.toLowerCase().includes('customer')) {
        corrected.xKey = this.findBestMatch(['customer_segment', 'customer_type', 'segment'], categoricalFields)
          || categoricalFields[0] || 'segment';
      } else {
        corrected.xKey = categoricalFields[0] || 'category';
      }
    }

    // Validate yKey - handle aggregated vs raw fields
    if (!chart.yKey || !availableFields.has(chart.yKey)) {
      // Map common aggregated fields to available fields
      const yKeyMappings: Record<string, string[]> = {
        'total_revenue': ['revenue', 'sales', 'amount'],
        'avg_revenue': ['revenue', 'sales', 'amount'],
        'total_quantity': ['quantity', 'units', 'count'],
        'avg_quantity': ['quantity', 'units', 'count'],
        'avg_profit_margin': ['profit_margin', 'margin', 'profit'],
      };

      // Try to find a matching field
      let foundField = null;
      if (chart.yKey && yKeyMappings[chart.yKey]) {
        foundField = this.findBestMatch(yKeyMappings[chart.yKey], numericFields);
      }

      if (!foundField) {
        // Fallback based on query context
        if (query.toLowerCase().includes('revenue') || query.toLowerCase().includes('sales')) {
          foundField = this.findBestMatch(['revenue', 'sales', 'amount', 'total'], numericFields);
        } else if (query.toLowerCase().includes('quantity') || query.toLowerCase().includes('units')) {
          foundField = this.findBestMatch(['quantity', 'units', 'count'], numericFields);
        } else if (query.toLowerCase().includes('profit')) {
          foundField = this.findBestMatch(['profit', 'profit_margin', 'margin'], numericFields);
        }
      }

      corrected.yKey = foundField || numericFields[0] || 'value';
    }

    return corrected;
  }

  private static validateLineChart(
    chart: ChartData,
    availableFields: Set<string>,
    numericFields: string[],
    dateFields: string[],
    query: string
  ): ChartData {
    const corrected = { ...chart };

    // Line charts should use date fields for x-axis
    if (!chart.xKey || !availableFields.has(chart.xKey)) {
      corrected.xKey = dateFields[0] || 'date';
    }

    // Validate yKey similar to bar chart
    if (!chart.yKey || !availableFields.has(chart.yKey)) {
      if (query.toLowerCase().includes('revenue')) {
        corrected.yKey = this.findBestMatch(['revenue', 'sales', 'amount'], numericFields) || numericFields[0] || 'value';
      } else {
        corrected.yKey = numericFields[0] || 'value';
      }
    }

    return corrected;
  }

  private static validatePieChart(
    chart: ChartData,
    availableFields: Set<string>,
    numericFields: string[],
    categoricalFields: string[]
  ): ChartData {
    const corrected = { ...chart };

    // Pie charts need name and value keys
    if (!chart.nameKey || !availableFields.has(chart.nameKey)) {
      corrected.nameKey = categoricalFields[0] || 'name';
    }

    if (!chart.valueKey || !availableFields.has(chart.valueKey)) {
      corrected.valueKey = numericFields[0] || 'value';
    }

    return corrected;
  }

  private static findBestMatch(candidates: string[], available: string[]): string | null {
    for (const candidate of candidates) {
      if (available.includes(candidate)) {
        return candidate;
      }
    }
    
    // Try partial matches
    for (const candidate of candidates) {
      const match = available.find(field => 
        field.toLowerCase().includes(candidate.toLowerCase()) ||
        candidate.toLowerCase().includes(field.toLowerCase())
      );
      if (match) return match;
    }
    
    return null;
  }

  /**
   * Intelligently selects the best chart type based on data characteristics
   */
  static recommendChartType(
    data: any[],
    query: string,
    suggestedType?: string
  ): 'bar' | 'line' | 'pie' | 'table' {
    const numericFields = this.getNumericFields(data);
    const categoricalFields = this.getCategoricalFields(data);
    const dateFields = this.getDateFields(data);
    const uniqueCategories = new Set(data.map(d => d[categoricalFields[0]]));

    // Query-based heuristics
    if (query.toLowerCase().includes('trend') || 
        query.toLowerCase().includes('over time') ||
        query.toLowerCase().includes('timeline')) {
      return dateFields.length > 0 ? 'line' : 'bar';
    }

    if (query.toLowerCase().includes('proportion') ||
        query.toLowerCase().includes('distribution') ||
        query.toLowerCase().includes('breakdown')) {
      return uniqueCategories.size <= 8 ? 'pie' : 'bar';
    }

    // Data-based heuristics
    if (dateFields.length > 0 && data.length > 20) {
      return 'line';
    }

    if (uniqueCategories.size <= 5 && uniqueCategories.size > 1) {
      return 'pie';
    }

    if (categoricalFields.length > 0 && numericFields.length > 0) {
      return 'bar';
    }

    return 'table';
  }
}