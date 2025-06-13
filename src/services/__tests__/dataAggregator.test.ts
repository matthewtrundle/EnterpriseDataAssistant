import { DataAggregator } from '../dataAggregator';

describe('DataAggregator', () => {
  const mockData = [
    { category: 'A', value: 100, quantity: 10 },
    { category: 'A', value: 200, quantity: 20 },
    { category: 'B', value: 300, quantity: 30 },
    { category: 'B', value: 400, quantity: 40 },
    { category: 'C', value: 500, quantity: 50 }
  ];

  describe('aggregate', () => {
    it('should correctly sum values by category', () => {
      const result = DataAggregator.aggregate(mockData, {
        groupBy: 'category',
        metrics: [{
          field: 'value',
          operation: 'sum',
          alias: 'total_value'
        }],
        sortBy: 'total_value',
        sortOrder: 'desc'
      });

      expect(result).toHaveLength(3);
      expect(result[0]._group).toBe('C');
      expect(result[0].total_value).toBe(500);
      expect(result[1]._group).toBe('B');
      expect(result[1].total_value).toBe(700);
      expect(result[2]._group).toBe('A');
      expect(result[2].total_value).toBe(300);
    });

    it('should correctly calculate averages', () => {
      const result = DataAggregator.aggregate(mockData, {
        groupBy: 'category',
        metrics: [{
          field: 'value',
          operation: 'avg',
          alias: 'avg_value'
        }]
      });

      const categoryA = result.find(r => r._group === 'A');
      expect(categoryA?.avg_value).toBe(150);
    });

    it('should handle multiple metrics', () => {
      const result = DataAggregator.aggregate(mockData, {
        groupBy: 'category',
        metrics: [
          { field: 'value', operation: 'sum', alias: 'total' },
          { field: 'value', operation: 'avg', alias: 'average' },
          { field: 'quantity', operation: 'sum', alias: 'total_qty' }
        ]
      });

      const categoryB = result.find(r => r._group === 'B');
      expect(categoryB?.total).toBe(700);
      expect(categoryB?.average).toBe(350);
      expect(categoryB?.total_qty).toBe(70);
    });
  });

  describe('prepareForChart', () => {
    it('should prepare data for bar charts with proper aggregation', () => {
      const result = DataAggregator.prepareForChart(
        mockData,
        'bar',
        'category',
        'total_value',
        'Show total value by category'
      );

      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('B');
      expect(result[0].total_value).toBe(700);
    });

    it('should handle aggregation prefixes correctly', () => {
      const result = DataAggregator.prepareForChart(
        mockData,
        'bar',
        'category',
        'avg_value',
        'Show average value by category'
      );

      const categoryA = result.find(r => r.category === 'A');
      expect(categoryA?.avg_value).toBe(150);
    });

    it('should prepare pie chart data correctly', () => {
      const result = DataAggregator.prepareForChart(
        mockData,
        'pie',
        'category',
        'value',
        'Show value distribution'
      );

      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('value');
      expect(result[0].name).toBe('B');
      expect(result[0].value).toBe(700);
    });
  });
});