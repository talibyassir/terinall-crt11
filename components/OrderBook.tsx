
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ChevronDown, Settings, Clock } from 'lucide-react';

interface OrderBookProps {
  bids: Order[];
  asks: Order[];
  currentPrice: number;
  symbol: string;
  fundingRate?: number;
  setSettingsContent?: (n: React.ReactNode) => void;
}

const OrderRow: React.FC<{ order: Order; maxTotal: number; maxSize: number; type: 'bid' | 'ask'; precision: number }> = ({ order, maxTotal, maxSize, type, precision }) => {
  const depthWidth = Math.min((order.total / maxTotal) * 100, 100);
  const sizeWidth = Math.min((order.size / maxSize) * 100, 100);
  
  return (
    <div className="relative flex justify-between items-center text-[10px] h-[18px] px-1 font-mono cursor-pointer hover:bg-white/5 group">
      {/* Background Depth Bar (Cumulative) */}
      <div 
        className={`absolute top-[1px] bottom-[1px] ${type === 'bid' ? 'right-0 bg-[#00bda0]' : 'right-0 bg-[#f04f6d]'} transition-all duration-300 opacity-10`}
        style={{ width: `${depthWidth}%` }}
      />
      
      {/* Background Volume Bar (Size at Price) - Darker/More Opaque */}
      <div 
        className={`absolute top-[2px] bottom-[2px] ${type === 'bid' ? 'right-0 bg-[#00bda0]' : 'right-0 bg-[#f04f6d]'} transition-all duration-300 opacity-20`}
        style={{ width: `${sizeWidth}%` }}
      />

      {/* Price */}
      <span className={`relative z-10 font-bold ${type === 'bid' ? 'text-terminal-green' : 'text-terminal-red'}`}>
        {order.price.toFixed(precision)}
      </span>
      
      {/* Size and Total */}
      <div className="relative z-10 flex gap-2">
          <span className="text-gray-200 font-bold">{order.size.toFixed(2)}</span>
          <span className="text-gray-600 w-10 text-right">{order.total.toFixed(1)}</span>
      </div>
    </div>
  );
};

