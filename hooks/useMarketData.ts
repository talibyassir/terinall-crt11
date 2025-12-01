import { useState, useEffect, useCallback, useRef } from 'react';
import * as cryptoData from '../services/cryptoDataService';
import { BinanceWebSocket, createTickerStream, createDepthStream, createTradeStream, createKlineStream } from '../services/binanceService';
import { Candle, Order } from '../types';

export interface MarketState {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  loading: boolean;
  error: string | null;
}

export interface OrderBookState {
  bids: Order[];
  asks: Order[];
  spread: number;
  spreadPercent: number;
  loading: boolean;
  error: string | null;
}

export interface TradesState {
  trades: cryptoData.TradeData[];
  loading: boolean;
  error: string | null;
}

export interface CandlesState {
  candles: Candle[];
  loading: boolean;
  error: string | null;
}

export interface TickerData {
  symbol: string;
  baseAsset: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  logo?: string;
}

export const useMarketPrice = (symbol: string, refreshInterval: number = 5000) => {
  const [state, setState] = useState<MarketState>({
    price: 0,
    priceChange24h: 0,
    priceChangePercent24h: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    loading: true,
    error: null,
  });

  const fetchPrice = useCallback(async () => {
    try {
      const tickers = await cryptoData.fetchTickers([symbol]);
      if (tickers.length > 0) {
        const t = tickers[0];
        setState({
          price: t.price,
          priceChange24h: t.priceChange24h,
          priceChangePercent24h: t.priceChangePercent24h,
          high24h: t.high24h,
          low24h: t.low24h,
          volume24h: t.volume24h,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: (err as Error).message }));
    }
  }, [symbol]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval]);

  return state;
};

export const useOrderBook = (symbol: string, refreshInterval: number = 2000) => {
  const [state, setState] = useState<OrderBookState>({
    bids: [],
    asks: [],
    spread: 0,
    spreadPercent: 0,
    loading: true,
    error: null,
  });

  const fetchOrderBook = useCallback(async () => {
    try {
      const data = await cryptoData.fetchOrderBook(symbol);
      setState({
        bids: data.bids,
        asks: data.asks,
        spread: data.spread,
        spreadPercent: data.spreadPercent,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: (err as Error).message }));
    }
  }, [symbol]);

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOrderBook, refreshInterval]);

  return state;
};

export const useRecentTrades = (symbol: string, limit: number = 50, refreshInterval: number = 3000) => {
  const [state, setState] = useState<TradesState>({
    trades: [],
    loading: true,
    error: null,
  });

  const fetchTrades = useCallback(async () => {
    try {
      const trades = await cryptoData.fetchRecentTrades(symbol, limit);
      setState({
        trades,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: (err as Error).message }));
    }
  }, [symbol, limit]);

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTrades, refreshInterval]);

  return state;
};

export const useCandles = (
  symbol: string, 
  interval: string = '1m', 
  limit: number = 100,
  refreshInterval: number = 60000
) => {
  const [state, setState] = useState<CandlesState>({
    candles: [],
    loading: true,
    error: null,
  });

  const fetchCandles = useCallback(async () => {
    try {
      const candles = await cryptoData.fetchCandles(symbol, interval, limit);
      setState({
        candles,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: (err as Error).message }));
    }
  }, [symbol, interval, limit]);

  useEffect(() => {
    fetchCandles();
    const intervalId = setInterval(fetchCandles, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchCandles, refreshInterval]);

  return { ...state, refetch: fetchCandles };
};

export const useAllTickers = (symbols: string[] = [], refreshInterval: number = 5000) => {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickers = useCallback(async () => {
    try {
      const data = await cryptoData.fetchTickers(symbols);
      
      const tickerData: TickerData[] = data.map(t => ({
        symbol: t.symbol,
        baseAsset: t.baseAsset,
        price: t.price,
        priceChange24h: t.priceChange24h,
        priceChangePercent24h: t.priceChangePercent24h,
        high24h: t.high24h,
        low24h: t.low24h,
        volume24h: t.volume24h,
        quoteVolume24h: t.quoteVolume24h,
      }));

      setTickers(tickerData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTickers, refreshInterval]);

  return { tickers, loading, error, refetch: fetchTickers };
};

export const useLiveWebSocket = (symbol: string) => {
  const [price, setPrice] = useState<number>(0);
  const [trades, setTrades] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<BinanceWebSocket | null>(null);

  useEffect(() => {
    const ws = new BinanceWebSocket();
    wsRef.current = ws;

    const streams = [
      createTickerStream(symbol),
      createTradeStream(symbol),
      createDepthStream(symbol, 20),
    ];

    ws.connect(streams).then(() => {
      setConnected(true);

      ws.subscribe(createTickerStream(symbol), (data: any) => {
        setPrice(parseFloat(data.c || data.lastPrice));
      });

      ws.subscribe(createTradeStream(symbol), (data: any) => {
        const trade = {
          id: data.t?.toString() || Date.now().toString(),
          price: parseFloat(data.p),
          size: parseFloat(data.q),
          time: new Date(data.T || Date.now()).toLocaleTimeString(),
          side: data.m ? 'sell' : 'buy',
        };
        setTrades(prev => [trade, ...prev.slice(0, 49)]);
      });

      ws.subscribe(createDepthStream(symbol, 20), (data: any) => {
        if (data.bids && data.asks) {
          let bidTotal = 0;
          let askTotal = 0;

          const bids = data.bids.map((b: [string, string]) => {
            const size = parseFloat(b[1]);
            bidTotal += size;
            return {
              price: parseFloat(b[0]),
              size,
              total: bidTotal,
              type: 'bid',
            };
          });

          const asks = data.asks.map((a: [string, string]) => {
            const size = parseFloat(a[1]);
            askTotal += size;
            return {
              price: parseFloat(a[0]),
              size,
              total: askTotal,
              type: 'ask',
            };
          });

          setOrderBook({ bids, asks });
        }
      });
    }).catch(err => {
      console.error('WebSocket connection failed:', err);
      setConnected(false);
    });

    return () => {
      ws.close();
    };
  }, [symbol]);

  return { price, trades, orderBook, connected };
};

export const useTopCoins = (limit: number = 50) => {
  const [coins, setCoins] = useState<cryptoData.coinGecko.CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await cryptoData.fetchTopCoins(limit);
        setCoins(data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, [limit]);

  return { coins, loading, error };
};
