# InSilico Terminal Clone

## Overview
A high-fidelity trading terminal clone built with React, TypeScript, and Vite. This application simulates a professional cryptocurrency trading interface with real-time market data visualization, order management, AI-powered analysis using Google's Gemini API, and advanced charting capabilities.

## Tech Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **Styling**: TailwindCSS (CDN)
- **Charting**: Highcharts 12.4.0, Recharts 3.5.1
- **Layout**: React Grid Layout 1.5.0
- **AI Integration**: Google Gemini API (@google/genai)
- **Icons**: Lucide React

## Project Structure
```
├── components/          # React components
│   ├── AIAnalysis.tsx  # AI-powered market analysis chat
│   ├── ChartWidget.tsx # Trading chart components
│   ├── OrderBook.tsx   # Order book display
│   ├── TradeHistory.tsx # Trade history
│   ├── PositionsTable.tsx # Positions management
│   └── ...             # Other UI components
├── services/
│   └── geminiService.ts # Gemini API integration
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── types.ts            # TypeScript type definitions
```

## Environment Variables
- `GEMINI_API_KEY` (Secret): Google Gemini API key for AI analysis features

## Development
- **Dev Server**: Runs on port 5000 (configured for Replit proxy)
- **Command**: `npm run dev`
- **Hot Module Replacement**: Configured via WebSocket (wss)

## Deployment
- **Target**: Autoscale
- **Build Command**: `npm run build`
- **Run Command**: `npx vite preview --host 0.0.0.0 --port 5000`

## Features
- Real-time order book visualization
- Interactive candlestick charts with technical indicators
- AI-powered market analysis via Gemini
- Customizable dashboard with drag-and-drop widgets
- Trading positions management
- Depth of market (DOM) visualization
- Market heatmaps
- Order flow analysis
- Live ticker feed
- Trollbox chat simulation

## Recent Changes (December 1, 2025)
- Configured Vite for Replit environment (port 5000, WebSocket HMR)
- Fixed JSX syntax error in AIAnalysis component
- Added script module tag to index.html for proper app initialization
- Set up deployment configuration for production builds
- Configured GEMINI_API_KEY secret for AI features

## Notes
- The application uses import maps for CDN-based dependencies
- TailwindCSS is loaded via CDN (should be installed locally for production)
- Dark terminal-style theme with custom color palette
- Responsive grid layout with resizable widgets
