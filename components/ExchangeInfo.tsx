
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

interface TickerData {
    exchange: string;
    pair: string;
    price: number;
    change: number;
    funding?: number;
}

interface ExchangeInfoProps {
    currentBtcPrice?: number;
}

const INITIAL_TICKERS: TickerData[] = [
    { exchange: 'okx', pair: 'ADA-USDT-SWAP', price: 0.3420, change: -4.00, funding: 0.01 },
    { exchange: 'okx', pair: 'BTC-USD-240927', price: 56416.60, change: 1.06 },
    { exchange: 'binance', pair: 'BTCUSDT', price: 56407.60, change: -1.08, funding: 0.003 },
    { exchange: 'bybit', pair: 'BTC-USD-SWAP', price: 56423.90, change: 4.28, funding: 0.01 },
    { exchange: 'coinbase', pair: 'BTC-USD', price: 56430.10, change: 0.85 },
    { exchange: 'okx', pair: 'ETH-USDT-SWAP', price: 2335.00, change: -5.71, funding: 0.01 },
    { exchange: 'binance', pair: 'ETHUSDT', price: 2337.50, change: -2.15 },
    { exchange: 'bybit', pair: 'SOL-USDT', price: 132.45, change: 5.45 },
];

const ExchangeInfo: React.FC<ExchangeInfoProps> = ({ currentBtcPrice }) => {
  const [tickers, setTickers] = useState<TickerData[]>(INITIAL_TICKERS);

  // Update Binance BTC price if provided
  useEffect(() => {
    if (currentBtcPrice) {
        setTickers(prev => prev.map(t => {
            if (t.pair === 'BTCUSDT' && t.exchange === 'binance') {
                return { ...t, price: currentBtcPrice };
            }
            return t;
        }));
    }
  }, [currentBtcPrice]);

  // Simulate live price updates for others
  useEffect(() => {
    const interval = setInterval(() => {
        setTickers(prev => prev.map(t => {
            // Skip the real one if we have live data
            if (currentBtcPrice && t.pair === 'BTCUSDT' && t.exchange === 'binance') return t;

            return {
                ...t,
                price: t.price * (1 + (Math.random() - 0.5) * 0.0005),
                change: t.change + (Math.random() - 0.5) * 0.1
            };
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentBtcPrice]);

  return (
    <div className="flex flex-col h-full bg-[#111217] font-mono text-[10px] overflow-hidden">
      <div className="grid grid-cols-4 bg-[#16171d] border-b border-terminal-border text-gray-500 py-1.5 px-2">
        <span className="col-span-2">Instrument</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h%</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
          {tickers.map((ticker, i) => (
              <div key={i} className="grid grid-cols-4 items-center py-2 px-2 border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
                      {/* Fake Exchange Icons */}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-black flex-shrink-0 
                        ${ticker.exchange === 'binance' ? 'bg-yellow-500' : 
                          ticker.exchange === 'okx' ? 'bg-white' : 
                          ticker.exchange === 'bybit' ? 'bg-black border border-gray-600 text-white' : 'bg-blue-500'}`}>
                          {ticker.exchange[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight truncate">
                          <span className="font-bold text-gray-200 truncate">{ticker.pair}</span>
                          <span className="text-[8px] text-gray-500 uppercase">{ticker.exchange} {ticker.funding ? `• ${ticker.funding}%` : ''}</span>
                      </div>
                  </div>
                  
                  <div className={`text-right font-medium ${ticker.price > 50000 ? 'text-terminal-highlight' : 'text-gray-300'}`}>
                      {ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  
                  <div className={`text-right flex items-center justify-end ${ticker.change >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                      {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default ExchangeInfo;
