export interface AggregationConfig {
  groupBy: string;
  metrics: {
    field: string;
    operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
    alias?: string;
  }[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export class DataAggregator {
  /**
   * Performs intelligent data aggregation based on the visualization requirements
   */
  static aggregate(data: any[], config: AggregationConfig): any[] {
    if (!data || data.length === 0) return [];

    // Group data
    const grouped = this.groupData(data, config.groupBy);

    // Apply aggregations
    const aggregated = this.applyAggregations(grouped, config.metrics);

    // Sort results
    let results = Object.values(aggregated);
    if (config.sortBy) {
      results = this.sortData(results, config.sortBy, config.sortOrder || 'desc');
    }

    // Limit results
    if (config.limit) {
      results = results.slice(0, config.limit);
    }

    return results;
  }

  private static groupData(data: any[], groupBy: string): Record<string, any[]> {
    return data.reduce((acc, item) => {
      const key = item[groupBy] || 'Other';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private static applyAggregations(
    grouped: Record<string, any[]>,
    metrics: AggregationConfig['metrics']
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [groupKey, items] of Object.entries(grouped)) {
      result[groupKey] = {
        _group: groupKey,
        _count: items.length,
      };

      for (const metric of metrics) {
        const values = items
          .map(item => item[metric.field])
          .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
          .map(Number);

        const alias = metric.alias || `${metric.operation}_${metric.field}`;

        switch (metric.operation) {
          case 'sum':
            result[groupKey][alias] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            result[groupKey][alias] = values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
            break;
          case 'count':
            result[groupKey][alias] = values.length;
            break;
          case 'min':
            result[groupKey][alias] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            result[groupKey][alias] = values.length > 0 ? Math.max(...values) : 0;
            break;
        }
      }
    }

    return result;
  }

  private static sortData(
    data: any[],
    sortBy: string,
    order: 'asc' | 'desc'
  ): any[] {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      
      if (order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  /**
   * Prepares data specifically for different chart types
   */
  static prepareForChart(
    data: any[],
    chartType: 'bar' | 'line' | 'pie' | 'table',
    xKey: string,
    yKey: string,
    query: string
  ): any[] {
    switch (chartType) {
      case 'bar':
        return this.prepareBarChartData(data, xKey, yKey);
      case 'line':
        return this.prepareLineChartData(data, xKey, yKey);
      case 'pie':
        return this.preparePieChartData(data, xKey, yKey);
      default:
        return data;
    }
  }

  private static prepareBarChartData(data: any[], xKey: string, yKey: string): any[] {
    // Check if yKey contains aggregation prefix
    const aggregationType = this.extractAggregationType(yKey);
    const baseField = this.extractBaseField(yKey);

    const config: AggregationConfig = {
      groupBy: xKey,
      metrics: [{
        field: baseField,
        operation: aggregationType,
        alias: yKey
      }],
      sortBy: yKey,
      sortOrder: 'desc',
      limit: 10
    };

    const aggregated = this.aggregate(data, config);
    
    // Ensure the data has the expected structure
    return aggregated.map(item => ({
      [xKey]: item._group,
      [yKey]: Math.round(item[yKey] * 100) / 100,
      // Include all aggregation variations for flexibility
      [`total_${baseField}`]: item[`sum_${baseField}`] || item[yKey],
      [`avg_${baseField}`]: item[`avg_${baseField}`] || item[yKey],
      [baseField]: item[yKey] // Raw field fallback
    }));
  }

  private static prepareLineChartData(data: any[], xKey: string, yKey: string): any[] {
    // For time series, ensure proper date sorting
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a[xKey]);
      const dateB = new Date(b[xKey]);
      return dateA.getTime() - dateB.getTime();
    });

    // Group by date if needed
    const aggregationType = this.extractAggregationType(yKey);
    const baseField = this.extractBaseField(yKey);

    const config: AggregationConfig = {
      groupBy: xKey,
      metrics: [{
        field: baseField,
        operation: aggregationType,
        alias: yKey
      }],
      sortBy: xKey,
      sortOrder: 'asc'
    };

    const aggregated = this.aggregate(sorted, config);
    
    return aggregated.map(item => ({
      [xKey]: item._group,
      [yKey]: Math.round(item[yKey] * 100) / 100
    }));
  }

  private static preparePieChartData(data: any[], nameKey: string, valueKey: string): any[] {
    const aggregationType = this.extractAggregationType(valueKey);
    const baseField = this.extractBaseField(valueKey);

    const config: AggregationConfig = {
      groupBy: nameKey,
      metrics: [{
        field: baseField,
        operation: aggregationType,
        alias: 'value'
      }],
      sortBy: 'value',
      sortOrder: 'desc',
      limit: 8 // Limit pie slices for readability
    };

    const aggregated = this.aggregate(data, config);
    
    return aggregated.map(item => ({
      name: item._group,
      value: Math.round(item.value * 100) / 100
    }));
  }

  private static extractAggregationType(field: string): 'sum' | 'avg' | 'count' | 'min' | 'max' {
    if (field.startsWith('total_') || field.startsWith('sum_')) return 'sum';
    if (field.startsWith('avg_') || field.startsWith('average_')) return 'avg';
    if (field.startsWith('count_')) return 'count';
    if (field.startsWith('min_')) return 'min';
    if (field.startsWith('max_')) return 'max';
    return 'sum'; // Default aggregation
  }

  private static extractBaseField(field: string): string {
    // Remove common prefixes
    const prefixes = ['total_', 'sum_', 'avg_', 'average_', 'count_', 'min_', 'max_'];
    
    for (const prefix of prefixes) {
      if (field.startsWith(prefix)) {
        return field.substring(prefix.length);
      }
    }
    
    return field;
  }
}