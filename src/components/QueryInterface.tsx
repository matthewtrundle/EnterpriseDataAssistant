import React, { useState } from 'react';
import { Search, TrendingUp, Users, BarChart, Calendar, Map } from 'lucide-react';

interface QueryInterfaceProps {
  onQuery: (query: string) => void;
  isLoading: boolean;
}

const preBuiltQueries = [
  {
    text: "Why did revenue drop last month?",
    icon: TrendingUp,
    description: "Analyze revenue trends"
  },
  {
    text: "Which customers are at risk of churning?",
    icon: Users,
    description: "Identify at-risk customers"
  },
  {
    text: "What's our best performing product feature?",
    icon: BarChart,
    description: "Feature usage analysis"
  },
  {
    text: "Compare this quarter to last quarter",
    icon: Calendar,
    description: "Quarter-over-quarter analysis"
  },
  {
    text: "Show me sales by region",
    icon: Map,
    description: "Regional performance"
  }
];

export const QueryInterface: React.FC<QueryInterfaceProps> = ({ onQuery, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuery(query);
    }
  };

  const handlePreBuiltQuery = (queryText: string) => {
    setQuery(queryText);
    onQuery(queryText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Data Assistant</h1>
        <p className="text-gray-600">Ask questions about your business data in plain English</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Common Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {preBuiltQueries.map((preBuilt, index) => (
            <button
              key={index}
              onClick={() => handlePreBuiltQuery(preBuilt.text)}
              disabled={isLoading}
              className="flex items-start p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <preBuilt.icon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{preBuilt.text}</p>
                <p className="text-xs text-gray-500 mt-1">{preBuilt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};