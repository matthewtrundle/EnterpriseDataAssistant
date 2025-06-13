import { DataValidator } from '../dataValidator';
import { ChartData } from '../../types/query';

describe('DataValidator', () => {
  const mockData = [
    { product_name: 'Product A', revenue: 1000, quantity: 10, date: '2024-01-01' },
    { product_name: 'Product B', revenue: 2000, quantity: 20, date: '2024-01-02' },
    { product_name: 'Product C', revenue: 1500, quantity: 15, date: '2024-01-03' }
  ];

  describe('validateChartData', () => {
    it('should validate correct bar chart configuration', () => {
      const chart: ChartData = {
        type: 'bar',
        data: [],
        xKey: 'product_name',
        yKey: 'revenue'
      };

      const result = DataValidator.validateChartData(chart, mockData, 'Show revenue by product');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should correct invalid field names', () => {
      const chart: ChartData = {
        type: 'bar',
        data: [],
        xKey: 'product', // Invalid field
        yKey: 'total_revenue' // Invalid field
      };

      const result = DataValidator.validateChartData(chart, mockData, 'Show revenue by product');
      
      expect(result.correctedChart).toBeDefined();
      expect(result.correctedChart?.xKey).toBe('product_name');
      expect(result.correctedChart?.yKey).toBe('revenue');
    });

    it('should handle aggregation field mapping', () => {
      const chart: ChartData = {
        type: 'bar',
        data: [],
        xKey: 'product_name',
        yKey: 'avg_revenue' // Aggregation field
      };

      const result = DataValidator.validateChartData(chart, mockData, 'Average revenue by product');
      
      expect(result.correctedChart?.yKey).toBe('revenue');
    });

    it('should recommend line chart for time-based data', () => {
      const chartType = DataValidator.recommendChartType(
        mockData,
        'Show revenue trend over time',
        'bar'
      );
      
      expect(chartType).toBe('line');
    });

    it('should recommend pie chart for distribution queries', () => {
      const chartType = DataValidator.recommendChartType(
        mockData.slice(0, 5),
        'Show revenue distribution by product',
        'bar'
      );
      
      expect(chartType).toBe('pie');
    });
  });

  describe('field detection', () => {
    it('should correctly identify numeric fields', () => {
      const fields = DataValidator['getNumericFields'](mockData);
      expect(fields).toContain('revenue');
      expect(fields).toContain('quantity');
    });

    it('should correctly identify categorical fields', () => {
      const fields = DataValidator['getCategoricalFields'](mockData);
      expect(fields).toContain('product_name');
    });

    it('should correctly identify date fields', () => {
      const fields = DataValidator['getDateFields'](mockData);
      expect(fields).toContain('date');
    });
  });
});