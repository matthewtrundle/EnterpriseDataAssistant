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
    <div className="max-w-6xl mx-auto mt-8 space-y-6 px-6 animate-fade-in">
      {/* SQL Display */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden hover-lift">
        <button
          onClick={() => setShowSQL(!showSQL)}
          className="w-full px-8 py-5 flex items-center justify-between hover:bg-neutral-50 transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg">
              <Code className="w-5 h-5 text-brand-700" />
            </div>
            <span className="font-semibold text-neutral-900">Generated SQL Query</span>
          </div>
          <div className={`transform transition-transform duration-200 ${showSQL ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5 text-neutral-500" />
          </div>
        </button>
        
        {showSQL && (
          <div className="px-8 pb-6 animate-slide-up">
            <div className="relative">
              <pre className="bg-neutral-950 text-neutral-100 p-6 rounded-xl overflow-x-auto text-sm font-mono shadow-inner custom-scrollbar">
                <code className="text-brand-300">{result.sql}</code>
              </pre>
              <div className="absolute top-3 right-3">
                <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Visualization */}
      <div className="bg-white rounded-2xl shadow-medium border border-neutral-100 p-8 hover-lift">
        <ChartVisualization chart={result.chart} />
      </div>

      {/* Insights */}
      <div className="bg-white rounded-2xl shadow-medium border border-neutral-100 p-8 hover-lift">
        <h3 className="text-xl font-bold text-neutral-900 mb-6">Key Insights</h3>
        <div className="space-y-4">
          {result.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
              <div className={`p-2 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-100' : 
                insight.type === 'negative' ? 'bg-red-100' : 
                'bg-amber-100'
              }`}>
                {insight.type === 'positive' ? (
                  <TrendingUp className="w-5 h-5 text-green-700" />
                ) : insight.type === 'negative' ? (
                  <TrendingDown className="w-5 h-5 text-red-700" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                )}
              </div>
              <p className="text-neutral-700 leading-relaxed flex-1">{insight.text}</p>
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
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-600"></div>
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-8">
            <h3 className="text-xl font-bold text-white mb-5">Suggested Next Steps</h3>
            <ul className="space-y-3">
              {result.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3 text-white/90">
                  <div className="mt-1.5">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </div>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Feedback */}
      <FeedbackButtons />
    </div>
  );
};