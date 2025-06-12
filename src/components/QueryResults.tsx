import React, { useState } from 'react';
import { Code, ChevronDown, ChevronUp, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { QueryResult } from '../types/query';
import { ChartVisualization } from './ChartVisualization';
import { ExecutiveSummary } from './ExecutiveSummary';
import { FeedbackButtons } from './FeedbackButtons';
import { SlideVisualization } from './SlideVisualization';

interface QueryResultsProps {
  query: string;
  result: QueryResult;
  showSlide?: boolean;
}

export const QueryResults: React.FC<QueryResultsProps> = ({ query, result, showSlide }) => {
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6 px-6">
      {/* SQL Display */}
      <div className="bg-white rounded-lg shadow-md">
        <button
          onClick={() => setShowSQL(!showSQL)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Generated SQL Query</span>
          </div>
          {showSQL ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>
        
        {showSQL && (
          <div className="px-6 pb-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{result.sql}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Main Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ChartVisualization chart={result.chart} />
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          {result.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3">
              {insight.type === 'positive' ? (
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              ) : insight.type === 'negative' ? (
                <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              )}
              <p className="text-gray-700">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary summary={result.summary} confidence={result.confidence} />

      {/* Slide Visualization */}
      {showSlide && result.slideHTML && (
        <SlideVisualization slideHTML={result.slideHTML} title={query} />
      )}

      {/* Next Steps */}
      {result.nextSteps && result.nextSteps.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Suggested Next Steps</h3>
          <ul className="space-y-2">
            {result.nextSteps.map((step, index) => (
              <li key={index} className="flex items-center space-x-2 text-blue-800">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      <FeedbackButtons />
    </div>
  );
};