import React from 'react';
import { FileDown, Award } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: string[];
  confidence: number;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, confidence }) => {
  const handleExport = () => {
    // In a real app, this would generate a PowerPoint
    alert('PowerPoint export would be triggered here. For the demo, this would download a pre-made template.');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Confidence:</span>
            <span className={`text-sm font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span className="text-sm">Export to PowerPoint</span>
          </button>
        </div>
      </div>
      
      <ul className="space-y-3">
        {summary.map((point, index) => (
          <li key={index} className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <p className="text-gray-700">{point}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};