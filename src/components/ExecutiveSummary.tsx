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
    if (confidence >= 85) return 'text-emerald-600 bg-emerald-100';
    if (confidence >= 70) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return 'High Confidence';
    if (confidence >= 70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-medium border border-neutral-100 p-8 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg">
            <Award className="w-6 h-6 text-brand-700" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">Executive Summary</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getConfidenceColor(confidence)}`}>
            <span className="text-sm font-semibold">{getConfidenceLabel(confidence)}</span>
            <span className="text-lg font-bold">{confidence}%</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 btn-primary"
          >
            <FileDown className="w-4 h-4" />
            <span className="text-sm">Export to PowerPoint</span>
          </button>
        </div>
      </div>
      
      <ul className="space-y-4">
        {summary.map((point, index) => (
          <li key={index} className="flex items-start space-x-4 group">
            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">
              {index + 1}
            </span>
            <p className="text-neutral-700 leading-relaxed pt-1">{point}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};