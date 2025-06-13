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
    <div className="max-w-4xl mx-auto px-6 mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Try with Demo Data</h2>
          <p className="text-gray-600">
            Explore the AI Agent's capabilities with our pre-loaded sales dataset
          </p>
        </div>

        <button
          onClick={handleDemoClick}
          className="w-full bg-white hover:bg-gray-50 border-2 border-blue-300 rounded-lg p-6 transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Sales Analytics Demo
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  12 months of sales data with regional performance, product categories, and customer segments
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Revenue Trends
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Users className="w-3 h-3 mr-1" />
                    Customer Analysis
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Package className="w-3 h-3 mr-1" />
                    Product Performance
                  </span>
                </div>
              </div>
            </div>
            <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          Perfect for testing queries like "What are my top performing regions?" or "Show me revenue trends"
        </div>
      </div>
    </div>
  );
};