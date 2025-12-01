import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as cryptoData from '../services/cryptoDataService';
import { BinanceWebSocket, createTickerStream, createDepthStream, createTradeStream } from '../services/binanceService';
import { Candle, Order, Trade } from '../types';

export type Exchange = 'binance' | 'coinbase' | 'bybit';

interface MarketDataState {
  symbol: string;
  exchange: Exchange;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  bids: Order[];
  asks: Order[];
  trades: Trade[];
  candles: Candle[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

interface MarketDataContextType extends MarketDataState {
  setSymbol: (symbol: string) => void;
  setExchange: (exchange: Exchange) => void;
  refreshData: () => void;
}

const defaultState: MarketDataState = {
  symbol: 'BTCUSDT',
  exchange: 'binance',
  price: 0,
  priceChange24h: 0,
  priceChangePercent24h: 0,
  high24h: 0,
  low24h: 0,
  volume24h: 0,
  bids: [],
  asks: [],
  trades: [],
  candles: [],
  loading: true,
  error: null,
  connected: false,
};

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MarketDataState>(defaultState);
  const [ws, setWs] = useState<BinanceWebSocket | null>(null);

  const fetchInitialData = useCallback(async (symbol: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [tickerData, orderBookData, tradesData, candlesData] = await Promise.all([
        cryptoData.fetchTickers([symbol]),
        cryptoData.fetchOrderBook(symbol),
        cryptoData.fetchRecentTrades(symbol),
        cryptoData.fetchCandles(symbol, '1m', 100),
      ]);

      const ticker = tickerData[0];
      
      setState(prev => ({
        ...prev,
        price: ticker?.price || 0,
        priceChange24h: ticker?.priceChange24h || 0,
        priceChangePercent24h: ticker?.priceChangePercent24h || 0,
        high24h: ticker?.high24h || 0,
        low24h: ticker?.low24h || 0,
        volume24h: ticker?.volume24h || 0,
        bids: orderBookData.bids,
        asks: orderBookData.asks,
        trades: tradesData.map(t => ({
          id: t.id,
          price: t.price,
          size: t.size,
          time: new Date(t.time).toLocaleTimeString(),
          side: t.side,
        })),
        candles: candlesData,
        loading: false,
      }));
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (err as Error).message 
      }));
    }
  }, []);

  const setupWebSocket = useCallback((symbol: string) => {
    if (ws) {
      ws.close();
    }

    const newWs = new BinanceWebSocket();
    
    const streams = [
      createTickerStream(symbol),
      createTradeStream(symbol),
      createDepthStream(symbol, 20),
    ];

    newWs.connect(streams).then(() => {
      setState(prev => ({ ...prev, connected: true }));

      newWs.subscribe(createTickerStream(symbol), (data: any) => {
        setState(prev => ({
          ...prev,
          price: parseFloat(data.c || data.lastPrice || prev.price),
          priceChange24h: parseFloat(data.p || prev.priceChange24h),
          priceChangePercent24h: parseFloat(data.P || prev.priceChangePercent24h),
          high24h: parseFloat(data.h || prev.high24h),
          low24h: parseFloat(data.l || prev.low24h),
          volume24h: parseFloat(data.v || prev.volume24h),
        }));
      });

      newWs.subscribe(createTradeStream(symbol), (data: any) => {
        const newTrade: Trade = {
          id: (data.t || Date.now()).toString(),
          price: parseFloat(data.p),
          size: parseFloat(data.q),
          time: new Date(data.T || Date.now()).toLocaleTimeString(),
          side: data.m ? 'sell' : 'buy',
        };
        
        setState(prev => ({
          ...prev,
          trades: [newTrade, ...prev.trades.slice(0, 49)],
        }));
      });

      newWs.subscribe(createDepthStream(symbol, 20), (data: any) => {
        if (data.bids && data.asks) {
          let bidTotal = 0;
          let askTotal = 0;

          const bids: Order[] = data.bids.map((b: [string, string]) => {
            const size = parseFloat(b[1]);
            bidTotal += size;
            return {
              price: parseFloat(b[0]),
              size,
              total: bidTotal,
              type: 'bid' as const,
            };
          });

          const asks: Order[] = data.asks.map((a: [string, string]) => {
            const size = parseFloat(a[1]);
            askTotal += size;
            return {
              price: parseFloat(a[0]),
              size,
              total: askTotal,
              type: 'ask' as const,
            };
          });

          setState(prev => ({ ...prev, bids, asks }));
        }
      });
    }).catch(err => {
      console.error('WebSocket connection failed:', err);
      setState(prev => ({ ...prev, connected: false }));
    });

    setWs(newWs);
  }, [ws]);

  const setSymbol = useCallback((newSymbol: string) => {
    setState(prev => ({ ...prev, symbol: newSymbol }));
  }, []);

  const setExchange = useCallback((newExchange: Exchange) => {
    setState(prev => ({ ...prev, exchange: newExchange }));
  }, []);

  const refreshData = useCallback(() => {
    fetchInitialData(state.symbol);
  }, [fetchInitialData, state.symbol]);

  useEffect(() => {
    fetchInitialData(state.symbol);
    setupWebSocket(state.symbol);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [state.symbol]);

  return (
    <MarketDataContext.Provider value={{ ...state, setSymbol, setExchange, refreshData }}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

export default MarketDataContext;
