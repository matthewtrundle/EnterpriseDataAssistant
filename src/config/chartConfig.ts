export const CHART_RECOMMENDATIONS = {
  // Query patterns that suggest specific chart types
  queryPatterns: {
    line: [
      'trend', 'over time', 'timeline', 'monthly', 'quarterly', 'yearly',
      'growth', 'decline', 'progression', 'historical'
    ],
    bar: [
      'compare', 'comparison', 'by category', 'by product', 'by region',
      'top', 'best', 'worst', 'ranking', 'performance'
    ],
    pie: [
      'distribution', 'proportion', 'breakdown', 'composition',
      'percentage', 'share', 'split', 'allocation'
    ],
    table: [
      'details', 'list', 'all', 'show me', 'breakdown by',
      'individual', 'specific', 'records'
    ]
  },

  // Field naming patterns for better detection
  fieldPatterns: {
    date: ['date', 'time', 'created', 'updated', 'period', 'month', 'year', 'quarter'],
    category: ['category', 'type', 'group', 'segment', 'name', 'product', 'region', 'department'],
    numeric: ['revenue', 'sales', 'amount', 'quantity', 'count', 'total', 'sum', 'average'],
    percentage: ['margin', 'rate', 'percentage', 'ratio', 'proportion']
  },

  // Smart defaults for common scenarios
  smartDefaults: {
    revenue: {
      preferredCharts: ['bar', 'line'],
      aggregation: 'sum',
      formatting: 'currency'
    },
    quantity: {
      preferredCharts: ['bar', 'line'],
      aggregation: 'sum',
      formatting: 'number'
    },
    profit_margin: {
      preferredCharts: ['bar', 'line'],
      aggregation: 'avg',
      formatting: 'percentage'
    }
  },

  // Maximum items for different chart types
  maxItems: {
    pie: 8,
    bar: 15,
    line: 50,
    table: 100
  }
};

export const CHART_COLORS = {
  primary: ['#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6', '#14B8A6', '#06B6D4', '#0284C7', '#4F46E5'],
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#F59E0B',
  gradients: {
    blue: ['#3B82F6', '#1E40AF'],
    purple: ['#8B5CF6', '#6D28D9'],
    teal: ['#14B8A6', '#0F766E']
  }
};

export const CHART_STYLES = {
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  axis: {
    tick: { fill: '#64748b' },
    axisLine: { stroke: '#e2e8f0' }
  },
  grid: {
    strokeDasharray: '3 3',
    stroke: '#e2e8f0',
    vertical: false
  }
};