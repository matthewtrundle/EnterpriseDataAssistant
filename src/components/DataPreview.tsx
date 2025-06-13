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
    <div className="max-w-6xl mx-auto px-6 mb-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden hover-lift">
        <div className="px-8 py-5 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-brand-50/30">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                showPreview 
                  ? 'bg-brand-600 text-white rotate-180' 
                  : 'bg-brand-100 text-brand-700 group-hover:bg-brand-200'
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Data Preview</h3>
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-brand-600">{rowCount.toLocaleString()}</span> rows × 
                  <span className="font-semibold text-brand-600"> {columns.length}</span> columns
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold">
                {fileName}
              </div>
              <Info className="w-5 h-5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
            </div>
          </button>
        </div>
        
        {showPreview && (
          <div className="animate-slide-up">
            {/* Column Statistics */}
            <div className="px-8 py-6 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100">
              <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-4">Column Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {columnStats.map(stat => (
                  <div key={stat.name} className="group bg-white p-4 rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-md transition-all">
                    <p className="font-semibold text-sm text-neutral-900 truncate mb-2" title={stat.name}>
                      {stat.name}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Type:</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          stat.type === 'numeric' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {stat.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Unique:</span>
                        <span className="text-xs font-semibold text-neutral-700">{stat.uniqueCount.toLocaleString()}</span>
                      </div>
                      {stat.type === 'numeric' && stat.min !== undefined && (
                        <div className="pt-2 mt-2 border-t border-neutral-100">
                          <p className="text-xs text-neutral-600">
                            <span className="font-medium">Range:</span> {stat.min.toFixed(2)} - {stat.max!.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Data Table Preview */}
            <div className="px-8 py-6">
              <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-4">Sample Data (First 5 Rows)</h4>
              <div className="overflow-x-auto rounded-xl border border-neutral-200 custom-scrollbar">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
                      {columns.map(col => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-brand-50/30 transition-colors">
                        {columns.map(col => (
                          <td key={col} className="px-6 py-3 whitespace-nowrap text-sm">
                            {typeof row[col] === 'number' ? (
                              <span className="font-medium text-brand-700">
                                {row[col].toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-neutral-900">
                                {row[col]?.toString() || <span className="text-neutral-400">—</span>}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};