import { QueryResult } from '../types/query';
import { getMockData } from '../data/mockDataStore';
import { format, subMonths, startOfMonth, endOfMonth, subQuarters, startOfQuarter, endOfQuarter } from 'date-fns';

export function processQuery(query: string): QueryResult {
  const normalizedQuery = query.toLowerCase();
  
  if (normalizedQuery.includes('revenue') && normalizedQuery.includes('drop')) {
    return processRevenueDropQuery();
  } else if (normalizedQuery.includes('churn') || normalizedQuery.includes('risk')) {
    return processChurnRiskQuery();
  } else if (normalizedQuery.includes('best performing') && normalizedQuery.includes('feature')) {
    return processBestFeatureQuery();
  } else if (normalizedQuery.includes('compare') && normalizedQuery.includes('quarter')) {
    return processQuarterComparisonQuery();
  } else if (normalizedQuery.includes('sales') && normalizedQuery.includes('region')) {
    return processSalesByRegionQuery();
  }
  
  // Default response for unrecognized queries
  return {
    sql: `SELECT * FROM analytics_data WHERE query = '${query}' LIMIT 100;`,
    chart: {
      type: 'table',
      data: [{ message: 'Query not recognized. Please try one of the pre-built queries.' }]
    },
    insights: [{
      type: 'neutral',
      text: 'This is a demo with pre-built queries. Try asking about revenue drops, customer churn, or feature performance.'
    }],
    summary: ['Unable to process this specific query in the demo.'],
    confidence: 50
  };
}

function processRevenueDropQuery(): QueryResult {
  const data = getMockData();
  const today = new Date('2024-12-01'); // Fixed date for consistent demo
  const lastMonth = subMonths(today, 1);
  const twoMonthsAgo = subMonths(today, 2);
  
  // Aggregate revenue by month
  const monthlyRevenue = data.sales.reduce((acc, sale) => {
    const saleDate = new Date(sale.date);
    const monthKey = format(saleDate, 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, revenue: 0, north_revenue: 0 };
    }
    acc[monthKey].revenue += sale.revenue;
    if (sale.region === 'North') {
      acc[monthKey].north_revenue += sale.revenue;
    }
    return acc;
  }, {} as Record<string, any>);
  
  const chartData = Object.values(monthlyRevenue)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months
  
  return {
    sql: `SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(revenue) as total_revenue,
  SUM(CASE WHEN region = 'North' THEN revenue ELSE 0 END) as north_revenue
FROM sales_data
WHERE date >= DATEADD('month', -6, CURRENT_DATE())
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;`,
    chart: {
      type: 'line',
      data: chartData.map((d: any) => ({
        month: format(new Date(d.month + '-01'), 'MMM yyyy'),
        revenue: Math.round(d.revenue),
        north_revenue: Math.round(d.north_revenue)
      })),
      xKey: 'month',
      yKey: 'revenue'
    },
    insights: [
      {
        type: 'negative',
        text: 'Revenue decreased 23% in November 2024 compared to October 2024'
      },
      {
        type: 'negative', 
        text: 'North region underperformed by 50%, contributing to the overall decline'
      },
      {
        type: 'neutral',
        text: 'Other regions maintained stable performance during the same period'
      }
    ],
    summary: [
      'November 2024 saw a significant 23% revenue decline month-over-month',
      'The North region was the primary driver, with revenue dropping 50%',
      'This appears to be an isolated regional issue rather than a company-wide trend'
    ],
    confidence: 92,
    nextSteps: ['View regional breakdown', 'Analyze North region sales team performance', 'Review competitive landscape in North region']
  };
}

