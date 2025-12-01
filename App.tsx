
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';

import Header from './components/Header';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import ChartWidget from './components/ChartWidget';
import TradingViewWidget from './components/TradingViewWidget';
import PositionsTable from './components/PositionsTable';
import AIAnalysis from './components/AIAnalysis';
import OrderEntry from './components/OrderEntry';
import DOM from './components/DOM';
import Aggr from './components/Aggr';
import ExchangeInfo from './components/ExchangeInfo';
import NewsFeed from './components/NewsFeed';
import AccountSummary from './components/AccountSummary';
import Trollbox from './components/Trollbox';
import Tickers from './components/Tickers';
import HeatmapWidget from './components/HeatmapWidget';
import DepthChartWidget from './components/DepthChartWidget';
import OrderFlowWidget from './components/OrderFlowWidget';
import { Widget } from './components/Widget';
import SettingsModal from './components/SettingsModal';
import SymbolSelector from './components/SymbolSelector'; // Fixed relative import

import { Candle, Order, Trade, ConnectionStatus, Position, AdvancedChartData } from './types';
import { INITIAL_POSITIONS, generateOrderBook } from './constants';

const ResponsiveGridLayout = WidthProvider(Responsive);

const generateInitialData = (count: number): AdvancedChartData => {
    const candles: Candle[] = [];
    const cvd: { time: number; value: number }[] = [];
    const oi: { time: number; value: number }[] = [];
    const liquidations: { time: number; long: number; short: number }[] = [];
    const funding: { time: number; value: number }[] = [];

    let price = 56400;
    let time = Math.floor(Date.now() / 1000) - (count * 60);
    let cumulativeDelta = 0;
    let openInterest = 50000000;

    for (let i = 0; i < count; i++) {
        const open = price;
        const volatility = (Math.random() - 0.5) * 50; 
        const close = open + volatility;
        const high = Math.max(open, close) + Math.random() * 10;
        const low = Math.min(open, close) - Math.random() * 10;
        const volume = Math.random() * 200 + 50;

        candles.push({ time, open, high, low, close, volume });

        const delta = (Math.random() - 0.5) * volume * 0.4;
        cumulativeDelta += delta;
        cvd.push({ time, value: cumulativeDelta });

        openInterest += (Math.random() - 0.5) * 100000;
        oi.push({ time, value: openInterest });

        liquidations.push({
            time,
            long: Math.random() > 0.9 ? Math.random() * 50000 : 0,
            short: Math.random() > 0.9 ? Math.random() * 50000 : 0
        });

        funding.push({ time, value: 0.01 + Math.sin(i / 20) * 0.005 });

        price = close;
        time += 60;
    }

    return { candles, cvd, oi, liquidations, funding };
};

const INITIAL_DATA = generateInitialData(200);

