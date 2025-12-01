import React, { useState } from 'react';
import { Position } from '../types';
import { Filter } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  onClosePosition: (symbol: string) => void;
}

const PositionsTable: React.FC<PositionsTableProps> = ({ positions, onClosePosition }) => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredPositions = positions.filter(pos => {
      if (filterType === 'All') return true;
      return pos.type === filterType;
  });

  return (
    <div className="flex flex-col h-full bg-terminal-panel border-t border-terminal-border">
      <div className="flex items-center border-b border-terminal-border bg-terminal-bg/50">
        <div className="px-3 py-1.5 text-xs font-bold text-white bg-terminal-panel border-r border-t-2 border-t-terminal-green border-r-terminal-border cursor-pointer">
          Positions <span className="text-gray-500 ml-1">({filteredPositions.length})</span>
        </div>
        <div className="px-3 py-1.5 text-xs font-bold text-gray-500 border-r border-terminal-border hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
          Open Orders <span className="text-gray-600 ml-1">(0)</span>
        </div>
        
        {/* Filter Dropdown */}
        <div className="flex items-center ml-2 border-l border-terminal-border/50 pl-2 py-1">
             <Filter size={10} className="text-gray-500 mr-1" />
             <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#0b0c10] border border-gray-700 rounded text-[9px] text-gray-300 outline-none px-1 py-0.5 focus:border-terminal-highlight"
             >
                 <option value="All">All Types</option>
                 <option value="Limit">Limit</option>
                 <option value="Market">Market</option>
                 <option value="Stop">Stop</option>
             </select>
        </div>

        <div className="flex-1"></div>
        <div className="px-2 text-[10px] text-gray-600 font-mono hidden sm:block">
            Unrealized PnL: <span className="text-terminal-red">-19.39 USDT</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-terminal-panel">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#0e0f13] border-b border-terminal-border">
            <tr className="text-[10px] text-gray-500 uppercase tracking-wide">
              <th className="font-medium px-3 py-2">Symbol</th>
              <th className="font-medium px-2 py-2 text-right">Size</th>
              <th className="font-medium px-2 py-2 text-right">Entry Price</th>
              <th className="font-medium px-2 py-2 text-right">Mark Price</th>
              <th className="font-medium px-2 py-2 text-right">Liq. Price</th>
              <th className="font-medium px-2 py-2 text-right">Margin</th>
              <th className="font-medium px-3 py-2 text-right">PnL (ROE%)</th>
              <th className="font-medium px-2 py-2 text-center">Type</th>
              <th className="font-medium px-2 py-2 text-center">Close</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {filteredPositions.map((pos, idx) => (
              <tr key={idx} className="border-b border-terminal-border/30 hover:bg-white/5 transition-colors group">
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-0.5 h-6 ${pos.size > 0 ? 'bg-terminal-green' : 'bg-terminal-red'}`}></div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold text-white text-[11px]">{pos.symbol}</span>
                        <span className="text-[9px] text-yellow-500">Cross 20x</span>
                    </div>
                  </div>
                </td>
                <td className={`px-2 py-2 text-right font-medium ${pos.size > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {pos.size > 0 ? '+' : ''}{pos.size}
                </td>
                <td className="px-2 py-2 text-right text-gray-300">{pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-2 py-2 text-right text-gray-300">{pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-2 py-2 text-right text-orange-400 group-hover:text-orange-300">
                    {pos.liqPrice > 0 ? pos.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                </td>
                <td className="px-2 py-2 text-right text-gray-400">{pos.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-3 py-2 text-right relative">
                    {/* Visual PnL Background Bar */}
                    <div className={`absolute top-1 bottom-1 right-2 left-auto opacity-10 rounded ${pos.pnl >= 0 ? 'bg-terminal-green' : 'bg-terminal-red'}`} style={{ width: `${Math.min(Math.abs(pos.roe), 100)}%` }}></div>
                    <div className={`relative z-10 flex flex-col items-end leading-tight ${pos.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                        <span className="font-bold">{pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(2)}</span>
                        <span className="text-[10px] opacity-80">{pos.roe.toFixed(2)}%</span>
                    </div>
                </td>
                 <td className="px-2 py-2 text-center text-gray-500 text-[10px]">
                    <span className="px-1.5 py-0.5 border border-gray-700 rounded text-gray-400">{pos.type || 'Limit'}</span>
                 </td>
                 <td className="px-2 py-2 text-center">
                   <button 
                     onClick={() => onClosePosition(pos.symbol)}
                     className="text-[10px] bg-terminal-border/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 px-2 py-0.5 rounded transition-all">
                     Market
                   </button>
                 </td>
              </tr>
            ))}
            {filteredPositions.length === 0 && (
                <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-600 italic">No positions found</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTable;