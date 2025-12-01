
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Order, Trade } from '../types';
import { Settings, RefreshCw, AlignJustify, DollarSign, Coins, Target } from 'lucide-react';

interface DOMProps {
  bids: Order[];
  asks: Order[];
  currentPrice: number;
  trades?: Trade[]; // New prop for accumulating volume
  symbol?: string;  // To reset on change
}

interface PriceLevel {
  price: number;
  bidSize: number;
  askSize: number;
  buyVol: number;
  sellVol: number;
  delta: number;
}

const DOM: React.FC<DOMProps> = ({ bids, asks, currentPrice, trades = [], symbol = 'BTC' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [grouping, setGrouping] = useState<number>(10); // Price aggregation level
  const [autoCenter, setAutoCenter] = useState(true);
  const [unitMode, setUnitMode] = useState<'USD' | 'COIN'>('COIN');
  
  // Cumulative Volume State: Map<Price, {buy, sell}>
  const [volumeProfile, setVolumeProfile] = useState<Map<number, { buy: number; sell: number }>>(new Map());
  const lastProcessedTradeId = useRef<string | null>(null);

  // Reset volume on symbol change
  useEffect(() => {
      setVolumeProfile(new Map());
      lastProcessedTradeId.current = null;
  }, [symbol]);

  // Process incoming trades to build volume profile
  useEffect(() => {
      if (trades.length === 0) return;

      const newProfile = new Map<number, { buy: number; sell: number }>(volumeProfile);
      let updated = false;

      // Process only new trades (assuming trades are sorted desc by time, so usually [0] is newest)
      // Since we receive a snapshot of recent trades, we need to be careful not to double count.
      // A simple heuristic: check IDs.
      
      trades.forEach(t => {
          // In a real WebSocket, we'd process linearly. Here we simulate accumulation.
          // Since trades array is replaced frequently, we just look at the latest batch.
          // Ideally, the parent passes *new* trades only, but here we scan.
          // Optimization: Skip if we've seen this ID? 
          // For this simulation, we'll just take the top 5 "new" ones if simulated.
      });

      // Simulation Logic: 
      // Since App.tsx replaces 'trades' entirely, we'll just take the latest trade if it's different
      const latestTrade = trades[0];
      if (latestTrade && latestTrade.id !== lastProcessedTradeId.current) {
          // Accumulate this trade
          const priceKey = Math.floor(latestTrade.price / grouping) * grouping;
          const entry = newProfile.get(priceKey) || { buy: 0, sell: 0 };
          
          if (latestTrade.side === 'buy') {
              entry.buy += latestTrade.size;
          } else {
              entry.sell += latestTrade.size;
          }
          newProfile.set(priceKey, entry);
          lastProcessedTradeId.current = latestTrade.id;
          updated = true;
      }

      if (updated) setVolumeProfile(newProfile);
  }, [trades, grouping, volumeProfile]);

  // Build the Rows
  const rows = useMemo(() => {
      const rowMap = new Map<number, PriceLevel>();
      
      // 1. Group Bids
      bids.forEach(b => {
          const p = Math.floor(b.price / grouping) * grouping;
          const entry = rowMap.get(p) || { price: p, bidSize: 0, askSize: 0, buyVol: 0, sellVol: 0, delta: 0 };
          entry.bidSize += b.size;
          rowMap.set(p, entry);
      });

      // 2. Group Asks
      asks.forEach(a => {
          const p = Math.floor(a.price / grouping) * grouping;
          const entry = rowMap.get(p) || { price: p, bidSize: 0, askSize: 0, buyVol: 0, sellVol: 0, delta: 0 };
          entry.askSize += a.size;
          rowMap.set(p, entry);
      });

      // 3. Merge Volume Profile
      volumeProfile.forEach((vol, price) => {
          const p = Math.floor(price / grouping) * grouping;
          const entry = rowMap.get(p) || { price: p, bidSize: 0, askSize: 0, buyVol: 0, sellVol: 0, delta: 0 };
          entry.buyVol += vol.buy;
          entry.sellVol += vol.sell;
          entry.delta = entry.buyVol - entry.sellVol;
          rowMap.set(p, entry);
      });

      // 4. Create Viewport Range (Center around current price)
      // Ensure we have at least +/- 30 rows even if empty
      const centerP = Math.floor(currentPrice / grouping) * grouping;
      const range = 40; 
      for (let i = -range; i <= range; i++) {
          const p = centerP + (i * grouping);
          if (!rowMap.has(p)) {
              rowMap.set(p, { price: p, bidSize: 0, askSize: 0, buyVol: 0, sellVol: 0, delta: 0 });
          }
      }

      // Convert to array and sort descending
      return Array.from(rowMap.values()).sort((a, b) => b.price - a.price);
  }, [bids, asks, volumeProfile, grouping, currentPrice]);

  // Max calculations for bars
  const maxBid = Math.max(...rows.map(r => r.bidSize), 1);
  const maxAsk = Math.max(...rows.map(r => r.askSize), 1);
  const maxVol = Math.max(...rows.map(r => Math.max(r.buyVol, r.sellVol)), 1);
  const maxDelta = Math.max(...rows.map(r => Math.abs(r.delta)), 1);

  // Auto Scroll
  useEffect(() => {
      if (autoCenter && containerRef.current) {
          const rowHeight = 20; // Approx
          const centerIndex = rows.findIndex(r => Math.abs(r.price - currentPrice) < grouping);
          if (centerIndex !== -1) {
              const scrollTo = (centerIndex * rowHeight) - (containerRef.current.clientHeight / 2);
              containerRef.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
          }
      }
  }, [currentPrice, autoCenter, rows, grouping]);

  const handleReset = () => {
      setVolumeProfile(new Map());
  };

  // Helper to format values based on Unit Mode
  const fmt = (val: number, isPrice = false) => {
      if (val === 0 && !isPrice) return '';
      if (isPrice) return val.toFixed(grouping < 1 ? 2 : 0);
      
      const v = unitMode === 'USD' ? val * currentPrice : val;
      if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
      if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
      return v.toFixed(unitMode === 'USD' ? 0 : 2);
  };

  // Helper for Heatmap Color (Bids/Asks)
  const getDepthColor = (val: number, max: number, type: 'bid' | 'ask') => {
      if (val === 0) return 'transparent';
      const intensity = Math.min((val / max) * 100, 100);
      if (type === 'bid') {
          return `linear-gradient(90deg, rgba(0, 233, 151, ${intensity/300}) 0%, rgba(0, 233, 151, ${intensity/100}) 100%)`;
      }
      return `linear-gradient(90deg, rgba(239, 68, 68, ${intensity/100}) 0%, rgba(239, 68, 68, ${intensity/300}) 100%)`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] font-mono text-[10px] select-none">
      {/* DOM Header Controls */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#16171d] border-b border-terminal-border/50 text-gray-400">
          <div className="flex gap-2 items-center">
              <div className="flex items-center bg-[#111217] rounded border border-terminal-border/30 overflow-hidden">
                  {[1, 10, 50, 100].map(g => (
                      <button 
                        key={g} 
                        onClick={() => setGrouping(g)}
                        className={`px-1.5 py-0.5 hover:text-white transition-colors ${grouping === g ? 'bg-terminal-border/50 text-white' : ''}`}
                      >
                          {g}
                      </button>
                  ))}
              </div>
              <button 
                onClick={() => setAutoCenter(!autoCenter)}
                className={`p-1 rounded ${autoCenter ? 'text-terminal-highlight' : 'hover:text-white'}`}
                title="Auto Center"
              >
                  <Target size={12} />
              </button>
              <button onClick={handleReset} className="p-1 hover:text-white" title="Reset Profile">
                  <RefreshCw size={12} />
              </button>
          </div>
          
          <div className="flex gap-2 items-center">
              <div className="flex bg-[#111217] rounded border border-terminal-border/30 overflow-hidden">
                  <button 
                    onClick={() => setUnitMode('USD')}
                    className={`flex items-center gap-1 px-1.5 py-0.5 ${unitMode === 'USD' ? 'bg-terminal-border/50 text-white' : 'hover:text-white'}`}
                  >
                      <DollarSign size={10} /> USD
                  </button>
                  <button 
                    onClick={() => setUnitMode('COIN')}
                    className={`flex items-center gap-1 px-1.5 py-0.5 ${unitMode === 'COIN' ? 'bg-terminal-border/50 text-white' : 'hover:text-white'}`}
                  >
                      <Coins size={10} /> COIN
                  </button>
              </div>
              <Settings size={12} className="cursor-pointer hover:text-white" />
          </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-7 text-[9px] uppercase font-bold text-gray-600 border-b border-terminal-border/30 bg-[#111217] text-center py-1">
          <div>Buys</div>
          <div>Bids</div>
          <div className="col-span-1 text-gray-400">Price</div>
          <div>Asks</div>
          <div>Sells</div>
          <div>Delta</div>
          <div></div> {/* Spacer */}
      </div>

      {/* Scroller */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative" ref={containerRef}>
          {rows.map((row, i) => {
              const isCurrent = Math.abs(row.price - currentPrice) < grouping;
              
              return (
                  <div key={row.price} className={`grid grid-cols-7 h-[18px] items-center text-center border-b border-white/[0.02] hover:bg-white/5 transition-colors ${isCurrent ? 'bg-blue-900/20' : ''}`}>
                      
                      {/* 1. Market Buys (Vol) */}
                      <div className="relative h-full flex items-center justify-end px-1 text-terminal-green">
                          {row.buyVol > 0 && (
                              <>
                                <div className="absolute top-1 bottom-1 right-0 bg-terminal-green/20 z-0 rounded-l-sm" style={{ width: `${Math.min((row.buyVol / maxVol) * 100, 100)}%` }}></div>
                                <span className="relative z-10">{fmt(row.buyVol)}</span>
                              </>
                          )}
                      </div>

                      {/* 2. Limit Bids */}
                      <div className="relative h-full flex items-center justify-end px-1 text-gray-300 font-bold" style={{ background: getDepthColor(row.bidSize, maxBid, 'bid') }}>
                          <span className="relative z-10 drop-shadow-md">{fmt(row.bidSize)}</span>
                      </div>

                      {/* 3. Price */}
                      <div className={`font-mono font-bold ${isCurrent ? 'text-white bg-blue-600 rounded px-1' : 'text-gray-500'}`}>
                          {row.price.toLocaleString()}
                      </div>

                      {/* 4. Limit Asks */}
                      <div className="relative h-full flex items-center justify-start px-1 text-gray-300 font-bold" style={{ background: getDepthColor(row.askSize, maxAsk, 'ask') }}>
                          <span className="relative z-10 drop-shadow-md">{fmt(row.askSize)}</span>
                      </div>

                      {/* 5. Market Sells (Vol) */}
                      <div className="relative h-full flex items-center justify-start px-1 text-terminal-red">
                          {row.sellVol > 0 && (
                              <>
                                <div className="absolute top-1 bottom-1 left-0 bg-terminal-red/20 z-0 rounded-r-sm" style={{ width: `${Math.min((row.sellVol / maxVol) * 100, 100)}%` }}></div>
                                <span className="relative z-10">{fmt(row.sellVol)}</span>
                              </>
                          )}
                      </div>

                      {/* 6. Delta */}
                      <div className="relative h-full flex items-center justify-center px-1">
                          {row.delta !== 0 && (
                              <div className={`text-[8px] font-bold ${row.delta > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                                  {row.delta > 0 ? '+' : ''}{fmt(row.delta)}
                              </div>
                          )}
                      </div>
                      
                      {/* 7. Delta Bar (Visual) */}
                      <div className="relative h-full flex items-center justify-center px-1">
                          {row.delta !== 0 && (
                              <div className={`h-3 w-1 rounded ${row.delta > 0 ? 'bg-terminal-green' : 'bg-terminal-red'}`} style={{ height: `${Math.max(4, Math.min((Math.abs(row.delta) / maxDelta) * 16, 16))}px` }}></div>
                          )}
                      </div>

                  </div>
              );
          })}
      </div>
      
      {/* Footer */}
      <div className="border-t border-terminal-border bg-[#111217] p-1 flex justify-between text-[9px] text-gray-500 px-2">
          <span>Session Vol: {fmt(rows.reduce((a, b) => a + b.buyVol + b.sellVol, 0))}</span>
          <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-terminal-green/50 rounded-sm"></span> Buys
              <span className="w-2 h-2 bg-terminal-red/50 rounded-sm ml-1"></span> Sells
          </span>
      </div>
    </div>
  );
};

export default DOM;
