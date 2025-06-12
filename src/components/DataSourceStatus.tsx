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
    <div className="max-w-4xl mx-auto mb-6 px-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600">Data Sources:</span>
        <div className="flex space-x-4">
          {dataSources.map((source) => (
            <div key={source.name} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <source.icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{source.name}</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">{source.lastSync}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};