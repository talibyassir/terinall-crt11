
import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HeatmapModule from 'highcharts/modules/heatmap';
import { Settings, Monitor, Filter, Maximize2, Layers } from 'lucide-react';

// Initialize module safely
try {
    if (typeof HeatmapModule === 'function') {
        HeatmapModule(Highcharts);
    }
} catch (e) {
    console.warn("Highcharts Heatmap already loaded");
}

const HeatmapWidget: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const [resolution, setResolution] = useState<'SD' | 'HD'>('HD');

  useEffect(() => {
    if (chartContainerRef.current) {
        // --- 1. Data Generation (Simulating "Liquidity Walls") ---
        const timeSteps = 100;
        const priceLevels = 60;
        const heatmapData = [];
        const vpvrData = []; // Volume Profile for right side
        
        // Create some persistent "Walls"
        const walls = [15, 30, 45]; // Price indices with high liquidity
        
        for (let x = 0; x < timeSteps; x++) {
            for (let y = 0; y < priceLevels; y++) {
                // Base noise
                let liquidity = Math.random() * 20;
                
                // Add Walls (Horizontal Lines)
                walls.forEach(w => {
                    if (Math.abs(y - w) < 2) {
                        liquidity += Math.random() * 50 + 50; // High liquidity
                    }
                });

                // Add "Market Orders" (Vertical Lines / Noise)
                if (x % 10 === 0 && Math.abs(y - 30) < 10) {
                    liquidity += Math.random() * 30;
                }

                heatmapData.push([x, y, Math.floor(liquidity)]);
            }
        }

        // Generate VPVR Data (Aggregate liquidity per price level)
        for (let y = 0; y < priceLevels; y++) {
            let totalLiq = 0;
            heatmapData.filter(d => d[1] === y).forEach(d => totalLiq += d[2]);
            vpvrData.push([y, totalLiq]); // [y, x] for horizontal bar
        }

        const options: Highcharts.Options = {
            chart: {
                backgroundColor: '#0f0b1e', // Deep Purple Background
                margin: [40, 60, 20, 40], // Top, Right (for VPVR), Bottom, Left
                style: { fontFamily: "'JetBrains Mono', monospace" }
            },
            title: { text: undefined },
            credits: { enabled: false },
            xAxis: {
                visible: false,
                minPadding: 0,
                maxPadding: 0,
                gridLineWidth: 0
            },
            yAxis: [
                { // Heatmap Y-Axis (Price)
                    title: { text: null },
                    labels: { enabled: false },
                    gridLineWidth: 0,
                    startOnTick: false,
                    endOnTick: false,
                    height: '100%',
                    width: '85%'
                },
                { // VPVR Y-Axis (Right Side)
                    title: { text: null },
                    labels: { enabled: false },
                    gridLineWidth: 0,
                    left: '85%',
                    width: '15%',
                    height: '100%',
                    offset: 0
                }
            ],
            colorAxis: {
                stops: [
                    [0, '#0f0b1e'],   // Background match
                    [0.1, '#2e1a47'], // Faint Purple
                    [0.3, '#3b0764'], // Deep Purple
                    [0.5, '#1d4ed8'], // Blue
                    [0.7, '#06b6d4'], // Cyan
                    [0.85, '#fbbf24'],// Yellow
                    [1, '#ef4444']    // Red (Max)
                ],
                min: 0,
                max: 120,
            },
            legend: { enabled: false },
            tooltip: {
                backgroundColor: '#16171d',
                borderColor: '#2a2b30',
                style: { color: '#fff' },
                formatter: function() {
                    if (this.series.name === 'VPVR') {
                        return `Price Lvl: ${this.x} <br/> Vol: <b>${this.y?.toFixed(0)}</b>`;
                    }
                    return `Time: ${this.point.x} <br/> Price: ${this.point.y} <br/> Liq: <b>${this.point.value}</b>`;
                }
            },
            series: [
                {
                    type: 'heatmap',
                    name: 'Orderbook',
                    data: heatmapData,
                    borderWidth: 0,
                    colsize: 1,
                    tooltip: { headerFormat: '' },
                    states: { hover: { enabled: false } }
                },
                {
                    type: 'bar', // Render horizontal bars for VPVR
                    name: 'VPVR',
                    xAxis: 1, // Hack: Use dummy axis logic if needed, but here we just map data [y, val]
                    // Highcharts Bar maps X to Y-axis (Category) and Y to Length (X-axis visual). 
                    // Since we want vertical bars on the right, we actually want a 'column' chart if the axes were inverted?
                    // Actually, 'bar' chart with inverted: false? No, we want horizontal bars.
                    // Let's manually map the data: x = price level, y = volume.
                    data: vpvrData.map(d => ({ x: d[0], y: d[1] })),
                    yAxis: 1, // Put on the right axis slot
                    color: 'rgba(38, 166, 154, 0.3)', // Faint Green
                    borderColor: '#26a69a',
                    borderWidth: 1,
                    pointPadding: 0,
                    groupPadding: 0,
                    enableMouseTracking: false
                }
            ]
        };

        chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    }

    return () => {
        if (chartRef.current) chartRef.current.destroy();
    };
  }, [resolution]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0b1e] overflow-hidden relative border border-terminal-border/20">
       
       {/* Custom Top Toolbar */}
       <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
           <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-gray-300">
               <span className="text-gray-500">Heatmap {resolution} |</span> <span className="font-bold text-white">binancef</span>
           </div>
           <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-gray-300">
               OHLC | O 91454.6 H 91454.7 L 91425.0 C 91444.2 D -10
           </div>
           <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-gray-300">
               Volume - buy 6 sell 16 delta -10
           </div>
       </div>

       {/* Top Right Controls */}
       <div className="absolute top-2 right-2 z-20 flex gap-1">
           <button 
             onClick={() => setResolution(prev => prev === 'HD' ? 'SD' : 'HD')}
             className="bg-[#1e1e24] hover:bg-[#2a2b30] border border-white/10 rounded px-2 py-1 text-[9px] font-bold text-white transition-colors"
           >
               {resolution}
           </button>
           <button className="p-1 bg-[#1e1e24] border border-white/10 rounded hover:text-white text-gray-400">
               <Monitor size={10} />
           </button>
           <button className="p-1 bg-[#1e1e24] border border-white/10 rounded hover:text-white text-gray-400">
               <Settings size={10} />
           </button>
       </div>

       {/* Chart Container */}
       <div ref={chartContainerRef} className="w-full h-full" />
       
       {/* Floating "Play/Live" Indicator at bottom */}
       <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse shadow-[0_0_8px_rgba(38,166,154,0.8)]"></div>
           <span className="text-[9px] font-mono text-terminal-green">LIVE</span>
       </div>
    </div>
  );
};

export default HeatmapWidget;
