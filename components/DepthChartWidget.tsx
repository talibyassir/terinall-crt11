import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import { Order } from '../types';

interface DepthChartProps {
    bids: Order[];
    asks: Order[];
}

const DepthChartWidget: React.FC<DepthChartProps> = ({ bids, asks }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
        const options: Highcharts.Options = {
            chart: {
                type: 'area',
                backgroundColor: '#111217',
                height: null,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: 20,
            },
            title: { text: undefined },
            credits: { enabled: false },
            xAxis: {
                visible: true,
                labels: { style: { color: '#555', fontSize: '9px' } },
                lineColor: '#2a2b30',
                tickWidth: 0,
            },
            yAxis: {
                visible: false,
                gridLineWidth: 0,
            },
            plotOptions: {
                area: {
                    marker: { enabled: false },
                    lineWidth: 1,
                    states: { hover: { lineWidth: 1 } },
                    fillOpacity: 0.2,
                }
            },
            tooltip: {
                backgroundColor: '#16171d',
                borderColor: '#2a2b30',
                style: { color: '#fff', fontFamily: 'monospace' },
                headerFormat: '<b>Price: {point.key}</b><br/>',
                pointFormat: 'Vol: {point.y}'
            },
            series: [
                {
                    name: 'Bids',
                    type: 'area',
                    color: '#26a69a',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, 'rgba(38, 166, 154, 0.5)'], [1, 'rgba(38, 166, 154, 0.05)']]
                    },
                    data: [] 
                },
                {
                    name: 'Asks',
                    type: 'area',
                    color: '#ef5350',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, 'rgba(239, 83, 80, 0.5)'], [1, 'rgba(239, 83, 80, 0.05)']]
                    },
                    data: []
                }
            ]
        };
        chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    }
    
    return () => {
        if(chartRef.current) chartRef.current.destroy();
    }
  }, []);

  // Update Data
  useEffect(() => {
      if (chartRef.current && bids.length > 0 && asks.length > 0) {
          // Prepare Highcharts data: [price, total]
          // Sort Bids: High to Low (Left side of chart usually goes Low->High, so we need to reverse logical display)
          // Standard Depth Chart: Price on X. 
          // Bids: Prices < Current. Asks: Prices > Current.
          
          // Sort Bids ascending for chart plotting
          const sortedBids = [...bids].sort((a, b) => a.price - b.price);
          const bidData = sortedBids.map(b => [b.price, b.total]);

          // Sort Asks ascending
          const sortedAsks = [...asks].sort((a, b) => a.price - b.price);
          const askData = sortedAsks.map(a => [a.price, a.total]);

          chartRef.current.series[0].setData(bidData, false);
          chartRef.current.series[1].setData(askData, false);
          chartRef.current.redraw();
      }
  }, [bids, asks]);

  return (
    <div className="w-full h-full bg-terminal-panel overflow-hidden relative">
        <div className="absolute top-2 left-2 z-10 text-[9px] font-mono text-gray-500 uppercase font-bold pointer-events-none">
           Depth Profile
       </div>
       <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default DepthChartWidget;