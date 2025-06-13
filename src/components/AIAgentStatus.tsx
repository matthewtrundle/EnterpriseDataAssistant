import React from 'react';
import { Brain, Database, Palette } from 'lucide-react';

export const AIAgentStatus: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-4 
                      transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full 
                          flex items-center justify-center border-2 border-white shadow-lg
                          animate-float">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full 
                          flex items-center justify-center border-2 border-white shadow-lg
                          animate-float animation-delay-200">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full 
                          flex items-center justify-center border-2 border-white shadow-lg
                          animate-float animation-delay-400">
              <Palette className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">3 AI Agents Active</p>
            <p className="text-xs text-gray-500">Ready to analyze</p>
          </div>
        </div>
      </div>
    </div>
  );
};