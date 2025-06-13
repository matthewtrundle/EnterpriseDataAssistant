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
      const prompt = `You are a senior business analyst preparing insights for C-level executives. Analyze this data and provide strategic, actionable insights.

User Query: "${request.query}"

Data Schema:
${JSON.stringify(request.dataSchema, null, 2)}

Sample Data (first 10 rows):
${JSON.stringify(request.sampleData.slice(0, 10), null, 2)}

IMPORTANT: The data contains the following key columns:
- revenue: monetary value
- quantity: number of units
- product_category/product_name: product information
- region/country: geographic data
- customer_segment: customer type
- date: temporal data
- profit_margin: profitability percentage

Provide a JSON response with:
1. sql: A proper SQL query that would answer the question
2. visualization: {
   type: Choose 'bar' for categories/comparisons, 'line' for time trends, 'pie' for proportions,
   config: {
     xKey: EXACT column name for x-axis from the data (for products use 'product_name' or 'product_category', for time use 'date', for regions use 'region'),
     yKey: EXACT column name for y-axis (usually 'revenue' or 'quantity' or 'profit')
   }
}
3. insights: Array of 3-5 objects, each with:
   - type: 'positive' or 'negative' or 'neutral'
   - text: A string with the insight (e.g., "Q4 revenue of $2.3M represents 35% YoY growth, driven by Enterprise segment expansion")
4. summary: Array of 3-4 STRINGS (not objects), each being a complete sentence like:
   - "Total revenue reached $12.4M, up 23% YoY with Technology products leading growth"
   - "North America region accounts for 45% of revenue but shows signs of saturation"
   - "Recommend focusing on Asia Pacific expansion where we see 40% QoQ growth"
5. confidence: 85-95 (be confident in your analysis)

Return ONLY valid JSON, no other text.`;

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
          
          // If the query is about products, ensure we're not using date as xKey
          if (request.query.toLowerCase().includes('product') && 
              visualization.config?.xKey === 'date') {
            visualization.config.xKey = 'product_name';
            visualization.type = 'bar';
          }
          
          // If the query is about time/trends, use line chart
          if ((request.query.toLowerCase().includes('trend') || 
               request.query.toLowerCase().includes('over time') ||
               request.query.toLowerCase().includes('monthly')) && 
              visualization.type !== 'line') {
            visualization.type = 'line';
            visualization.config.xKey = 'date';
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