import { format, subDays, startOfMonth } from 'date-fns';

export interface SalesRecord {
  date: string;
  revenue: number;
  quantity: number;
  product_category: string;
  product_name: string;
  region: string;
  country: string;
  customer_segment: string;
  sales_rep: string;
  customer_id: string;
  order_id: string;
  profit_margin: number;
  discount: number;
  shipping_cost: number;
}

const productCategories = {
  'Technology': ['Laptop Pro', 'Smartphone X', 'Tablet Ultra', 'Smartwatch Plus', 'Wireless Earbuds'],
  'Office Supplies': ['Ergonomic Chair', 'Standing Desk', 'Monitor Stand', 'Desk Organizer', 'Office Printer'],
  'Software': ['CRM Suite', 'Analytics Pro', 'Security Shield', 'Cloud Storage', 'Project Manager'],
  'Services': ['Consulting Hours', 'Training Package', 'Support Plan', 'Implementation', 'Maintenance']
};

const regions = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'Europe': ['UK', 'Germany', 'France', 'Spain', 'Italy'],
  'Asia Pacific': ['Japan', 'Australia', 'Singapore', 'India', 'China'],
  'South America': ['Brazil', 'Argentina', 'Chile']
};

const customerSegments = ['Enterprise', 'Mid-Market', 'Small Business', 'Startup'];

const salesReps = [
  'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Rodriguez',
  'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Kim',
  'Jennifer Lee', 'Thomas Brown', 'Amanda Davis', 'Christopher Martinez'
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateDemoSalesData(): SalesRecord[] {
  const records: SalesRecord[] = [];
  const today = new Date();
  const daysToGenerate = 365; // 1 year of data
  
  for (let i = 0; i < daysToGenerate; i++) {
    const currentDate = subDays(today, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();
    
    // Generate 10-50 orders per day (less on weekends)
    const ordersPerDay = dayOfWeek === 0 || dayOfWeek === 6 
      ? randomBetween(5, 20) 
      : randomBetween(20, 50);
    
    for (let j = 0; j < ordersPerDay; j++) {
      const category = randomChoice(Object.keys(productCategories));
      const product = randomChoice(productCategories[category as keyof typeof productCategories]);
      const region = randomChoice(Object.keys(regions));
      const country = randomChoice(regions[region as keyof typeof regions]);
      const segment = randomChoice(customerSegments);
      
      // Base price varies by category
      let basePrice = 0;
      switch (category) {
        case 'Technology':
          basePrice = randomBetween(500, 3000);
          break;
        case 'Office Supplies':
          basePrice = randomBetween(100, 1000);
          break;
        case 'Software':
          basePrice = randomBetween(200, 5000);
          break;
        case 'Services':
          basePrice = randomBetween(1000, 10000);
          break;
      }
      
      // Quantity varies by segment
      const quantity = segment === 'Enterprise' ? randomBetween(10, 100) :
                      segment === 'Mid-Market' ? randomBetween(5, 50) :
                      segment === 'Small Business' ? randomBetween(2, 20) :
                      randomBetween(1, 10);
      
      // Seasonal adjustments
      let seasonalMultiplier = 1;
      if (month === 11) seasonalMultiplier = 1.5; // Black Friday/Holiday boost
      if (month === 0) seasonalMultiplier = 0.8; // January slowdown
      if (month === 6 || month === 7) seasonalMultiplier = 0.9; // Summer slowdown
      
      // Regional performance differences
      const regionalMultiplier = region === 'North America' ? 1.2 :
                                region === 'Europe' ? 1.1 :
                                region === 'Asia Pacific' ? 1.3 :
                                0.9;
      
      const discount = segment === 'Enterprise' ? randomFloat(0.1, 0.3) :
                      segment === 'Mid-Market' ? randomFloat(0.05, 0.2) :
                      randomFloat(0, 0.15);
      
      const revenue = basePrice * quantity * seasonalMultiplier * regionalMultiplier * (1 - discount);
      const profitMargin = randomFloat(0.15, 0.45);
      const shippingCost = randomBetween(10, 100) * quantity * 0.1;
      
      records.push({
        date: dateStr,
        revenue: Math.round(revenue * 100) / 100,
        quantity,
        product_category: category,
        product_name: product,
        region,
        country,
        customer_segment: segment,
        sales_rep: randomChoice(salesReps),
        customer_id: `CUST-${randomBetween(1000, 9999)}`,
        order_id: `ORD-${dateStr}-${j + 1}`,
        profit_margin: Math.round(profitMargin * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        shipping_cost: Math.round(shippingCost * 100) / 100
      });
    }
  }
  
  // Sort by date descending (most recent first)
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

// Pre-generate some interesting queries for the demo
export const demoQueries = [
  "What are my revenue trends over the last 12 months?",
  "Which product categories are performing best?",
  "Show me sales by region and identify underperforming areas",
  "What's my average order value by customer segment?",
  "Which sales reps are exceeding their targets?",
  "How do profit margins vary across product categories?",
  "What's the impact of discounts on our revenue?",
  "Show me seasonal patterns in our sales data",
  "Which countries are driving the most growth?",
  "Compare enterprise vs small business customer performance"
];