function processChurnRiskQuery(): QueryResult {
  const data = getMockData();
  const activeCustomers = data.customers.filter(c => !c.churn_date);
  const atRiskCustomers = activeCustomers.filter(c => c.health_score < 50);
  
  const riskDistribution = [
    { risk: 'High Risk (< 30)', count: atRiskCustomers.filter(c => c.health_score < 30).length },
    { risk: 'Medium Risk (30-50)', count: atRiskCustomers.filter(c => c.health_score >= 30 && c.health_score < 50).length },
    { risk: 'Low Risk (50-70)', count: activeCustomers.filter(c => c.health_score >= 50 && c.health_score < 70).length },
    { risk: 'Healthy (70+)', count: activeCustomers.filter(c => c.health_score >= 70).length }
  ];
  
  const atRiskMRR = atRiskCustomers.reduce((sum, c) => sum + c.mrr, 0);
  const enterpriseAtRisk = atRiskCustomers.filter(c => c.segment === 'Enterprise').length;
  
  return {
    sql: `SELECT 
  customer_id,
  company_name,
  segment,
  mrr,
  health_score,
  DATEDIFF('day', last_activity_date, CURRENT_DATE()) as days_inactive
FROM customers
WHERE churn_date IS NULL
  AND health_score < 50
ORDER BY health_score ASC, mrr DESC
LIMIT 20;`,
    chart: {
      type: 'pie',
      data: riskDistribution,
      nameKey: 'risk',
      valueKey: 'count'
    },
    insights: [
      {
        type: 'negative',
        text: `${enterpriseAtRisk} Enterprise customers worth $${(atRiskMRR / 1000).toFixed(0)}k MRR are at high risk`
      },
      {
        type: 'negative',
        text: `${atRiskCustomers.length} total customers show health scores below 50`
      },
      {
        type: 'neutral',
        text: 'Immediate intervention recommended for customers with scores below 30'
      }
    ],
    summary: [
      `${atRiskCustomers.length} customers are at risk of churning based on health scores`,
      `Total at-risk MRR is $${(atRiskMRR / 1000).toFixed(0)}k, with Enterprise segment most concerning`,
      'Proactive outreach could prevent 60-70% of potential churn based on historical data'
    ],
    confidence: 88,
    nextSteps: ['Contact high-value at-risk customers immediately', 'Schedule QBRs with Enterprise accounts', 'Implement automated health score alerts']
  };
}

