import React, { useState } from 'react';
import { QueryInterface } from './components/QueryInterface';
import { DataSourceStatus } from './components/DataSourceStatus';
import { QueryResults } from './components/QueryResults';
import { DataUploader } from './components/DataUploader';
import { DataPreview } from './components/DataPreview';
import { DemoDataOption } from './components/DemoDataOption';
import { AIAgentProgress } from './components/AIAgentProgress';
import { AIAgentStatus } from './components/AIAgentStatus';
import { processQuery } from './services/queryProcessor';
import { OpenRouterService } from './services/openRouterService';
import { QueryResult } from './types/query';
import { getMockData } from './data/mockDataStore';
import { DataValidator } from './services/dataValidator';
import { DataAggregator } from './services/dataAggregator';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [dataFileName, setDataFileName] = useState<string>('');
  const [useDemo, setUseDemo] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
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
    setShowAgents(true);
    
    // Wait for agent animation to start
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
        
        // First validate the chart configuration
        const chartConfig = {
          type: analysisResult.visualization?.type || 'bar',
          data: [],
          xKey: analysisResult.visualization?.config?.xKey,
          yKey: analysisResult.visualization?.config?.yKey,
          nameKey: analysisResult.visualization?.config?.nameKey,
          valueKey: analysisResult.visualization?.config?.valueKey
        };
        
        const validationResult = DataValidator.validateChartData(
          chartConfig,
          uploadedData,
          query
        );
        
        const correctedChart = validationResult.correctedChart || chartConfig;
        
        // Process data with corrected configuration
        const processedData = processDataForVisualization(uploadedData, {
          type: correctedChart.type,
          config: {
            xKey: correctedChart.xKey,
            yKey: correctedChart.yKey,
            nameKey: correctedChart.nameKey,
            valueKey: correctedChart.valueKey
          }
        });
        
        result = {
          ...analysisResult,
          chart: {
            type: correctedChart.type,
            data: processedData,
            xKey: correctedChart.xKey,
            yKey: correctedChart.yKey,
            nameKey: correctedChart.nameKey,
            valueKey: correctedChart.valueKey
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
      // Wait for agents to complete their animation
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsLoading(false);
      setShowAgents(false);
    }
  };

  const processDataForVisualization = (data: any[], vizConfig: any) => {
    const type = vizConfig?.type || 'bar';
    const config = vizConfig?.config || {};
    
    console.log('Processing data for visualization:', { type, config, sampleData: data.slice(0, 3) });
    
    // Validate chart configuration against actual data
    const validationResult = DataValidator.validateChartData(
      {
        type,
        data: [],
        xKey: config.xKey,
        yKey: config.yKey,
        nameKey: config.nameKey,
        valueKey: config.valueKey
      },
      data,
      currentQuery
    );
    
    // Use corrected chart config if validation found issues
    const correctedConfig = validationResult.correctedChart || { type, ...config };
    console.log('Corrected config:', correctedConfig);
    
    // Use DataAggregator for consistent data preparation
    const preparedData = DataAggregator.prepareForChart(
      data,
      correctedConfig.type as any,
      correctedConfig.xKey || config.xKey || 'category',
      correctedConfig.yKey || config.yKey || 'value',
      currentQuery
    );
    
    console.log('Prepared data:', preparedData.slice(0, 5));
    return preparedData;
  };

  const hasData = uploadedData && uploadedData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-brand-50/30 to-accent-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* AI Agent Status Indicator */}
      <AIAgentStatus />
      
      <div className="container mx-auto py-8 relative z-10">
        {!hasData ? (
          <>
            <div className="max-w-4xl mx-auto mb-12 text-center animate-fade-in">
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Animated background rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-brand-400/20 rounded-full animate-ping"></div>
                  <div className="absolute w-24 h-24 bg-brand-500/20 rounded-full animate-ping animation-delay-200"></div>
                </div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 rounded-2xl shadow-2xl shadow-brand-500/30 animate-float">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="text-gradient">Enterprise Data</span>
                <span className="text-neutral-900"> AI Agent</span>
              </h1>
              <p className="text-xl text-neutral-600 font-light mb-6">
                Transform your data into insights with AI-powered analysis
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>3 AI AGENTS ACTIVE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span>Executive-Ready Insights</span>
                </div>
              </div>
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
            
            {showAgents && (
              <AIAgentProgress 
                isActive={showAgents} 
                onComplete={() => console.log('Agents completed')}
              />
            )}
            
            {isLoading && !showAgents && (
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