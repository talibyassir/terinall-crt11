const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinMarketData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    price_btc: number;
  };
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

const fetchWithCache = async <T>(url: string, cacheKey: string): Promise<T> => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

export const getTopCoins = async (
  limit: number = 100,
  currency: string = 'usd'
): Promise<CoinData[]> => {
  const url = `${COINGECKO_API}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=7d`;
  return fetchWithCache<CoinData[]>(url, `top-coins-${limit}-${currency}`);
};

export const getCoinById = async (coinId: string): Promise<any> => {
  const url = `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`;
  return fetchWithCache(url, `coin-${coinId}`);
};

export const getCoinMarketChart = async (
  coinId: string,
  days: number = 7,
  currency: string = 'usd'
): Promise<CoinMarketData> => {
  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
  return fetchWithCache<CoinMarketData>(url, `chart-${coinId}-${days}-${currency}`);
};

export const getTrendingCoins = async (): Promise<{ coins: TrendingCoin[] }> => {
  const url = `${COINGECKO_API}/search/trending`;
  return fetchWithCache<{ coins: TrendingCoin[] }>(url, 'trending');
};

export const getGlobalData = async (): Promise<any> => {
  const url = `${COINGECKO_API}/global`;
  return fetchWithCache(url, 'global');
};

export const searchCoins = async (query: string): Promise<any> => {
  const url = `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`;
  return fetchWithCache(url, `search-${query}`);
};

export const getCoinOHLC = async (
  coinId: string,
  days: number = 7,
  currency: string = 'usd'
): Promise<[number, number, number, number, number][]> => {
  const url = `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`;
  return fetchWithCache(url, `ohlc-${coinId}-${days}-${currency}`);
};

export const coinIdMap: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'PEPE': 'pepe',
  'SHIB': 'shiba-inu',
};

export const getCoinIdFromSymbol = (symbol: string): string => {
  return coinIdMap[symbol.toUpperCase()] || symbol.toLowerCase();
};

export const getCoinLogo = (coinId: string): string => {
  return `https://assets.coingecko.com/coins/images/${coinId}/small/${coinId}.png`;
};

export const getDefaultLogo = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNhYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+';
};
