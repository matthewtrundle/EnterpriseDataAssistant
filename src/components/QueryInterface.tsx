import React, { useState } from 'react';
import { Search, TrendingUp, Users, BarChart, Calendar, Map } from 'lucide-react';

interface QueryInterfaceProps {
  onQuery: (query: string) => void;
  isLoading: boolean;
}

const preBuiltQueries = [
  {
    text: "What are my revenue trends this year?",
    icon: TrendingUp,
    description: "Analyze revenue patterns"
  },
  {
    text: "Which products are top sellers?",
    icon: BarChart,
    description: "Product performance"
  },
  {
    text: "Show me sales by region",
    icon: Map,
    description: "Regional breakdown"
  },
  {
    text: "Who are my top sales reps?",
    icon: Users,
    description: "Team performance"
  },
  {
    text: "Compare Q4 to previous quarters",
    icon: Calendar,
    description: "Quarterly analysis"
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
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Ask Your Data Anything</h2>
        <p className="text-neutral-600 text-lg">Natural language queries powered by advanced AI</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-neutral-200/50 overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your data..."
              className="w-full px-8 py-6 pr-16 text-lg text-neutral-900 placeholder-neutral-400 
                       focus:outline-none focus:ring-4 focus:ring-brand-500/20 
                       transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       bg-gradient-to-r from-brand-600 to-brand-700 text-white 
                       p-3 rounded-xl shadow-lg hover:shadow-xl
                       hover:scale-105 active:scale-95
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Popular Queries</h3>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-neutral-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preBuiltQueries.map((preBuilt, index) => (
            <button
              key={index}
              onClick={() => handlePreBuiltQuery(preBuilt.text)}
              disabled={isLoading}
              className="group relative bg-white rounded-xl p-5 border border-neutral-200 
                       hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5
                       transition-all duration-200 text-left overflow-hidden
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start">
                <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg 
                              group-hover:from-brand-200 group-hover:to-brand-300 transition-colors">
                  <preBuilt.icon className="w-5 h-5 text-brand-700" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-neutral-900 text-sm mb-1 group-hover:text-brand-900 transition-colors">
                    {preBuilt.text}
                  </p>
                  <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors">
                    {preBuilt.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};