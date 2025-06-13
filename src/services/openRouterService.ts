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
  }

  async analyzeQuery(request: AnalysisRequest): Promise<AnalysisResponse> {
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured, using mock response');
      return this.getMockResponse(request.query);
    }

    try {
      const prompt = `You are a data analyst assistant. Analyze this business question and provide insights.

User Query: "${request.query}"

Data Schema:
${JSON.stringify(request.dataSchema, null, 2)}

Sample Data (first 5 rows):
${JSON.stringify(request.sampleData.slice(0, 5), null, 2)}

Please respond with a JSON object containing:
1. sql: A SQL query that would answer the question
2. visualization: An object with:
   - type: One of 'line', 'bar', 'pie', 'scatter', 'table', 'heatmap'
   - config: Configuration for the chart (xKey, yKey, etc.)
3. insights: Array of insights with type ('positive', 'negative', 'neutral') and text
4. summary: Array of 3-4 executive summary points
5. confidence: A number 0-100 indicating confidence in the analysis
6. slideHTML: Optional HTML for a presentation slide

Ensure the response is valid JSON only, no other text.`;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Enterprise Data Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-sonnet',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenRouter raw response:', data);
      
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          // Try to parse the entire content as JSON first
          const parsed = JSON.parse(content);
          console.log('Parsed response:', parsed);
          
          // Ensure we have the required structure
          const result = {
            sql: parsed.sql || `SELECT * FROM sales_data WHERE query = '${request.query}'`,
            visualization: parsed.visualization || {
              type: 'bar',
              config: { xKey: 'product_category', yKey: 'revenue' }
            },
            insights: parsed.insights || [{
              type: 'neutral',
              text: 'Analysis completed successfully'
            }],
            summary: parsed.summary || ['Data analyzed', 'Results generated'],
            confidence: parsed.confidence || 85,
            slideHTML: parsed.slideHTML || this.generateSlideHTML(
              request.query,
              parsed.insights?.[0]?.text || 'Data Analysis Complete'
            )
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