import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChartData } from '../types/query';
import { AlertCircle } from 'lucide-react';

interface ChartVisualizationProps {
  chart: ChartData;
}

const COLORS = ['#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6', '#14B8A6', '#06B6D4', '#0284C7', '#4F46E5'];

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ chart }) => {
  // Validate that we have data
  const hasData = useMemo(() => {
    return chart.data && chart.data.length > 0;
  }, [chart.data]);

  // Check if chart keys exist in data
  const keysValid = useMemo(() => {
    if (!hasData) return false;
    const firstItem = chart.data[0];
    const keys = Object.keys(firstItem);
    
    switch (chart.type) {
      case 'bar':
      case 'line':
        return keys.includes(chart.xKey || '') && keys.includes(chart.yKey || '');
      case 'pie':
        return keys.includes(chart.nameKey || 'name') && keys.includes(chart.valueKey || 'value');
      default:
        return true;
    }
  }, [chart, hasData]);

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Visualization Error</h3>
        <p className="text-neutral-600">{message}</p>
        <div className="mt-4 p-4 bg-neutral-100 rounded-lg text-left max-w-md mx-auto">
          <p className="text-sm text-neutral-700 font-mono">
            Type: {chart.type}<br/>
            Data points: {chart.data?.length || 0}<br/>
            {chart.xKey && `X-axis: ${chart.xKey}`}<br/>
            {chart.yKey && `Y-axis: ${chart.yKey}`}
          </p>
        </div>
      </div>
    </div>
  );

  if (!hasData) {
    return <ErrorDisplay message="No data available for visualization" />;
  }

  if (!keysValid) {
    return <ErrorDisplay message="Chart configuration doesn't match data structure" />;
  }
  if (chart.type === 'line') {
    // Format numbers in the data
    const formattedData = chart.data.map(item => ({
      ...item,
      [chart.yKey || 'y']: typeof item[chart.yKey || 'y'] === 'number' 
        ? Math.round(item[chart.yKey || 'y'] * 100) / 100 
        : item[chart.yKey || 'y']
    }));

    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey={chart.xKey || 'x'} 
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(2);
                }
                return value;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey={chart.yKey || 'y'} 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#fff', stroke: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
              fill="url(#colorGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'bar') {
    // Ensure data is properly formatted and sorted
    const formattedData = chart.data
      .map(item => ({
        ...item,
        [chart.yKey || 'y']: typeof item[chart.yKey || 'y'] === 'number' 
          ? Math.round(item[chart.yKey || 'y'] * 100) / 100 
          : 0
      }))
      .sort((a, b) => b[chart.yKey || 'y'] - a[chart.yKey || 'y'])
      .slice(0, 10); // Limit to top 10 for clarity

    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey={chart.xKey || 'x'} 
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                return value;
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                  return `$${value.toFixed(2)}`;
                }
                return value;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar 
              dataKey={chart.yKey || 'y'} 
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'pie') {
    // Calculate total for percentage display
    const total = chart.data.reduce((sum, item) => sum + (item[chart.valueKey || 'value'] || 0), 0);
    
    // Format data and calculate percentages
    const formattedData = chart.data
      .sort((a, b) => b[chart.valueKey || 'value'] - a[chart.valueKey || 'value'])
      .slice(0, 8) // Limit to 8 slices for readability
      .map(item => ({
        ...item,
        percentage: ((item[chart.valueKey || 'value'] / total) * 100).toFixed(1)
      }));

    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => {
                const name = entry[chart.nameKey || 'name'];
                const percentage = entry.percentage;
                return `${name}: ${percentage}%`;
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey={chart.valueKey || 'value'}
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                  return `$${value.toFixed(2)}`;
                }
                return value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'table') {
    if (!chart.data || chart.data.length === 0) {
      return <ErrorDisplay message="No data available for table" />;
    }

    // Get columns and format them nicely
    const columns = Object.keys(chart.data[0] || {});
    const formatColumnName = (col: string) => {
      return col
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCellValue = (value: any, column: string) => {
      if (value === null || value === undefined) return '-';
      
      if (typeof value === 'number') {
        // Check if it's a percentage column
        if (column.includes('margin') || column.includes('percentage') || column.includes('rate')) {
          return `${(value * 100).toFixed(1)}%`;
        }
        // Check if it's a currency column
        if (column.includes('revenue') || column.includes('sales') || column.includes('amount')) {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
          return `$${value.toFixed(2)}`;
        }
        // Default number formatting
        return value.toLocaleString();
      }
      
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      return String(value);
    };

    return (
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                >
                  {formatColumnName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-100">
            {chart.data.slice(0, 20).map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-brand-50/50 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {typeof row[column] === 'number' ? (
                      <span className="font-medium text-brand-700">
                        {formatCellValue(row[column], column)}
                      </span>
                    ) : (
                      formatCellValue(row[column], column)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {chart.data.length > 20 && (
          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-sm text-neutral-600">
            Showing 20 of {chart.data.length} rows
          </div>
        )}
      </div>
    );
  }

  return null;
};