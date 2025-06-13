import React, { useState } from 'react';
import { QueryInterface } from './components/QueryInterface';
import { DataSourceStatus } from './components/DataSourceStatus';
import { QueryResults } from './components/QueryResults';
import { DataUploader } from './components/DataUploader';
import { DataPreview } from './components/DataPreview';
import { DemoDataOption } from './components/DemoDataOption';
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
  const [useDemo, setUseDemo] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-brand-50/30 to-accent-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto py-8 relative z-10">
        {!hasData ? (
          <>
            <div className="max-w-4xl mx-auto mb-12 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/30 mb-6 animate-float">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="text-gradient">Enterprise Data</span>
                <span className="text-neutral-900"> AI Agent</span>
              </h1>
              <p className="text-xl text-neutral-600 font-light">
                Transform your data into insights with AI-powered analysis
              </p>
            </div>
            <DemoDataOption onDemoSelect={handleDataLoaded} />
            <div className="max-w-4xl mx-auto text-center mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-neutral-300"></div>
                <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">OR</p>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-neutral-300"></div>
              </div>
            </div>
            <DataUploader onDataLoaded={handleDataLoaded} />
          </>
        ) : (
          <>
            <DataSourceStatus customFileName={dataFileName} />
            <DataPreview data={uploadedData} fileName={dataFileName} />
            <QueryInterface onQuery={handleQuery} isLoading={isLoading} />
            
            {isLoading && (
              <div className="max-w-4xl mx-auto mt-8 animate-slide-up">
                <div className="glass-card rounded-2xl p-8 shadow-xl border border-white/50">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-200"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-3 border-brand-600 border-t-transparent"></div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-neutral-900">Analyzing your data...</p>
                      <p className="text-sm text-neutral-500">This may take a few moments</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
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