const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_CORS_PROXY = 'https://corsproxy.io/?';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

const getApiUrl = (endpoint: string): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${BINANCE_CORS_PROXY}${encodeURIComponent(BINANCE_API + endpoint)}`;
  }
  return BINANCE_CORS_PROXY + encodeURIComponent(BINANCE_API + endpoint);
};

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  count: number;
}

export interface BinanceOrderBookEntry {
  price: string;
  quantity: string;
}

export interface BinanceOrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
}

export interface BinanceTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
}

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: 'Unknown error' }));
    throw new Error(`Binance API error: ${error.msg || response.status}`);
  }
  return response;
};

export const get24hrTicker = async (symbol?: string): Promise<BinanceTicker | BinanceTicker[]> => {
  const endpoint = symbol 
    ? `/ticker/24hr?symbol=${symbol}`
    : `/ticker/24hr`;
  const url = getApiUrl(endpoint);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export const getOrderBook = async (symbol: string, limit: number = 20): Promise<BinanceOrderBook> => {
  const url = getApiUrl(`/depth?symbol=${symbol}&limit=${limit}`);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export const getKlines = async (
  symbol: string,
  interval: string = '1m',
  limit: number = 100
): Promise<any[]> => {
  const url = getApiUrl(`/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  const response = await fetch(url);
  await handleApiError(response);
  const data = await response.json();
  
  return data.map((k: any[]) => ({
    openTime: k[0],
    open: k[1],
    high: k[2],
    low: k[3],
    close: k[4],
    volume: k[5],
    closeTime: k[6],
    quoteAssetVolume: k[7],
    numberOfTrades: k[8],
  }));
};

export const getRecentTrades = async (symbol: string, limit: number = 50): Promise<BinanceTrade[]> => {
  const url = getApiUrl(`/trades?symbol=${symbol}&limit=${limit}`);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export const getExchangeInfo = async (): Promise<{ symbols: SymbolInfo[] }> => {
  const url = getApiUrl(`/exchangeInfo`);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export const getPrice = async (symbol: string): Promise<{ symbol: string; price: string }> => {
  const url = getApiUrl(`/ticker/price?symbol=${symbol}`);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export const getAllPrices = async (): Promise<{ symbol: string; price: string }[]> => {
  const url = getApiUrl(`/ticker/price`);
  const response = await fetch(url);
  await handleApiError(response);
  return response.json();
};

export type WebSocketCallback = (data: any) => void;

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, WebSocketCallback> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private streams: string[] = [];

  constructor() {}

  connect(streams: string[]): Promise<void> {
    if (this.isConnecting) return Promise.resolve();
    this.isConnecting = true;
    this.streams = streams;

    return new Promise((resolve, reject) => {
      const streamParam = streams.join('/');
      const wsUrl = streams.length > 1 
        ? `${BINANCE_WS}/${streamParam}`
        : `${BINANCE_WS}/${streams[0]}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Binance WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const stream = data.stream || this.getStreamFromData(data);
          
          // Debug: Log ticker data
          if (stream && stream.includes('@ticker')) {
            console.log('WebSocket ticker received:', { stream, price: data.c, data });
          }
          
          if (stream && this.subscriptions.has(stream)) {
            this.subscriptions.get(stream)?.(data.data || data);
          }
          
          this.subscriptions.forEach((callback, key) => {
            if (key === '*') {
              callback(data.data || data);
            }
          });
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Binance WebSocket closed');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.isConnecting = false;
        reject(error);
      };
    });
  }

  private getStreamFromData(data: any): string | null {
    if (data.e === 'trade') return `${data.s.toLowerCase()}@trade`;
    if (data.e === 'kline') return `${data.s.toLowerCase()}@kline_${data.k.i}`;
    if (data.e === '24hrTicker') return `${data.s.toLowerCase()}@ticker`;
    if (data.e === 'depthUpdate') return `${data.s.toLowerCase()}@depth`;
    return null;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached, will try again in 30s');
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.attemptReconnect();
      }, 30000);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.streams.length > 0) {
        this.connect(this.streams);
      }
    }, delay);
  }

  subscribe(stream: string, callback: WebSocketCallback) {
    this.subscriptions.set(stream, callback);
  }

  unsubscribe(stream: string) {
    this.subscriptions.delete(stream);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const createTickerStream = (symbol: string): string => {
  return `${symbol.toLowerCase()}@ticker`;
};

export const createTradeStream = (symbol: string): string => {
  return `${symbol.toLowerCase()}@trade`;
};

export const createKlineStream = (symbol: string, interval: string = '1m'): string => {
  return `${symbol.toLowerCase()}@kline_${interval}`;
};

export const createDepthStream = (symbol: string, levels: number = 20): string => {
  return `${symbol.toLowerCase()}@depth${levels}`;
};

export const createAggTradeStream = (symbol: string): string => {
  return `${symbol.toLowerCase()}@aggTrade`;
};

export const popularSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'NEARUSDT',
  'APTUSDT', 'ARBUSDT', 'OPUSDT', 'PEPEUSDT', 'SHIBUSDT'
];

export const formatSymbol = (symbol: string): string => {
  return symbol.replace('USDT', '/USDT').replace('BUSD', '/BUSD').replace('BTC', '/BTC');
};

export const getBaseAsset = (symbol: string): string => {
  return symbol.replace(/USDT|BUSD|BTC|ETH$/, '');
};
