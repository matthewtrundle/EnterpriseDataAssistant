import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

interface DataPreviewProps {
  data: any[];
  fileName: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, fileName }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  if (!data || data.length === 0) return null;
  
  const columns = Object.keys(data[0]);
  const rowCount = data.length;
  const previewData = data.slice(0, 5);
  
  // Calculate column statistics
  const columnStats = columns.map(col => {
    const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
    const numericValues = values.filter(v => typeof v === 'number');
    const isNumeric = numericValues.length > values.length / 2;
    
    return {
      name: col,
      type: isNumeric ? 'numeric' : 'text',
      uniqueCount: new Set(values).size,
      nullCount: data.length - values.length,
      ...(isNumeric && numericValues.length > 0 ? {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length
      } : {})
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 mb-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center space-x-3">
              {showPreview ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
              <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
              <span className="text-sm text-gray-500">
                {rowCount} rows × {columns.length} columns
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {showPreview && (
          <>
            {/* Column Statistics */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Column Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {columnStats.map(stat => (
                  <div key={stat.name} className="bg-white p-3 rounded border border-gray-200">
                    <p className="font-medium text-sm text-gray-900 truncate" title={stat.name}>
                      {stat.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {stat.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Unique: {stat.uniqueCount}
                    </p>
                    {stat.type === 'numeric' && stat.min !== undefined && (
                      <p className="text-xs text-gray-500">
                        Range: {stat.min.toFixed(2)} - {stat.max!.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Data Table Preview */}
            <div className="px-6 py-4 overflow-x-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">First 5 Rows</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map(col => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map(col => (
                        <td key={col} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {row[col]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};