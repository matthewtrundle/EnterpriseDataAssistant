# Enterprise Data Assistant - AI-Powered Business Intelligence

A powerful demo showcasing how AI can transform business data analysis. Upload any CSV/Excel file and ask questions in plain English to get instant visualizations, insights, and presentation-ready slides.

## 🚀 Features

### Core Capabilities
- **Natural Language Queries**: Ask questions in plain English
- **AI-Powered Analysis**: Uses Claude 3 for intelligent data interpretation
- **File Upload**: Drag-and-drop CSV/Excel files or use demo data
- **Smart Visualizations**: Auto-selects best chart type (line, bar, pie, scatter, table)
- **Presentation Slides**: Generates beautiful HTML slides for executive presentations
- **SQL Generation**: Shows the SQL query for transparency
- **Executive Summaries**: Auto-generated insights with confidence scores
- **Data Preview**: Explore your data with column statistics before querying

### What Makes It Special
1. **Real AI Analysis**: When configured with Claude API, it provides genuine insights
2. **Upload Any Data**: Works with your actual business data, not just demos
3. **Presentation-Ready**: Export slides as images or share links
4. **Learning System**: Feedback mechanism to improve over time
5. **Professional UI**: Clean, modern interface that impresses stakeholders

## 🛠 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenRouter API (Optional but Recommended)
Create a `.env` file in the root directory:
```
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your API key from: https://openrouter.ai/keys

### 3. Start the Application
```bash
npm start
```

The app runs at http://localhost:3000

## 📊 Demo Queries to Try

Once you've uploaded data (or used the demo data), try these queries:

1. **"What are the main trends in my data?"**
2. **"Show me the top performing categories"**
3. **"Which metrics are declining and why?"**
4. **"Create a summary for executives"**
5. **"What patterns do you see in customer behavior?"**

## 🎯 Making the Demo Sparkle

### Additional Features You Could Add:

1. **Voice Input**
   - Add speech-to-text for queries
   - Makes demos more interactive

2. **Real-time Collaboration**
   - Share analysis sessions with team members
   - Add comments and annotations

3. **Advanced Visualizations**
   - 3D charts
   - Geographic maps
   - Network graphs
   - Animated transitions

4. **Export Options**
   - PowerPoint generation
   - PDF reports
   - Scheduled email summaries

5. **Data Connectors**
   - Direct database connections
   - API integrations (Salesforce, HubSpot, etc.)
   - Real-time data streaming

6. **Predictive Analytics**
   - Forecasting
   - Anomaly detection
   - What-if scenarios

## 📝 Demo Script Tips

### Opening Hook
"Imagine turning any business question into actionable insights in seconds, not days. Let me show you how."

### Key Points to Emphasize
1. **Speed**: Analysis in seconds vs. hours/days with traditional BI
2. **Accessibility**: No SQL or technical knowledge required
3. **Intelligence**: AI understands context and business implications
4. **Actionability**: Not just charts, but insights and recommendations

### Handling Questions
- **"Is it secure?"**: All processing can be done on-premise. Data never leaves your environment.
- **"How accurate is it?"**: Show confidence scores and SQL transparency
- **"Can it handle our data volume?"**: Designed to scale with cloud infrastructure

## 🔧 Technical Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Visualizations**: Recharts
- **AI**: Claude 3 via OpenRouter API
- **File Processing**: PapaParse (CSV), SheetJS (Excel)
- **State Management**: React Hooks
- **Styling**: Tailwind CSS for responsive design

## 🚀 Deployment

For production deployment:

1. Build the app:
```bash
npm run build
```

2. Deploy to your preferred platform:
   - Vercel: `vercel --prod`
   - Netlify: Drag & drop the `build` folder
   - AWS S3 + CloudFront for enterprise deployment

## 📄 License

This is a demo project. Feel free to use and modify for your demonstrations.