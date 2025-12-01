
import React from 'react';
import { Trade } from '../types';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface AggrProps {
  trades: Trade[];
}

const Aggr: React.FC<AggrProps> = ({ trades }) => {
  // Filter for 'interesting' trades to simulate aggregation
  // In a real app, this would aggregate small trades or filter by size
  
  return (
    <div className="flex flex-col h-full bg-[#111217] font-mono text-[10px] overflow-hidden">
      <div className="flex justify-between items-center px-2 py-1 bg-[#16171d] border-b border-terminal-border text-gray-500">
          <div className="flex space-x-4">
              <span>Price</span>
              <span>Value (USD)</span>
          </div>
          <span>Time</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {trades.map((trade) => {
            const value = trade.price * trade.size;
            const isWhale = value > 5000; // Simulated threshold for visual emphasis
            const isBuy = trade.side === 'buy';
            
            // Visual styles based on size and side
            let bgClass = "bg-transparent";
            let textClass = isBuy ? "text-terminal-green" : "text-terminal-red";
            let rowHeight = "h-5";

            if (isWhale) {
                bgClass = isBuy ? "bg-terminal-green/20" : "bg-terminal-red/20";
                textClass = "text-white font-bold";
                rowHeight = "h-6";
            }

            return (
                <div key={trade.id} className={`flex items-center justify-between px-2 ${rowHeight} border-b border-white/5 hover:bg-white/10 transition-colors ${bgClass} ${textClass}`}>
                    <div className="flex items-center space-x-2">
                        {isBuy ? <ArrowUp size={10} className={isWhale ? "text-terminal-green" : ""} /> : <ArrowDown size={10} className={isWhale ? "text-terminal-red" : ""} />}
                        <span>{trade.price.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex-1 text-center opacity-80">
                        ${(value / 1000).toFixed(1)}K
                    </div>
                    
                    <div className="text-gray-500 text-[9px]">
                        {/* Show seconds ago if very recent, else time */}
                        {trade.time.split(':')[2]}s
                    </div>
                </div>
            );
        })}
      </div>
      
      {/* Streaming Indicator */}
      <div className="p-1 bg-[#0b0c10] border-t border-terminal-border flex justify-center">
        <Activity size={10} className="text-terminal-highlight animate-pulse" />
      </div>
    </div>
  );
};

export default Aggr;
