import React from 'react';
import { Database, Cloud, CheckCircle, FileSpreadsheet } from 'lucide-react';

interface DataSourceStatusProps {
  customFileName?: string;
}

export const DataSourceStatus: React.FC<DataSourceStatusProps> = ({ customFileName }) => {
  const dataSources = customFileName ? [
    {
      name: customFileName,
      icon: FileSpreadsheet,
      status: 'connected',
      lastSync: 'Just now',
      records: 'Uploaded file'
    }
  ] : [
    {
      name: 'Snowflake',
      icon: Database,
      status: 'connected',
      lastSync: '2 mins ago',
      records: '2.3M records'
    },
    {
      name: 'Salesforce',
      icon: Cloud,
      status: 'connected',
      lastSync: '5 mins ago',
      records: '45K records'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-6 px-6 animate-fade-in">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-neutral-100 shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg">
            <Database className="w-5 h-5 text-brand-700" />
          </div>
          <span className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Connected Sources</span>
        </div>
        <div className="flex space-x-3">
          {dataSources.map((source) => (
            <div key={source.name} className="group flex items-center space-x-3 bg-gradient-to-r from-neutral-50 to-brand-50 px-5 py-2.5 rounded-xl border border-brand-200 hover:border-brand-300 hover:shadow-md transition-all">
              <div className="flex items-center space-x-2">
                <source.icon className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-neutral-800">{source.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                  <CheckCircle className="relative w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs text-neutral-500 font-medium">{source.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};