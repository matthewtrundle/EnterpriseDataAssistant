import React, { useState } from 'react';
import { QueryInterface } from './components/QueryInterface';
import { DataSourceStatus } from './components/DataSourceStatus';
import { QueryResults } from './components/QueryResults';
import { DataUploader } from './components/DataUploader';
import { DataPreview } from './components/DataPreview';
import { processQuery } from './services/queryProcessor';
import { OpenRouterService } from './services/openRouterService';
import { QueryResult } from './types/query';
import { getMockData } from './data/mockDataStore';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [dataFileName, setDataFileName] = useState<string>('');
  const openRouterService = new OpenRouterService();

  const handleDataLoaded = (data: any[], fileName: string) => {
    setUploadedData(data);
    setDataFileName(fileName);
    setQueryResult(null); // Clear previous results
  };

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setCurrentQuery(query);
    
    try {
      let result: QueryResult;
      
      if (uploadedData && uploadedData.length > 0) {
        // Use Claude for analysis if data is uploaded
        const schema = Object.keys(uploadedData[0] || {});
        const analysisResult = await openRouterService.analyzeQuery({
          query,
          dataSchema: schema,
          sampleData: uploadedData
        });
        
        result = {
          ...analysisResult,
          chart: {
            ...analysisResult.visualization,
            data: processDataForVisualization(uploadedData, analysisResult.visualization)
          }
        };
      } else {
        // Use mock data and hardcoded responses
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = processQuery(query);
      }
      
      setQueryResult(result);
    } catch (error) {
      console.error('Query processing error:', error);
      setQueryResult({
        sql: 'ERROR: Failed to process query',
        chart: { type: 'table', data: [{ error: 'An error occurred while processing your query' }] },
        insights: [{ type: 'negative', text: 'Unable to analyze query. Please try again.' }],
        summary: ['Query processing failed'],
        confidence: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processDataForVisualization = (data: any[], vizConfig: any) => {
    // Simple data processing based on visualization type
    if (vizConfig.type === 'pie') {
      // Group data by a category field if available
      const groupField = vizConfig.config?.groupBy || Object.keys(data[0])[0];
      const grouped = data.reduce((acc, item) => {
        const key = item[groupField];
        if (!acc[key]) acc[key] = 0;
        acc[key]++;
        return acc;
      }, {});
      
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }
    
    // For other chart types, return the data as-is
    return data.slice(0, 50); // Limit to 50 rows for performance
  };

  const hasData = uploadedData && uploadedData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {!hasData ? (
          <>
            <div className="max-w-4xl mx-auto mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Data Assistant</h1>
              <p className="text-xl text-gray-600">
                Upload your data or use our demo dataset to get started
              </p>
            </div>
            <DataUploader onDataLoaded={handleDataLoaded} />
          </>
        ) : (
          <>
            <DataSourceStatus customFileName={dataFileName} />
            <DataPreview data={uploadedData} fileName={dataFileName} />
            <QueryInterface onQuery={handleQuery} isLoading={isLoading} />
            
            {isLoading && (
              <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Analyzing your data...</p>
                </div>
              </div>
            )}
            
            {queryResult && !isLoading && (
              <QueryResults 
                query={currentQuery} 
                result={queryResult}
                showSlide={!!queryResult.slideHTML}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;