import * as binance from './binanceService';
import * as coinGecko from './coinGeckoService';
import { Candle, Order, Trade } from '../types';

export type Exchange = 'binance' | 'coinbase' | 'bybit';
export type DataProvider = 'coingecko' | 'binance';

export interface MarketTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  logo?: string;
  exchange: Exchange;
}

export interface OrderBookData {
  symbol: string;
  bids: Order[];
  asks: Order[];
  lastUpdateId: number;
  spread: number;
  spreadPercent: number;
}

export interface TradeData {
  id: string;
  symbol: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
}

const logoCache = new Map<string, string>();

export const fetchLogo = async (symbol: string): Promise<string> => {
  const baseSymbol = symbol.replace(/USDT|BUSD|BTC|ETH$/i, '').toUpperCase();
  
  if (logoCache.has(baseSymbol)) {
    return logoCache.get(baseSymbol)!;
  }

  try {
    const coinId = coinGecko.getCoinIdFromSymbol(baseSymbol);
    const coinData = await coinGecko.getCoinById(coinId);
    const logo = coinData.image?.small || coinGecko.getDefaultLogo();
    logoCache.set(baseSymbol, logo);
    return logo;
  } catch {
    const defaultLogo = coinGecko.getDefaultLogo();
    logoCache.set(baseSymbol, defaultLogo);
    return defaultLogo;
  }
};

export const fetchTickers = async (
  symbols: string[] = binance.popularSymbols,
  exchange: Exchange = 'binance'
): Promise<MarketTicker[]> => {
  if (exchange === 'binance') {
    const tickerData = await binance.get24hrTicker();
    const tickerArray = Array.isArray(tickerData) ? tickerData : [tickerData];
    
    const filteredTickers = tickerArray.filter(t => 
      symbols.length === 0 || symbols.includes(t.symbol)
    );

    return filteredTickers.map(t => ({
      symbol: t.symbol,
      baseAsset: binance.getBaseAsset(t.symbol),
      quoteAsset: 'USDT',
      price: parseFloat(t.lastPrice),
      priceChange24h: parseFloat(t.priceChange),
      priceChangePercent24h: parseFloat(t.priceChangePercent),
      high24h: parseFloat(t.highPrice),
      low24h: parseFloat(t.lowPrice),
      volume24h: parseFloat(t.volume),
      quoteVolume24h: parseFloat(t.quoteVolume),
      exchange: 'binance',
    }));
  }
  
  throw new Error(`Exchange ${exchange} not yet supported`);
};

export const fetchOrderBook = async (
  symbol: string,
  exchange: Exchange = 'binance',
  limit: number = 20
): Promise<OrderBookData> => {
  if (exchange === 'binance') {
    const data = await binance.getOrderBook(symbol, limit);
    
    let bidTotal = 0;
    let askTotal = 0;
    
    const bids: Order[] = data.bids.map(([price, size]) => {
      const sizeNum = parseFloat(size);
      bidTotal += sizeNum;
      return {
        price: parseFloat(price),
        size: sizeNum,
        total: bidTotal,
        type: 'bid' as const,
      };
    });

    const asks: Order[] = data.asks.map(([price, size]) => {
      const sizeNum = parseFloat(size);
      askTotal += sizeNum;
      return {
        price: parseFloat(price),
        size: sizeNum,
        total: askTotal,
        type: 'ask' as const,
      };
    });

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

    return {
      symbol,
      bids,
      asks,
      lastUpdateId: data.lastUpdateId,
      spread,
      spreadPercent,
    };
  }

  throw new Error(`Exchange ${exchange} not yet supported`);
};

export const fetchCandles = async (
  symbol: string,
  interval: string = '1m',
  limit: number = 100,
  exchange: Exchange = 'binance'
): Promise<Candle[]> => {
  if (exchange === 'binance') {
    const klines = await binance.getKlines(symbol, interval, limit);
    
    return klines.map(k => ({
      time: k.openTime / 1000,
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
      volume: parseFloat(k.volume),
    }));
  }

  throw new Error(`Exchange ${exchange} not yet supported`);
};

export const fetchRecentTrades = async (
  symbol: string,
  limit: number = 50,
  exchange: Exchange = 'binance'
): Promise<TradeData[]> => {
  if (exchange === 'binance') {
    const trades = await binance.getRecentTrades(symbol, limit);
    
    return trades.map(t => ({
      id: t.id.toString(),
      symbol,
      price: parseFloat(t.price),
      size: parseFloat(t.qty),
      time: new Date(t.time).toISOString(),
      side: t.isBuyerMaker ? 'sell' : 'buy',
    }));
  }

  throw new Error(`Exchange ${exchange} not yet supported`);
};

export const fetchTopCoins = async (limit: number = 50): Promise<coinGecko.CoinData[]> => {
  return coinGecko.getTopCoins(limit);
};

export const fetchCoinChart = async (
  symbol: string,
  days: number = 7
): Promise<coinGecko.CoinMarketData> => {
  const coinId = coinGecko.getCoinIdFromSymbol(symbol);
  return coinGecko.getCoinMarketChart(coinId, days);
};

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(4);
  } else if (price >= 0.0001) {
    return price.toFixed(6);
  } else {
    return price.toExponential(4);
  }
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  }
  return volume.toFixed(2);
};

export const formatPercentage = (percent: number): string => {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

export { binance, coinGecko };
