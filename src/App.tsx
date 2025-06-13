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
    console.log('=== Starting query:', query);
    console.log('=== Has uploaded data:', !!uploadedData, uploadedData?.length);
    
    setIsLoading(true);
    setCurrentQuery(query);
    
    try {
      let result: QueryResult;
      
      if (uploadedData && uploadedData.length > 0) {
        // Use Claude for analysis if data is uploaded
        const schema = Object.keys(uploadedData[0] || {});
        console.log('=== Schema:', schema);
        console.log('=== Calling OpenRouter API...');
        
        const analysisResult = await openRouterService.analyzeQuery({
          query,
          dataSchema: schema,
          sampleData: uploadedData
        });
        
        console.log('=== Analysis result:', analysisResult);
        
        result = {
          ...analysisResult,
          chart: {
            type: analysisResult.visualization?.type || 'bar',
            data: processDataForVisualization(uploadedData, analysisResult.visualization),
            xKey: analysisResult.visualization?.config?.xKey,
            yKey: analysisResult.visualization?.config?.yKey,
            nameKey: analysisResult.visualization?.config?.nameKey,
            valueKey: analysisResult.visualization?.config?.valueKey
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
    const type = vizConfig?.type || 'bar';
    const config = vizConfig?.config || {};
    
    console.log('Processing data for visualization:', { type, config, sampleData: data.slice(0, 3) });
    
    // For pie charts, group by category
    if (type === 'pie') {
      const groupField = config.groupBy || config.nameKey || 'product_category';
      const valueField = config.valueKey || 'revenue';
      
      const grouped = data.reduce((acc, item) => {
        const key = item[groupField] || 'Other';
        if (!acc[key]) acc[key] = 0;
        acc[key] += typeof item[valueField] === 'number' ? item[valueField] : 1;
        return acc;
      }, {});
      
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value as number) - (a.value as number))
        .slice(0, 10); // Top 10 for pie charts
    }
    
    // For bar charts, aggregate by x-axis
    if (type === 'bar') {
      const xKey = config.xKey || 'product_category';
      const yKey = config.yKey || 'revenue';
      
      console.log(`Processing bar chart with xKey: ${xKey}, yKey: ${yKey}`);
      
      const grouped = data.reduce((acc, item) => {
        const key = item[xKey] || 'Other';
        if (!acc[key]) {
          acc[key] = { 
            [xKey]: key, 
            [yKey]: 0, 
            count: 0,
            total_revenue: 0,
            total_quantity: 0 
          };
        }
        
        // Handle different possible y-axis values
        if (yKey === 'revenue' || yKey === 'total_revenue' || yKey === 'avg_revenue') {
          acc[key].revenue = (acc[key].revenue || 0) + (item.revenue || 0);
          acc[key].total_revenue = (acc[key].total_revenue || 0) + (item.revenue || 0);
          acc[key].count += 1;
          // Calculate average
          acc[key].avg_revenue = acc[key].total_revenue / acc[key].count;
        } else if (yKey === 'quantity' || yKey === 'total_quantity' || yKey === 'avg_quantity') {
          acc[key].quantity = (acc[key].quantity || 0) + (item.quantity || 0);
          acc[key].total_quantity = (acc[key].total_quantity || 0) + (item.quantity || 0);
          acc[key].count += 1;
          // Calculate average
          acc[key].avg_quantity = acc[key].total_quantity / acc[key].count;
        } else if (yKey === 'profit' || yKey === 'avg_profit_margin') {
          const revenue = item.revenue || 0;
          const margin = item.profit_margin || 0;
          acc[key].profit = (acc[key].profit || 0) + (revenue * margin);
          acc[key].total_profit_margin = (acc[key].total_profit_margin || 0) + margin;
          acc[key].count += 1;
          // Calculate average profit margin
          acc[key].avg_profit_margin = acc[key].total_profit_margin / acc[key].count;
        } else {
          acc[key][yKey] = (acc[key][yKey] || 0) + (typeof item[yKey] === 'number' ? item[yKey] : 0);
          acc[key].count += 1;
        }
        return acc;
      }, {});
      
      const result = Object.values(grouped)
        .map((item: any) => ({
          ...item,
          // Ensure all possible y-axis values are present
          revenue: item.revenue || 0,
          total_revenue: item.total_revenue || item.revenue || 0,
          avg_revenue: item.avg_revenue || item.revenue || 0,
          quantity: item.quantity || 0,
          total_quantity: item.total_quantity || item.quantity || 0,
          avg_quantity: item.avg_quantity || item.quantity || 0,
          avg_profit_margin: item.avg_profit_margin || 0,
          // Round the specific yKey value
          [yKey]: Math.round((item[yKey] || 0) * 100) / 100
        }))
        .sort((a: any, b: any) => b[yKey] - a[yKey])
        .slice(0, 10); // Top 10 for cleaner visualization
        
      console.log('Bar chart data:', result);
      return result;
    }
    
    // For line charts, ensure data is sorted by date
    if (type === 'line') {
      const xKey = config.xKey || 'date';
      const yKey = config.yKey || 'revenue';
      
      // Aggregate by date if needed
      const grouped = data.reduce((acc, item) => {
        const key = item[xKey];
        if (!acc[key]) acc[key] = { [xKey]: key, [yKey]: 0, count: 0 };
        acc[key][yKey] += typeof item[yKey] === 'number' ? item[yKey] : 0;
        acc[key].count += 1;
        return acc;
      }, {});
      
      return Object.values(grouped)
        .map((item: any) => ({
          ...item,
          [yKey]: Math.round(item[yKey] * 100) / 100
        }))
        .sort((a: any, b: any) => {
          if (a[xKey] < b[xKey]) return -1;
          if (a[xKey] > b[xKey]) return 1;
          return 0;
        });
    }
    
    // For tables and other types, return top rows
    return data.slice(0, 50);
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