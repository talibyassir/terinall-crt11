
import React, { useRef, useEffect, useState } from 'react';
import { Candle, Trade } from '../types';
import { Settings, Layers, Activity, Circle, BarChart2 } from 'lucide-react';

interface OrderFlowWidgetProps {
  candles: Candle[];
  trades: Trade[];
}

const OrderFlowWidget: React.FC<OrderFlowWidgetProps> = ({ candles, trades }) => {
  const [viewMode, setViewMode] = useState<'footprint' | 'bubbles'>('footprint');
  const [showVPVR, setShowVPVR] = useState(true);
  
  // Simulation of "Footprint" data structure
  // In a real app, this would be aggregated on the backend or inside a worker
  const renderFootprintCandle = (candle: Candle, index: number) => {
      const height = Math.max(40, Math.abs(candle.open - candle.close) * 20); // Scale height
      const isGreen = candle.close >= candle.open;
      const range = Math.abs(candle.high - candle.low);
      const rows = 10; // Divisions inside the candle
      
      return (
          <div key={index} className="flex flex-col items-center mx-1 relative group" style={{ height: '300px', width: '60px' }}>
              {/* Wick */}
              <div className="absolute top-4 bottom-4 w-[1px] bg-gray-700 opacity-50"></div>
              
              {/* Candle Body */}
              <div 
                className={`relative w-full border ${isGreen ? 'border-terminal-green/30 bg-terminal-green/5' : 'border-terminal-red/30 bg-terminal-red/5'} rounded-sm overflow-hidden flex flex-col text-[8px] font-mono`}
                style={{ height: `${height}px`, marginTop: 'auto', marginBottom: 'auto' }} // Centered for mock
              >
                  {Array.from({ length: rows }).map((_, r) => {
                      // Simulating bid/ask clusters
                      const bidVol = Math.floor(Math.random() * 100);
                      const askVol = Math.floor(Math.random() * 100);
                      const isHigh = bidVol + askVol > 150;
                      
                      return (
                          <div key={r} className="flex-1 flex items-center justify-between px-0.5 hover:bg-white/10 transition-colors">
                              <span className="text-gray-500">{bidVol}</span>
                              <span className={`text-gray-300 ${isHigh ? 'font-bold text-white' : ''}`}>{askVol}</span>
                          </div>
                      );
                  })}
              </div>
              
              {/* Time Label */}
              <div className="mt-2 text-[9px] text-gray-600 font-mono transform -rotate-45 origin-top-left">
                  {new Date(Number(candle.time) * 1000).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] text-white font-mono text-xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#16171d] border-b border-terminal-border/50">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setViewMode('footprint')}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'footprint' ? 'bg-white/10 text-terminal-highlight' : 'text-gray-500 hover:text-white'}`}
                >
                    <Activity size={12} /> Footprint
                </button>
                <button 
                    onClick={() => setViewMode('bubbles')}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'bubbles' ? 'bg-white/10 text-terminal-highlight' : 'text-gray-500 hover:text-white'}`}
                >
                    <Circle size={12} /> Bubbles
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowVPVR(!showVPVR)}
                    className={`p-1 rounded ${showVPVR ? 'text-terminal-highlight' : 'text-gray-500 hover:text-white'}`}
                    title="Toggle VPVR"
                >
                    <BarChart2 size={14} />
                </button>
                <Settings size={14} className="text-gray-500 hover:text-white cursor-pointer" />
            </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative overflow-hidden flex">
            {/* Main Canvas Area */}
            <div className="flex-1 flex items-center overflow-x-auto no-scrollbar px-4 py-8 relative">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 pointer-events-none z-0 flex flex-col justify-between py-10 opacity-10">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-gray-500"></div>)}
                </div>

                {/* Candles */}
                <div className="flex items-end h-full gap-1 z-10">
                    {candles.slice(-15).map((c, i) => renderFootprintCandle(c, i))}
                </div>

                {/* Bubble Overlay */}
                {viewMode === 'bubbles' && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div 
                                key={i}
                                className="absolute rounded-full border border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center text-[8px] text-yellow-500 animate-pulse"
                                style={{
                                    left: `${Math.random() * 80}%`,
                                    top: `${Math.random() * 80}%`,
                                    width: `${Math.random() * 40 + 20}px`,
                                    height: `${Math.random() * 40 + 20}px`,
                                }}
                            >
                                {(Math.random() * 10).toFixed(1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* VPVR Side Panel */}
            {showVPVR && (
                <div className="w-16 border-l border-terminal-border/20 h-full flex flex-col justify-center bg-[#111217]/50">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 flex items-center justify-end pr-1 relative group">
                            <div 
                                className="absolute right-0 top-[1px] bottom-[1px] bg-blue-500/20" 
                                style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                            <span className="relative z-10 text-[8px] text-gray-600 group-hover:text-white transition-colors">
                                {(56000 + i * 50).toFixed(0)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Footer Stats */}
        <div className="h-6 bg-[#16171d] border-t border-terminal-border/50 flex items-center px-2 text-[9px] text-gray-500 gap-4">
            <span>Delta: <span className="text-terminal-green">+452</span></span>
            <span>CVD: <span className="text-terminal-red">-1.2K</span></span>
            <span>Vol: <span className="text-white">12.5M</span></span>
        </div>
    </div>
  );
};

export default OrderFlowWidget;
