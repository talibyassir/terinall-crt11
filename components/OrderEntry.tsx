import React, { useState } from 'react';
import { DollarSign, Percent, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { OrderSide, OrderType } from '../types';

interface OrderEntryProps {
  currentPrice: number;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ currentPrice }) => {
  const [side, setSide] = useState<OrderSide>('buy');
  const [type, setType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [size, setSize] = useState<string>('0.001');
  const [leverage, setLeverage] = useState<number>(20);

  // Update price when currentPrice changes if user hasn't edited it manually? 
  // For simplicity, we just initialize. Users often want sticky inputs.

  const totalValue = (parseFloat(price || '0') * parseFloat(size || '0'));
  const marginRequired = totalValue / leverage;

  return (
    <div className="flex flex-col h-full bg-terminal-panel p-2 font-mono text-xs overflow-y-auto no-scrollbar">
      
      {/* Type Selector */}
      <div className="flex bg-[#0b0c10] p-0.5 rounded border border-terminal-border mb-3">
        <button 
            onClick={() => setType('limit')}
            className={`flex-1 py-1 text-center rounded transition-all ${type === 'limit' ? 'bg-terminal-border text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
            Limit
        </button>
        <button 
            onClick={() => setType('market')}
            className={`flex-1 py-1 text-center rounded transition-all ${type === 'market' ? 'bg-terminal-border text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
            Market
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-3 mb-4">
        {type === 'limit' && (
            <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Order Price (USDT)</label>
                <div className="relative group">
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-terminal-border rounded px-2 py-1.5 text-right text-white focus:border-terminal-highlight outline-none transition-colors"
                    />
                    <span className="absolute left-2 top-1.5 text-gray-600 pointer-events-none">$</span>
                </div>
            </div>
        )}

        <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Order Size (BTC)</label>
            <div className="relative">
                <input 
                    type="number" 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-terminal-border rounded px-2 py-1.5 text-right text-white focus:border-terminal-highlight outline-none transition-colors"
                />
                <span className="absolute left-2 top-1.5 text-gray-600 pointer-events-none">BTC</span>
            </div>
        </div>

        {/* Leverage Slider Mock */}
        <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Leverage</span>
                <span className="text-yellow-500">{leverage}x</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="125" 
                value={leverage} 
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-1 bg-terminal-border rounded-lg appearance-none cursor-pointer accent-terminal-highlight"
            />
        </div>
      </div>

      {/* Percentages */}
      <div className="grid grid-cols-4 gap-1 mb-4">
          {[10, 25, 50, 100].map(pct => (
              <button key={pct} className="bg-[#1c1e24] hover:bg-terminal-border text-gray-400 text-[9px] py-1 rounded border border-transparent hover:border-gray-600 transition-all">
                  {pct}%
              </button>
          ))}
      </div>

      {/* Summary */}
      <div className="flex flex-col space-y-1 mb-4 p-2 bg-[#16171d] rounded border border-terminal-border/50">
          <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Value</span>
              <span className="text-gray-300">{totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})} USDT</span>
          </div>
          <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Cost</span>
              <span className="text-white">{marginRequired.toLocaleString(undefined, {maximumFractionDigits: 2})} USDT</span>
          </div>
          <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Available</span>
              <span className="text-terminal-highlight">132.25 USDT</span>
          </div>
      </div>

      <div className="mt-auto flex space-x-2">
         <button 
            onClick={() => setSide('buy')}
            className="flex-1 bg-terminal-green/10 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-white py-2 rounded flex flex-col items-center justify-center transition-all group"
         >
             <span className="font-bold">Buy / Long</span>
         </button>
         <button 
            onClick={() => setSide('sell')}
            className="flex-1 bg-terminal-red/10 border border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-white py-2 rounded flex flex-col items-center justify-center transition-all group"
         >
             <span className="font-bold">Sell / Short</span>
         </button>
      </div>
    </div>
  );
};

export default OrderEntry;
