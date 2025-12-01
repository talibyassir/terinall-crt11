
export interface Order {
  price: number;
  size: number;
  total: number;
  type: 'bid' | 'ask';
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
}

export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  margin: number;
  pnl: number;
  roe: number;
  type?: 'Limit' | 'Market' | 'Stop';
}

export interface Candle {
  time: string | number; // Support unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AdvancedChartData {
    candles: Candle[];
    cvd: { time: number; value: number }[];
    oi: { time: number; value: number }[];
    liquidations: { time: number; long: number; short: number }[];
    funding: { time: number; value: number }[];
}

export enum ConnectionStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting...',
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';
