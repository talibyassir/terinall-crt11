# InSilico Terminal Clone

## Overview
A high-fidelity trading terminal clone built with React, TypeScript, and Vite. This application now features real cryptocurrency market data from Binance and CoinGecko APIs, with real-time WebSocket streaming, order management, AI-powered analysis using Google's Gemini API, and advanced charting capabilities.

## Tech Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **Styling**: TailwindCSS (CDN)
- **Charting**: Highcharts 12.4.0, Recharts 3.5.1
- **Layout**: React Grid Layout 1.5.0
- **AI Integration**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Data APIs**: Binance (WebSocket + REST), CoinGecko

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
│   ├── binanceService.ts # Binance API (REST + WebSocket)
│   ├── coinGeckoService.ts # CoinGecko API integration
│   ├── cryptoDataService.ts # Data provider abstraction
│   └── geminiService.ts # Gemini API integration
├── hooks/
│   └── useMarketData.ts # Market data hook for context
├── contexts/
│   └── MarketDataContext.tsx # Market data state management
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
- Real-time order book visualization (via Binance WebSocket)
- Interactive candlestick charts with real market data
- AI-powered market analysis via Gemini
- Customizable dashboard with drag-and-drop widgets
- Trading positions management
- Depth of market (DOM) visualization
- Market heatmaps
- Order flow analysis
- Live ticker feed with real prices
- Trollbox chat simulation

## API Integration Details

### Binance Integration
- **REST API**: Fetch ticker data, order books, klines, recent trades
- **WebSocket**: Real-time ticker, trades, depth (20 levels) streaming
- **Features**: Automatic reconnection with exponential backoff, graceful degradation when REST API is blocked (451 errors)
- **Optimizations**: Efficient ticker fetching using parallel requests for specific symbols

### CoinGecko Integration  
- **Data**: Market data, historical prices, coin metadata
- **Features**: Logo caching, fallback to default assets for missing data
- **Purpose**: Supplement Binance data with broader market information

### Error Handling & Resilience
- REST API failures (geographic restrictions) automatically fall back to WebSocket data
- WebSocket reconnection with exponential backoff (1s → 2s → 4s → 8s → 16s)
- After max retries, waits 30 seconds before resetting and retrying
- Mock data fallback for UI consistency during API outages

## Recent Changes (December 1, 2025)
- **Phase 1 Complete: Real Data Integration**
  - Created binanceService.ts with REST API and WebSocket implementation
  - Created coinGeckoService.ts for extended market data
  - Created cryptoDataService.ts as unified data provider interface
  - Implemented market data hooks and context for state management
  - Integrated real-time BTC price data (currently ~$56,400)
  
- **Architecture Optimizations**
  - Optimized fetchTickers to request specific symbols in parallel instead of fetching all tickers
  - Added graceful fallback for REST API failures using WebSocket order book data
  - Improved WebSocket reconnection logic with extended retry strategy (30s reset after max attempts)
  - CORS proxy integration for geographically restricted API access

## Roadmap
- **Phase 2**: DEX Integration (1inch, Uniswap for Ethereum trades)
- **Phase 3**: Bug Fixes and Widget Improvements
- **Phase 4**: Advanced Features (bot trading, signals, strategy backtesting)

## Known Issues & Notes
- Binance REST API blocked by geographic restrictions (451 errors) - mitigated by WebSocket fallback
- TailwindCSS loaded via CDN (should be installed locally for production)
- Dark terminal-style theme with custom color palette
- Responsive grid layout with resizable widgets
- WebSocket streams currently limited to one symbol at a time (planned: multi-symbol support)
