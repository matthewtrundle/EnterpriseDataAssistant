# Enterprise Data Assistant - Demo Script

## Overview
This POC demonstrates how business users can query their data using natural language and get instant, actionable insights with beautiful visualizations.

## Demo Flow

### 1. Introduction (30 seconds)
"Let me show you how our Enterprise Data Assistant turns your business questions into instant insights. No SQL knowledge required - just ask in plain English."

- Point out the connected data sources (Snowflake, Salesforce) with green checkmarks
- Show the clean, approachable interface

### 2. Revenue Analysis Demo (2 minutes)

**Click: "Why did revenue drop last month?"**

Walk through:
- Show loading state "Analyzing your data..."
- Point out the SQL generation (click to expand)
- Highlight the line chart showing the revenue drop
- Read the key insight: "Revenue decreased 23% due to North region underperformance"
- Show the executive summary with confidence score (92%)
- Point out suggested next steps

"Notice how it not only identified the problem but also pinpointed the root cause - the North region - and suggested actionable next steps."

### 3. Customer Risk Analysis (2 minutes)

**Click: "Which customers are at risk of churning?"**

Highlight:
- Pie chart showing risk distribution
- Key insight about 8 Enterprise customers worth $40k MRR
- Executive summary with 88% confidence
- "This proactive insight could save us hundreds of thousands in revenue"

### 4. Product Analytics (1.5 minutes)

**Click: "What's our best performing product feature?"**

Show:
- Bar chart of feature usage
- Dashboard's 3x higher engagement
- Insights about growth opportunities
- "This data helps us prioritize our product roadmap"

### 5. Comparative Analysis (1.5 minutes)

**Click: "Compare this quarter to last quarter"**

Demonstrate:
- Table view with percentage changes
- Color-coded positive/negative trends
- Quarter-over-quarter insights

### 6. Regional Performance (1 minute)

**Click: "Show me sales by region"**

Point out:
- Clear visualization of regional differences
- Best/worst performing regions
- Actionable recommendations

### 7. Interactive Features (1 minute)

- Show the feedback buttons (thumbs up/down)
- Click "Correct this answer" to show learning capability
- Mention the "Export to PowerPoint" feature
- "The system learns from user feedback to improve accuracy"

### 8. Closing (30 seconds)

"In just 5 minutes, we've:
- Diagnosed a revenue problem
- Identified at-risk customers
- Analyzed product performance
- Compared quarters
- Reviewed regional data

All without writing a single line of SQL or waiting for analyst support. This is the future of business intelligence - immediate, accurate, and actionable insights at your fingertips."

## Key Talking Points

1. **Speed**: "Get answers in seconds, not days"
2. **Accuracy**: "SQL generation ensures precise results"
3. **Actionability**: "Not just data, but insights and next steps"
4. **Learning**: "Gets smarter with every interaction"
5. **Accessibility**: "Anyone can use it - from CEO to sales rep"

## Common Objections & Responses

**"How accurate is the AI?"**
- Point to confidence scores
- Show the SQL for transparency
- Mention the feedback mechanism

**"Can it handle complex queries?"**
- "This POC shows core capabilities. The full version handles much more complex analysis including predictive analytics and multi-dimensional queries."

**"What about data security?"**
- "All queries run against your existing data warehouse with full security controls. No data leaves your environment."

## Technical Details (if asked)

- Built with React, TypeScript, and Tailwind CSS
- Recharts for visualizations
- Mock data simulates 365 days of sales, 500 customers, and product usage
- In production, would connect to real data sources via secure APIs
- SQL generation uses GPT-4 (in production)
- Learning system uses reinforcement learning from user feedback