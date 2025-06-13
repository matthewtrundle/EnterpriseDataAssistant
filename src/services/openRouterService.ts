interface AnalysisRequest {
  query: string;
  dataSchema: any;
  sampleData: any[];
}

interface AnalysisResponse {
  sql: string;
  visualization: {
    type: 'line' | 'bar' | 'pie' | 'scatter' | 'table' | 'heatmap';
    config: any;
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    text: string;
  }>;
  summary: string[];
  confidence: number;
  slideHTML?: string;
}

export class OpenRouterService {
  private apiKey: string | null = null;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || null;
    console.log('=== OpenRouter API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (this.apiKey) {
      console.log('=== API Key prefix:', this.apiKey.substring(0, 10) + '...');
    }
  }

  async analyzeQuery(request: AnalysisRequest): Promise<AnalysisResponse> {
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured, using mock response');
      return this.getMockResponse(request.query);
    }

    try {
      // Analyze the data structure first
      const sampleItem = request.sampleData[0] || {};
      const actualColumns = Object.keys(sampleItem);
      const numericColumns = actualColumns.filter(col => 
        typeof sampleItem[col] === 'number' || !isNaN(parseFloat(sampleItem[col]))
      );
      const stringColumns = actualColumns.filter(col => 
        typeof sampleItem[col] === 'string' && isNaN(parseFloat(sampleItem[col]))
      );
      const dateColumns = actualColumns.filter(col => {
        const val = sampleItem[col];
        return typeof val === 'string' && !isNaN(Date.parse(val)) && val.includes('-');
      });

      const prompt = `You are a senior business analyst preparing insights for C-level executives. Analyze this data and provide strategic, actionable insights.

User Query: "${request.query}"

ACTUAL Data Columns Available:
- Numeric columns: ${numericColumns.join(', ')}
- Text columns: ${stringColumns.join(', ')}
- Date columns: ${dateColumns.join(', ')}

Sample Data (first 5 rows):
${JSON.stringify(request.sampleData.slice(0, 5), null, 2)}

CRITICAL INSTRUCTIONS:
1. Use ONLY the column names that actually exist in the data above
2. For chart visualization, use EXACT column names from the data
3. Do NOT invent column names like 'total_revenue' or 'avg_revenue' unless you see them in the actual data
4. For aggregations, use the RAW column names (e.g., 'revenue' not 'total_revenue')

Provide a JSON response with:
1. sql: A SQL query using the actual column names
2. visualization: {
   type: Choose based on query:
     - 'bar' for comparing categories (products, regions, segments)
     - 'line' for time-based trends (requires date column)
     - 'pie' for showing proportions (max 8 categories)
     - 'table' for detailed data
   config: {
     xKey: MUST be an actual column name from the data
     yKey: MUST be an actual column name from the data (we will handle aggregation)
     // For pie charts:
     nameKey: actual column for categories
     valueKey: actual numeric column
   }
}
3. insights: Array of 3-5 insight objects with 'type' and 'text' fields
4. summary: Array of 3-4 complete sentences (strings only)
5. confidence: 85-95

Query Analysis Hints:
- If query mentions "trend" or "over time" → use 'line' chart with date on x-axis
- If query mentions "by product/region/segment" → use 'bar' chart with that category on x-axis
- If query mentions "breakdown" or "distribution" → consider 'pie' chart
- For revenue queries → use 'revenue' column
- For quantity queries → use 'quantity' column
- For profit queries → use 'profit_margin' column

Return ONLY valid JSON.`;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'http://localhost:3000',
          'X-Title': 'Enterprise Data AI Agent'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('OpenRouter API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        }
        
        throw new Error(`OpenRouter API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('OpenRouter raw response:', data);
      
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          // Try to parse the entire content as JSON first
          const parsed = JSON.parse(content);
          console.log('Parsed response:', parsed);
          
          // Ensure we have the required structure and normalize insights
          const normalizedInsights = (parsed.insights || []).map((insight: any) => {
            // Handle different insight formats from AI
            if (typeof insight === 'string') {
              return { type: 'neutral', text: insight };
            } else if (insight.content && insight.type) {
              return { type: insight.type, text: insight.content };
            } else if (insight.text && insight.type) {
              return insight;
            } else {
              return { type: 'neutral', text: JSON.stringify(insight) };
            }
          });
          
          // Validate and fix visualization config
          let visualization = parsed.visualization || {
            type: 'bar',
            config: { xKey: 'product_category', yKey: 'revenue' }
          };
          
          // CRITICAL: Validate that the suggested keys exist in the actual data
          const sampleItem = request.sampleData[0] || {};
          const availableColumns = Object.keys(sampleItem);
          
          // Fix xKey if it doesn't exist
          if (visualization.config?.xKey && !availableColumns.includes(visualization.config.xKey)) {
            console.warn(`xKey '${visualization.config.xKey}' not found in data. Available columns:`, availableColumns);
            // Smart fallback
            if (visualization.type === 'line') {
              visualization.config.xKey = availableColumns.find(col => col.includes('date')) || availableColumns[0];
            } else {
              visualization.config.xKey = availableColumns.find(col => 
                col.includes('category') || col.includes('name') || col.includes('region')
              ) || availableColumns[0];
            }
          }
          
          // Fix yKey if it doesn't exist
          if (visualization.config?.yKey && !availableColumns.includes(visualization.config.yKey)) {
            console.warn(`yKey '${visualization.config.yKey}' not found in data.`);
            // Remove aggregation prefixes and try to find the base field
            const baseField = visualization.config.yKey
              .replace(/^(total_|avg_|sum_|average_|count_)/, '');
            
            if (availableColumns.includes(baseField)) {
              visualization.config.yKey = baseField;
            } else {
              // Find any numeric field
              const numericField = availableColumns.find(col => 
                typeof sampleItem[col] === 'number' || !isNaN(parseFloat(sampleItem[col]))
              );
              visualization.config.yKey = numericField || 'value';
            }
          }
          
          // Query-based chart type validation
          const query = request.query.toLowerCase();
          if ((query.includes('trend') || query.includes('over time') || query.includes('monthly')) && 
              availableColumns.some(col => col.includes('date'))) {
            visualization.type = 'line';
            visualization.config.xKey = availableColumns.find(col => col.includes('date')) || visualization.config.xKey;
          } else if (query.includes('breakdown') || query.includes('distribution')) {
            visualization.type = 'pie';
            visualization.config.nameKey = visualization.config.xKey;
            visualization.config.valueKey = visualization.config.yKey;
          }
          
          const result = {
            sql: parsed.sql || `SELECT * FROM sales_data WHERE query = '${request.query}'`,
            visualization,
            insights: normalizedInsights.length > 0 ? normalizedInsights : [{
              type: 'neutral',
              text: 'Analysis completed successfully'
            }],
            summary: Array.isArray(parsed.summary) ? parsed.summary.map((item: any) => {
              // Handle different summary formats
              if (typeof item === 'string') {
                return item;
              } else if (item.text) {
                return item.text;
              } else if (item.metric && item.strategic_implication) {
                return `${item.metric} - ${item.strategic_implication}`;
              } else {
                return JSON.stringify(item);
              }
            }) : ['Data analyzed', 'Results generated'],
            confidence: parsed.confidence || 85
          };
          
          return result;
        } catch (e) {
          console.error('Failed to parse OpenRouter response:', e);
          console.log('Content was:', content);
          
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              return {
                ...parsed,
                slideHTML: parsed.slideHTML || this.generateSlideHTML(
                  request.query,
                  parsed.insights?.[0]?.text || 'Data Analysis Complete'
                )
              };
            } catch (e2) {
              console.error('Failed to parse extracted JSON:', e2);
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
    }

    return this.getMockResponse(request.query);
  }

  private getMockResponse(query: string): AnalysisResponse {
    return {
      sql: `SELECT * FROM data WHERE query LIKE '%${query}%' LIMIT 100;`,
      visualization: {
        type: 'bar',
        config: {
          xKey: 'category',
          yKey: 'value'
        }
      },
      insights: [
        {
          type: 'neutral',
          text: 'Configure REACT_APP_OPENROUTER_API_KEY for AI-powered analysis'
        }
      ],
      summary: [
        'Upload your data to get started',
        'Ask any business question in natural language',
        'Get instant visualizations and insights'
      ],
      confidence: 75,
      slideHTML: this.generateSlideHTML('Demo Mode', 'Configure API key for real analysis')
    };
  }

  generateSlideHTML(title: string, content: string): string {
    return `
      <div class="slide-container" style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 3rem;
        position: relative;
        overflow: hidden;
      ">
        <div class="slide-bg-pattern" style="
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 50px 50px;
          transform: rotate(45deg);
          opacity: 0.3;
        "></div>
        
        <h1 style="
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        ">${title}</h1>
        
        <div style="
          font-size: 1.5rem;
          line-height: 1.8;
          text-align: center;
          max-width: 800px;
          position: relative;
          z-index: 1;
        ">${content}</div>
        
        <div class="slide-footer" style="
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          font-size: 0.875rem;
          opacity: 0.8;
        ">
          Generated by Enterprise Data AI Agent
        </div>
      </div>
    `;
  }
}