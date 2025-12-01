import { Candle, Order, Position, Trade } from './types';

// Helper to generate some fake candles
const generateCandles = (count: number): Candle[] => {
  const candles: Candle[] = [];
  let price = 56400;
  // Use current time in seconds (Unix timestamp)
  let time = Math.floor(Date.now() / 1000) - (count * 60); 
  
  for (let i = 0; i < count; i++) {
    const open = price;
    const volatility = (Math.random() - 0.5) * 100;
    const close = open + volatility;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    
    candles.push({
      time: time,
      open,
      high,
      low,
      close,
      volume: Math.random() * 100
    });
    price = close;
    time += 60; // 1 minute candles
  }
  return candles;
};

export const INITIAL_CANDLES = generateCandles(100);

export const INITIAL_POSITIONS: Position[] = [
  {
    symbol: 'BTCUSDT',
    size: 0.034,
    entryPrice: 57243.60,
    markPrice: 56416.60,
    liqPrice: 52583.61,
    margin: 108.33,
    pnl: -10.54,
    roe: -51.33,
    type: 'Limit'
  },
  {
    symbol: 'ETHUSDT',
    size: 0.03,
    entryPrice: 2634.01,
    markPrice: 2339.04,
    liqPrice: 0, // Cross margin implies different liq often
    margin: 79.02,
    pnl: -8.85,
    roe: -544.94,
    type: 'Market'
  },
  {
    symbol: 'SOLUSDT',
    size: 15.5,
    entryPrice: 138.50,
    markPrice: 143.20,
    liqPrice: 120.00,
    margin: 250.00,
    pnl: 72.85,
    roe: 29.14,
    type: 'Stop'
  }
];

// Helper to generate noisy orderbook
export const generateOrderBook = (centerPrice: number): { bids: Order[], asks: Order[] } => {
  const bids: Order[] = [];
  const asks: Order[] = [];
  
  let currentBid = centerPrice - 5;
  let currentAsk = centerPrice + 5;
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 20; i++) {
    const bidSize = Math.random() * 2;
    bidTotal += bidSize;
    bids.push({ price: currentBid, size: bidSize, total: bidTotal, type: 'bid' });
    currentBid -= Math.random() * 5;

    const askSize = Math.random() * 2;
    askTotal += askSize;
    asks.push({ price: currentAsk, size: askSize, total: askTotal, type: 'ask' });
    currentAsk += Math.random() * 5;
  }
  return { bids, asks };
};