const OrderBookSettings: React.FC<{
    precision: number,
    setPrecision: (n: number) => void,
    rowCount: number,
    setRowCount: (n: number) => void
}> = ({ precision, setPrecision, rowCount, setRowCount }) => (
    <div className="space-y-4 font-mono text-xs">
        <div>
            <h4 className="text-gray-500 uppercase text-[10px] mb-2 font-bold">Grouping</h4>
            <div className="flex gap-2">
                {[0.01, 0.1, 1, 10].map(p => (
                    <button 
                        key={p}
                        onClick={() => setPrecision(p === 0.01 ? 2 : p === 0.1 ? 1 : 0)} 
                        className={`px-2 py-1 rounded text-[10px] border ${
                            (p === 0.01 && precision === 2) || (p === 0.1 && precision === 1) || (p >= 1 && precision === 0) 
                            ? 'bg-terminal-highlight border-terminal-highlight text-white' 
                            : 'border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <h4 className="text-gray-500 uppercase text-[10px] mb-2 font-bold">Max Rows</h4>
            <input 
                type="range" 
                min="5" 
                max="50" 
                value={rowCount} 
                onChange={(e) => setRowCount(Number(e.target.value))}
                className="w-full accent-terminal-highlight"
            />
            <div className="text-right text-[10px] text-gray-400">{rowCount} rows</div>
        </div>
    </div>
  );

const OrderBook: React.FC<OrderBookProps> = ({ bids, asks, currentPrice, symbol, fundingRate = 0.001, setSettingsContent }) => {
  const [precision, setPrecision] = useState(2);
  const [rowCount, setRowCount] = useState(16);

  useEffect(() => {
    if (setSettingsContent) {
        setSettingsContent(
            <OrderBookSettings 
                precision={precision} 
                setPrecision={setPrecision} 
                rowCount={rowCount} 
                setRowCount={setRowCount}
            />
        );
    }
  }, [setSettingsContent, precision, rowCount]);

  const maxTotal = 200; 
  
  // Calculate max single order size in current view for the relative volume bars
  const visibleBids = bids.slice(0, rowCount);
  const visibleAsks = asks.slice().reverse().slice(0, rowCount);
  const maxSize = Math.max(
      ...visibleBids.map(o => o.size),
      ...visibleAsks.map(o => o.size),
      0.1 // Prevent divide by zero
  );

  return (
    <div className="flex flex-col h-full bg-[#111217] overflow-hidden">
      
      {/* Internal Header specific to the Screenshot style */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#16171d] border-b border-terminal-border/50 text-[10px] font-mono">
          <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1 text-terminal-green font-bold cursor-pointer hover:text-white">
                  <div className="w-3 h-3 rounded-full bg-gray-700 text-[8px] flex items-center justify-center">B</div>
                  {symbol} <ChevronDown size={10} />
              </div>
              <div className="flex items-center gap-1 text-gray-500 border-l border-gray-800 pl-3 ml-1">
                  <Clock size={10} className="text-gray-600" />
                  <span className="text-[9px]">Fund:</span>
                  <span className={`font-bold ${fundingRate > 0 ? 'text-terminal-highlight' : 'text-terminal-red'}`}>
                      {fundingRate.toFixed(4)}%
                  </span>
              </div>
          </div>
          <div className="flex gap-1 text-gray-500">
             <div className="px-1 bg-[#2a2b30] rounded text-[8px]">m</div>
             <div className="px-1 bg-[#2a2b30] rounded text-[8px]">$</div>
             <div className="px-1 bg-[#2a2b30] rounded text-[8px]"><Settings size={8} /></div>
          </div>
      </div>

      {/* Asks (Sell Orders) - Top section */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end no-scrollbar">
        {asks.slice().reverse().slice(0, rowCount).reverse().map((ask, i) => (
          <OrderRow key={`ask-${i}`} order={ask} maxTotal={maxTotal} maxSize={maxSize} type="ask" precision={precision} />
        ))}
      </div>
      
      {/* Central Spread / Price Display */}
      <div className="py-1 border-y border-terminal-border/20 bg-[#16171d] font-mono flex items-center justify-between px-2 relative h-10">
        
        {/* Background visual bars for spread info */}
        <div className="absolute left-0 right-0 top-1 h-1 flex gap-0.5 opacity-30">
             <div className="h-full w-1/2 bg-transparent"></div> {/* Placeholder */}
             <div className="h-full w-1/4 bg-terminal-green rounded-sm"></div>
             <div className="h-full w-1/4 bg-terminal-red rounded-sm"></div>
        </div>

        <div className="flex-1">
             {/* Micro-chart or sparkline could go here */}
        </div>

        {/* Center Price */}
        <div className="text-2xl font-bold tracking-tighter text-terminal-green mx-auto z-10">
            {currentPrice.toFixed(precision)}
        </div>

        {/* Right side indicators (IMB, UPD, WGT) */}
        <div className="flex flex-col text-[8px] text-gray-500 gap-[1px] w-20 items-end z-10">
             <div className="flex items-center w-full justify-end gap-1">
                 <span>IMB</span>
                 <div className="w-10 h-1 bg-gray-800 rounded-sm overflow-hidden"><div className="w-[60%] h-full bg-terminal-green"></div></div>
             </div>
             <div className="flex items-center w-full justify-end gap-1">
                 <span>UPD</span>
                 <div className="w-10 h-1 bg-gray-800 rounded-sm overflow-hidden"><div className="w-[80%] h-full bg-terminal-red"></div></div>
             </div>
             <div className="flex items-center w-full justify-end gap-1">
                 <span>WGT</span>
                 <div className="w-10 h-1 bg-gray-800 rounded-sm overflow-hidden"><div className="w-[30%] h-full bg-gray-500"></div></div>
             </div>
        </div>
      </div>

      {/* Bids (Buy Orders) - Bottom section */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {bids.slice(0, rowCount).map((bid, i) => (
          <OrderRow key={`bid-${i}`} order={bid} maxTotal={maxTotal} maxSize={maxSize} type="bid" precision={precision} />
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
