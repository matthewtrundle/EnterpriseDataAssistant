import React from 'react';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { generateDemoSalesData } from '../data/demoSalesData';

interface DemoDataOptionProps {
  onDemoSelect: (data: any[], fileName: string) => void;
}

export const DemoDataOption: React.FC<DemoDataOptionProps> = ({ onDemoSelect }) => {
  const handleDemoClick = () => {
    const demoData = generateDemoSalesData();
    onDemoSelect(demoData, 'Sales Analytics Demo Data');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mb-8 animate-slide-up">
      <div className="relative overflow-hidden rounded-3xl">
        {/* Gradient background with glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Try with Demo Data</h2>
            <p className="text-brand-100 text-lg">
              Explore the AI Agent's capabilities with our pre-loaded sales dataset
            </p>
          </div>

          <button
            onClick={handleDemoClick}
            className="w-full bg-white/95 backdrop-blur-sm hover:bg-white
                     rounded-2xl p-8 shadow-2xl hover:shadow-3xl
                     transform hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-brand-500 to-brand-600 p-4 rounded-xl shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-brand-700 transition-colors">
                    Sales Analytics Demo
                  </h3>
                  <p className="text-base text-neutral-600 mb-4">
                    12 months of comprehensive sales data with regional performance, product categories, and customer segments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                      <TrendingUp className="w-3 h-3 mr-1.5" />
                      Revenue Trends
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200">
                      <Users className="w-3 h-3 mr-1.5" />
                      Customer Analysis
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200">
                      <Package className="w-3 h-3 mr-1.5" />
                      Product Performance
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-brand-100 p-3 rounded-full text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-brand-100">
              Perfect for testing queries like "What are my top performing regions?" or "Show me revenue trends"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};