function processBestFeatureQuery(): QueryResult {
  const data = getMockData();
  const today = new Date('2024-12-01');
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));
  
  // Aggregate by feature for last month
  const featureUsage = data.product_usage
    .filter(u => {
      const date = new Date(u.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((acc, usage) => {
      if (!acc[usage.feature]) {
        acc[usage.feature] = {
          feature: usage.feature,
          total_users: 0,
          total_sessions: 0,
          total_duration: 0,
          days: 0
        };
      }
      acc[usage.feature].total_users += usage.users;
      acc[usage.feature].total_sessions += usage.sessions;
      acc[usage.feature].total_duration += usage.avg_duration * usage.sessions;
      acc[usage.feature].days += 1;
      return acc;
    }, {} as Record<string, any>);
  
  const chartData = Object.values(featureUsage)
    .map((f: any) => ({
      feature: f.feature,
      avg_daily_users: Math.round(f.total_users / f.days),
      engagement_score: Math.round((f.total_sessions / f.total_users) * 10) / 10,
      avg_session_duration: Math.round((f.total_duration / f.total_sessions) * 10) / 10
    }))
    .sort((a, b) => b.avg_daily_users - a.avg_daily_users);
  
  return {
    sql: `SELECT 
  feature,
  AVG(users) as avg_daily_users,
  AVG(sessions) as avg_daily_sessions,
  AVG(avg_duration) as avg_session_duration,
  SUM(sessions) / SUM(users) as engagement_score
FROM product_usage
WHERE date >= DATEADD('day', -30, CURRENT_DATE())
GROUP BY feature
ORDER BY avg_daily_users DESC;`,
    chart: {
      type: 'bar',
      data: chartData,
      xKey: 'feature',
      yKey: 'avg_daily_users'
    },
    insights: [
      {
        type: 'positive',
        text: 'Analytics Dashboard has 3x higher engagement than other features'
      },
      {
        type: 'positive',
        text: 'Dashboard feature shows consistent 15+ minute average session duration'
      },
      {
        type: 'neutral',
        text: 'API and Integrations features show growth potential with lower current adoption'
      }
    ],
    summary: [
      'Dashboard is the clear winner with highest user count and engagement',
      'Analytics feature shows strong user retention and session length',
      'Lower-tier features present upsell opportunities for existing customers'
    ],
    confidence: 95,
    nextSteps: ['Invest more in Dashboard feature development', 'Create user guides for underutilized features', 'Survey users about desired Analytics enhancements']
  };
}

function processQuarterComparisonQuery(): QueryResult {
  const data = getMockData();
  const today = new Date('2024-12-01');
  const thisQuarterStart = startOfQuarter(today);
  const lastQuarterStart = startOfQuarter(subQuarters(today, 1));
  const lastQuarterEnd = endOfQuarter(subQuarters(today, 1));
  
  // Calculate metrics for both quarters
  const thisQuarterSales = data.sales.filter(s => new Date(s.date) >= thisQuarterStart);
  const lastQuarterSales = data.sales.filter(s => {
    const date = new Date(s.date);
    return date >= lastQuarterStart && date <= lastQuarterEnd;
  });
  
  const metrics = [
    {
      metric: 'Total Revenue',
      last_quarter: lastQuarterSales.reduce((sum, s) => sum + s.revenue, 0),
      this_quarter: thisQuarterSales.reduce((sum, s) => sum + s.revenue, 0)
    },
    {
      metric: 'Number of Deals',
      last_quarter: lastQuarterSales.reduce((sum, s) => sum + s.deals, 0),
      this_quarter: thisQuarterSales.reduce((sum, s) => sum + s.deals, 0)
    },
    {
      metric: 'Average Deal Size',
      last_quarter: Math.round(lastQuarterSales.reduce((sum, s) => sum + s.revenue, 0) / lastQuarterSales.reduce((sum, s) => sum + s.deals, 0)),
      this_quarter: Math.round(thisQuarterSales.reduce((sum, s) => sum + s.revenue, 0) / thisQuarterSales.reduce((sum, s) => sum + s.deals, 0))
    }
  ];
  
  const chartData = metrics.map(m => ({
    ...m,
    change: Math.round(((m.this_quarter - m.last_quarter) / m.last_quarter) * 100)
  }));
  
  return {
    sql: `WITH quarterly_metrics AS (
  SELECT 
    DATE_TRUNC('quarter', date) as quarter,
    SUM(revenue) as total_revenue,
    SUM(deals) as total_deals,
    AVG(revenue/deals) as avg_deal_size
  FROM sales_data
  WHERE date >= DATEADD('quarter', -2, CURRENT_DATE())
  GROUP BY DATE_TRUNC('quarter', date)
)
SELECT * FROM quarterly_metrics
ORDER BY quarter DESC;`,
    chart: {
      type: 'table',
      data: chartData
    },
    insights: [
      {
        type: chartData[0].change > 0 ? 'positive' : 'negative',
        text: `Revenue ${chartData[0].change > 0 ? 'increased' : 'decreased'} ${Math.abs(chartData[0].change)}% quarter-over-quarter`
      },
      {
        type: chartData[2].change > 0 ? 'positive' : 'negative',
        text: `Average deal size ${chartData[2].change > 0 ? 'grew' : 'shrank'} ${Math.abs(chartData[2].change)}%`
      },
      {
        type: 'neutral',
        text: 'Q4 typically shows seasonal strength in enterprise sales'
      }
    ],
    summary: [
      `Overall ${chartData[0].change > 0 ? 'growth' : 'decline'} of ${Math.abs(chartData[0].change)}% in revenue compared to last quarter`,
      'Deal volume and average deal size show correlated movement',
      'Current quarter performance aligns with seasonal expectations'
    ],
    confidence: 90
  };
}

function processSalesByRegionQuery(): QueryResult {
  const data = getMockData();
  const regionSales = data.sales.reduce((acc, sale) => {
    if (!acc[sale.region]) {
      acc[sale.region] = { region: sale.region, revenue: 0, deals: 0 };
    }
    acc[sale.region].revenue += sale.revenue;
    acc[sale.region].deals += sale.deals;
    return acc;
  }, {} as Record<string, any>);
  
  const chartData = Object.values(regionSales)
    .map((r: any) => ({
      region: r.region,
      revenue: Math.round(r.revenue),
      deals: r.deals,
      avg_deal_size: Math.round(r.revenue / r.deals)
    }))
    .sort((a, b) => b.revenue - a.revenue);
  
  const bestRegion = chartData[0];
  const worstRegion = chartData[chartData.length - 1];
  
  return {
    sql: `SELECT 
  region,
  SUM(revenue) as total_revenue,
  SUM(deals) as total_deals,
  AVG(revenue/deals) as avg_deal_size,
  COUNT(DISTINCT rep) as active_reps
FROM sales_data
WHERE date >= DATEADD('day', -365, CURRENT_DATE())
GROUP BY region
ORDER BY total_revenue DESC;`,
    chart: {
      type: 'bar',
      data: chartData,
      xKey: 'region',
      yKey: 'revenue'
    },
    insights: [
      {
        type: 'positive',
        text: `${bestRegion.region} region leads with $${(bestRegion.revenue / 1000000).toFixed(1)}M in revenue`
      },
      {
        type: 'negative',
        text: `${worstRegion.region} region underperforming at $${(worstRegion.revenue / 1000000).toFixed(1)}M`
      },
      {
        type: 'neutral',
        text: `Revenue spread of ${Math.round(((bestRegion.revenue - worstRegion.revenue) / worstRegion.revenue) * 100)}% between best and worst regions`
      }
    ],
    summary: [
      `${bestRegion.region} region dominates with highest revenue and deal volume`,
      `Significant performance gap exists between regions`,
      'Regional rebalancing could improve overall company performance'
    ],
    confidence: 93,
    nextSteps: ['Analyze best practices from West region', 'Investigate South region challenges', 'Consider territory realignment']
  };
}