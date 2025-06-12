export type ChartType = 'line' | 'bar' | 'pie' | 'table';

export interface ChartData {
  type: ChartType;
  data: any[];
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
}

export interface QueryResult {
  sql: string;
  chart: ChartData;
  insights: Insight[];
  summary: string[];
  confidence: number;
  nextSteps?: string[];
  slideHTML?: string;
}