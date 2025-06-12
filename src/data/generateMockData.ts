import { addDays, format } from 'date-fns';

export interface SalesData {
  date: string;
  revenue: number;
  deals: number;
  region: 'North' | 'South' | 'East' | 'West';
  product: 'Enterprise' | 'Professional' | 'Basic';
  rep: string;
}

export interface CustomerData {
  id: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  mrr: number;
  created_date: string;
  churn_date: string | null;
  health_score: number;
  company_name: string;
}

export interface ProductUsageData {
  date: string;
  feature: string;
  users: number;
  sessions: number;
  avg_duration: number;
}

const regions: Array<'North' | 'South' | 'East' | 'West'> = ['North', 'South', 'East', 'West'];
const products: Array<'Enterprise' | 'Professional' | 'Basic'> = ['Enterprise', 'Professional', 'Basic'];
const reps = [
  'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez',
  'Jennifer Smith', 'David Kim', 'Lisa Wang', 'Ryan O\'Brien'
];
const features = ['Dashboard', 'Analytics', 'Reports', 'API', 'Integrations', 'Automation'];
const companyPrefixes = ['Acme', 'Global', 'Tech', 'Digital', 'Smart', 'Cloud', 'Data', 'Next'];
const companySuffixes = ['Corp', 'Inc', 'Solutions', 'Systems', 'Group', 'Partners', 'Ventures', 'Technologies'];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSalesData(): SalesData[] {
  const data: SalesData[] = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 365; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Simulate seasonal trends and monthly dips
    const month = currentDate.getMonth();
    const dayOfWeek = currentDate.getDay();
    let baseRevenue = 120000;
    
    // Q4 is typically stronger
    if (month >= 9) baseRevenue *= 1.3;
    // Q1 is typically weaker
    else if (month <= 2) baseRevenue *= 0.85;
    
    // Weekends have less activity
    if (dayOfWeek === 0 || dayOfWeek === 6) baseRevenue *= 0.6;
    
    // Last month (November) has a specific drop for demo purposes
    if (month === 10) baseRevenue *= 0.77;
    
    // Add some regions performing better/worse
    regions.forEach(region => {
      const regionMultiplier = region === 'North' && month === 10 ? 0.5 : // North underperforms in November
                              region === 'West' ? 1.2 :
                              region === 'East' ? 1.1 :
                              region === 'South' ? 0.9 : 1;
      
      const revenue = Math.round(baseRevenue * regionMultiplier * (0.8 + Math.random() * 0.4) / 4);
      const deals = Math.round(revenue / randomBetween(4000, 8000));
      
      data.push({
        date: dateStr,
        revenue,
        deals,
        region,
        product: products[randomBetween(0, products.length - 1)],
        rep: reps[randomBetween(0, reps.length - 1)]
      });
    });
  }
  
  return data;
}

function generateCustomerData(): CustomerData[] {
  const data: CustomerData[] = [];
  const segments: Array<'Enterprise' | 'Mid-Market' | 'SMB'> = ['Enterprise', 'Mid-Market', 'SMB'];
  
  for (let i = 1; i <= 500; i++) {
    const segment = segments[randomBetween(0, segments.length - 1)];
    const baseMRR = segment === 'Enterprise' ? 5000 : segment === 'Mid-Market' ? 2000 : 500;
    const mrr = baseMRR + randomBetween(-baseMRR * 0.3, baseMRR * 0.5);
    
    const createdDaysAgo = randomBetween(30, 730);
    const created_date = format(addDays(new Date(), -createdDaysAgo), 'yyyy-MM-dd');
    
    // 15% churn rate, more likely for low health scores
    const health_score = randomBetween(20, 100);
    const churned = Math.random() < (health_score < 50 ? 0.3 : 0.1);
    const churn_date = churned ? 
      format(addDays(new Date(created_date), randomBetween(30, createdDaysAgo)), 'yyyy-MM-dd') : 
      null;
    
    const company_name = `${companyPrefixes[randomBetween(0, companyPrefixes.length - 1)]} ${companySuffixes[randomBetween(0, companySuffixes.length - 1)]}`;
    
    data.push({
      id: `cust_${String(i).padStart(3, '0')}`,
      segment,
      mrr: Math.round(mrr),
      created_date,
      churn_date,
      health_score,
      company_name
    });
  }
  
  return data;
}

function generateProductUsageData(): ProductUsageData[] {
  const data: ProductUsageData[] = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 365; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    features.forEach((feature, index) => {
      // Dashboard has highest usage
      const baseUsers = feature === 'Dashboard' ? 1250 : 
                       feature === 'Analytics' ? 1100 :
                       feature === 'Reports' ? 900 :
                       600 - index * 50;
      
      // Usage grows over time
      const growthFactor = 1 + (i / 365) * 0.3;
      const users = Math.round(baseUsers * growthFactor * (0.9 + Math.random() * 0.2));
      const sessions = Math.round(users * randomBetween(2, 5));
      const avg_duration = feature === 'Dashboard' ? randomBetween(10, 20) :
                          feature === 'Analytics' ? randomBetween(8, 15) :
                          randomBetween(5, 12);
      
      data.push({
        date: dateStr,
        feature,
        users,
        sessions,
        avg_duration: Math.round(avg_duration * 10) / 10
      });
    });
  }
  
  return data;
}

export interface MockData {
  sales: SalesData[];
  customers: CustomerData[];
  product_usage: ProductUsageData[];
}

export function generateMockData(): MockData {
  return {
    sales: generateSalesData(),
    customers: generateCustomerData(),
    product_usage: generateProductUsageData()
  };
}