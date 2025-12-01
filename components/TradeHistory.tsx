import React from 'react';
import { Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="flex flex-col h-full bg-terminal-panel">
      <div className="flex text-[9px] text-gray-500 px-1 py-1 border-b border-terminal-border/50 bg-[#111217]">
        <span className="flex-1">Price</span>
        <span className="flex-1 text-right">Size</span>
        <span className="flex-1 text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-hidden relative">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar">
            {trades.map((trade) => (
            <div key={trade.id} className="flex justify-between text-[10px] py-[1px] px-1 font-mono border-b border-white/5 hover:bg-white/5 cursor-default">
                <span className={trade.side === 'buy' ? 'text-terminal-green' : 'text-terminal-red'}>
                {trade.price.toFixed(1)}
                </span>
                <span className={`${Number(trade.size) > 0.5 ? 'text-white font-bold' : 'text-gray-400'}`}>
                {trade.size.toFixed(4)}
                </span>
                <span className="text-gray-500 text-[9px]">{trade.time}</span>
            </div>
            ))}
        </div>
      </div>
      
      {/* Simulation of a 'Tape' statistical bar */}
      <div className="h-14 border-t border-terminal-border bg-[#111217] p-2 grid grid-cols-2 gap-2 text-xxs flex-shrink-0">
         <div>
            <div className="text-gray-500 uppercase tracking-wider text-[8px]">Vol 24h</div>
            <div className="text-white font-mono">276,925 BTC</div>
         </div>
         <div className="text-right">
             <div className="text-gray-500 uppercase tracking-wider text-[8px]">Long/Short</div>
             <div className="flex items-center justify-end space-x-1 mt-0.5">
                 <span className="text-terminal-green font-bold">51%</span>
                 <div className="w-10 h-1.5 bg-gray-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-terminal-green w-[51%]"></div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default TradeHistory;