const DEFAULT_LAYOUT: Layout[] = [
  { i: 'tickers', x: 0, y: 0, w: 4, h: 20, minW: 2 },
  { i: 'orderBook', x: 4, y: 0, w: 4, h: 14, minW: 3 },
  { i: 'chart', x: 8, y: 0, w: 10, h: 14, minW: 4 },
  { i: 'trades', x: 18, y: 0, w: 4, h: 10, minW: 2 },
  { i: 'aggr', x: 22, y: 0, w: 2, h: 10, minW: 2 },
  { i: 'dom', x: 4, y: 14, w: 4, h: 10, minW: 2 },
  { i: 'positions', x: 8, y: 14, w: 10, h: 10, minW: 4 },
  { i: 'ai', x: 18, y: 10, w: 6, h: 8, minW: 3 },
  { i: 'account', x: 0, y: 20, w: 4, h: 8, minW: 2 },
  { i: 'news', x: 4, y: 24, w: 4, h: 6, minW: 2 },
  { i: 'trollbox', x: 18, y: 18, w: 6, h: 12, minW: 3 },
  { i: 'depthChart', x: 8, y: 24, w: 5, h: 6, minW: 3 },
  { i: 'heatmap', x: 13, y: 24, w: 5, h: 6, minW: 3 },
  { i: 'tradingView', x: 8, y: 0, w: 10, h: 14, minW: 4 },
  { i: 'orderFlow', x: 8, y: 0, w: 10, h: 14, minW: 4 },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTCUSDT');
  const [interval, setLocalInterval] = useState<string>('1m');
  const [btcPrice, setBtcPrice] = useState<number>(56400);
  const [fundingRate, setFundingRate] = useState<number>(0.001);
  
  const [chartData, setChartData] = useState<AdvancedChartData>(INITIAL_DATA);
  const [orderBook, setOrderBook] = useState<{ bids: Order[], asks: Order[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);

  const [layout, setLayout] = useState<Layout[]>(() => {
      const saved = localStorage.getItem('INSILICO_LAYOUT');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });
  
  const [activeWidgets, setActiveWidgets] = useState<Record<string, boolean>>(() => {
      const saved = localStorage.getItem('INSILICO_WIDGETS');
      return saved ? JSON.parse(saved) : {
        tickers: true, orderBook: true, chart: true, trades: true, positions: true, 
        ai: true, dom: true, aggr: true, exchange: false, news: false, 
        account: true, trollbox: true, heatmap: false, depthChart: false, tradingView: false, orderFlow: false
      };
  });

  const [designerMode, setDesignerMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);
  const [time, setTime] = useState<Date>(new Date());
  
  const [widgetSettings, setWidgetSettings] = useState<Record<string, React.ReactNode>>({});

  useEffect(() => {
      localStorage.setItem('INSILICO_LAYOUT', JSON.stringify(layout));
      localStorage.setItem('INSILICO_WIDGETS', JSON.stringify(activeWidgets));
  }, [layout, activeWidgets]);

  const handleResetLayout = () => {
      setLayout(DEFAULT_LAYOUT);
      setActiveWidgets({
        tickers: true, orderBook: true, chart: true, trades: true, positions: true, 
        ai: true, dom: true, aggr: true, exchange: false, news: false, 
        account: true, trollbox: true, heatmap: false, depthChart: false, tradingView: false, orderFlow: false
      });
      localStorage.removeItem('INSILICO_LAYOUT');
      localStorage.removeItem('INSILICO_WIDGETS');
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setStatus(ConnectionStatus.CONNECTED);
    const updateInterval = setInterval(() => {
      const volatility = (Math.random() - 0.5) * 25;
      const newPrice = Math.max(100, btcPrice + volatility);
      setBtcPrice(newPrice);
      setOrderBook(generateOrderBook(newPrice));

      if (Math.random() > 0.3) {
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const tradePrice = newPrice + (Math.random() - 0.5) * 2;
        const size = Math.random() * 1.5;
        
        const newTrade: Trade = {
          id: Date.now().toString() + Math.random().toString(),
          price: tradePrice,
          size,
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          side
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 50));
        
        setChartData(prev => {
            const lastCandle = prev.candles[prev.candles.length - 1];
            const updatedCandle = { 
                ...lastCandle, 
                close: tradePrice, 
                high: Math.max(lastCandle.high, tradePrice), 
                low: Math.min(lastCandle.low, tradePrice), 
                volume: lastCandle.volume + size 
            };
            const newCandles = [...prev.candles.slice(0, -1), updatedCandle];

            const lastCvd = prev.cvd[prev.cvd.length - 1];
            const delta = (side === 'buy' ? size : -size) * 0.5;
            const updatedCvd = { ...lastCvd, value: lastCvd.value + delta };
            const newCvd = [...prev.cvd.slice(0, -1), updatedCvd];

            return { ...prev, candles: newCandles, cvd: newCvd };
        });
      }
      setFundingRate(prev => prev + (Math.random() - 0.5) * 0.00001);
    }, 200);
    return () => clearInterval(updateInterval);
  }, [btcPrice]);

  const handleSymbolChange = useCallback((symbol: string) => {
      setActiveSymbol(symbol);
      setTrades([]); 
      setChartData(generateInitialData(200)); 
      setBtcPrice(symbol.includes('ETH') ? 3000 : symbol.includes('SOL') ? 140 : 90000);
  }, []);

  const handleClosePosition = (symbol: string) => {
      setPositions(prev => prev.filter(p => p.symbol !== symbol));
  };

  const setOrderBookSettings = useCallback((content: React.ReactNode) => {
      setWidgetSettings(prev => ({ ...prev, orderBook: content }));
  }, []);

  const setChartSettings = useCallback((content: React.ReactNode) => {
      setWidgetSettings(prev => ({ ...prev, chart: content }));
  }, []);

  const renderWidget = (key: string) => {
      switch(key) {
          case 'tickers': return <Tickers onSymbolSelect={handleSymbolChange} />;
          case 'orderBook': return <OrderBook bids={orderBook.bids} asks={orderBook.asks} currentPrice={btcPrice} symbol={activeSymbol} fundingRate={fundingRate} setSettingsContent={setOrderBookSettings} />;
          case 'chart': return <ChartWidget data={chartData} setSettingsContent={setChartSettings} interval={interval} onIntervalChange={setLocalInterval} />;
          case 'tradingView': return <TradingViewWidget symbol={`BINANCE:${activeSymbol}`} interval={interval === '1m' ? '1' : interval === '5m' ? '5' : '60'} />; 
          case 'trades': return <TradeHistory trades={trades} />;
          case 'positions': return <PositionsTable positions={positions} onClosePosition={handleClosePosition} />;
          case 'ai': return <AIAnalysis btcPrice={btcPrice} />;
          case 'dom': return <DOM bids={orderBook.bids} asks={orderBook.asks} currentPrice={btcPrice} trades={trades} symbol={activeSymbol} />;
          case 'aggr': return <Aggr trades={trades} />;
          case 'trollbox': return <Trollbox />;
          case 'account': return <AccountSummary />;
          case 'news': return <NewsFeed />;
          case 'heatmap': return <HeatmapWidget />;
          case 'depthChart': return <DepthChartWidget bids={orderBook.bids} asks={orderBook.asks} />;
          case 'orderEntry': return <OrderEntry currentPrice={btcPrice} />;
          case 'exchange': return <ExchangeInfo currentBtcPrice={btcPrice} />;
          case 'orderFlow': return <OrderFlowWidget trades={trades} candles={chartData.candles} />;
          default: return null;
      }
  };

  const getWidgetTitle = (key: string) => {
      switch(key) {
          case 'chart': return `Chart ${activeSymbol}`;
          case 'orderBook': return `Orderbook (${activeSymbol})`;
          case 'tickers': return `Tickers`;
          case 'positions': return `Positions`;
          case 'trades': return `Trades`;
          case 'dom': return `DOM`;
          case 'heatmap': return `Heatmap`;
          default: return key.charAt(0).toUpperCase() + key.slice(1);
      }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0c10] text-gray-300 font-sans overflow-hidden">
      <Header 
        status={status} 
        btcPrice={btcPrice}
        panels={activeWidgets}
        togglePanel={(key) => setActiveWidgets(prev => ({...prev, [key]: !prev[key]}))}
        onResetLayout={handleResetLayout}
        onOpenSettings={() => setShowSettings(true)}
        currentSymbol={activeSymbol}
        onSearch={() => setShowSymbolSelector(true)}
        designerMode={designerMode}
        setDesignerMode={setDesignerMode}
        privacyMode={privacyMode}
        setPrivacyMode={setPrivacyMode}
        onNukeOrders={() => {}}
        onNukePositions={() => setPositions([])}
      />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden h-[calc(100vh-theme(spacing.11)-theme(spacing.6))]">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
            rowHeight={24}
            margin={[4, 4]}
            onLayoutChange={(curr) => setLayout(curr)}
            draggableHandle=".drag-handle"
            isDraggable={designerMode}
            isResizable={designerMode}
            compactType="vertical"
          >
            {Object.keys(activeWidgets).map(key => {
                if (!activeWidgets[key]) return null;
                return (
                    <div key={key} className={privacyMode && (key === 'account' || key === 'positions') ? 'blur-sm transition-all hover:blur-none' : ''}>
                        <Widget 
                            title={getWidgetTitle(key)}
                            onClose={() => setActiveWidgets(prev => ({...prev, [key]: false}))}
                            settingsContent={widgetSettings[key]}
                        >
                            {renderWidget(key)}
                        </Widget>
                    </div>
                );
            })}
          </ResponsiveGridLayout>
      </div>

      {/* Global Status Footer */}
      <div className="h-6 bg-[#0b0c10] border-t border-terminal-border flex items-center justify-between px-2 text-[10px] font-mono select-none z-50">
          <div className="flex items-center gap-4">
              <span className="text-gray-500">MMT (v1.9.5)</span>
              <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="flex items-end gap-0.5 h-3 pb-0.5">
                      <div className="w-0.5 h-1 bg-terminal-green"></div>
                      <div className="w-0.5 h-2 bg-terminal-green"></div>
                      <div className="w-0.5 h-full bg-terminal-green"></div>
                  </div>
                  <span>60 ms</span>
              </div>
              <span className="text-gray-500 pl-2 border-l border-gray-800">
                  {time.toLocaleTimeString('en-GB', { timeZone: 'UTC' })} UTC
              </span>
          </div>

          <div className="flex items-center gap-3">
              <span className="text-gray-600 hover:text-white cursor-pointer">X</span>
              <span className="text-gray-600 hover:text-white cursor-pointer">Discord</span>
              <span className="text-gray-600 hover:text-white cursor-pointer">Telegram</span>
              <span className="text-gray-600 hover:text-white cursor-pointer">Youtube</span>
          </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <SymbolSelector 
        isOpen={showSymbolSelector} 
        onClose={() => setShowSymbolSelector(false)} 
        onSelect={handleSymbolChange} 
      />
    </div>
  );
};

export default App;
