
import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import StockModule from 'highcharts/modules/stock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import Rsi from 'highcharts/indicators/rsi';
import Macd from 'highcharts/indicators/macd';
import Ema from 'highcharts/indicators/ema';
import Atr from 'highcharts/indicators/atr';
import Stochastic from 'highcharts/indicators/stochastic';
import BollingerBands from 'highcharts/indicators/bollinger-bands';
import VolumeByPrice from 'highcharts/indicators/volume-by-price';
import Vwap from 'highcharts/indicators/vwap';
import DragPanes from 'highcharts/modules/drag-panes';
import { AdvancedChartData } from '../types';

// Initialize Highcharts Modules
try {
    if (typeof StockModule === 'function') StockModule(Highcharts);
    if (typeof IndicatorsCore === 'function') IndicatorsCore(Highcharts);
    if (typeof Ema === 'function') Ema(Highcharts);
    if (typeof Rsi === 'function') Rsi(Highcharts);
    if (typeof Macd === 'function') Macd(Highcharts);
    if (typeof Atr === 'function') Atr(Highcharts);
    if (typeof Stochastic === 'function') Stochastic(Highcharts);
    if (typeof BollingerBands === 'function') BollingerBands(Highcharts);
    if (typeof VolumeByPrice === 'function') VolumeByPrice(Highcharts);
    if (typeof Vwap === 'function') Vwap(Highcharts);
    if (typeof DragPanes === 'function') DragPanes(Highcharts);
} catch (e) {
    console.warn("Highcharts modules initialization warning:", e);
}

interface ChartWidgetProps {
  data: AdvancedChartData;
  setSettingsContent?: (n: React.ReactNode) => void;
  interval?: string;
  onIntervalChange?: (interval: string) => void;
}

// Config Types
interface ChartConfig {
    sma: boolean;
    ema: boolean;
    bb: boolean;
    vwap: boolean;
    vpvr: boolean;
    rsi: boolean;
    macd: boolean;
    stoch: boolean;
    atr: boolean;
    cvd: boolean;
    oi: boolean;
    funding: boolean;
    liquidations: boolean;
}

const ChartSettings: React.FC<{ 
    config: ChartConfig, 
    toggle: (k: keyof ChartConfig) => void 
}> = ({ config, toggle }) => (
    <div className="space-y-4 font-mono text-xs text-gray-300">
        <h4 className="text-gray-500 uppercase text-[10px] mb-2 font-bold tracking-wider">Overlays</h4>
        <div className="grid grid-cols-2 gap-2">
            {[
                { key: 'sma', label: 'SMA (20)' },
                { key: 'ema', label: 'EMA (20)' },
                { key: 'bb', label: 'Bollinger Bands' },
                { key: 'vwap', label: 'VWAP' },
                { key: 'vpvr', label: 'VPVR' },
            ].map((opt) => (
                <label key={opt.key} className="flex items-center space-x-2 cursor-pointer group bg-[#0b0c10] p-2 rounded border border-gray-800 hover:border-gray-600">
                    <input type="checkbox" className="accent-terminal-highlight" checked={config[opt.key as keyof ChartConfig]} onChange={() => toggle(opt.key as keyof ChartConfig)} />
                    <span className="text-[10px]">{opt.label}</span>
                </label>
            ))}
        </div>

        <h4 className="text-gray-500 uppercase text-[10px] mb-2 font-bold tracking-wider mt-4">Indicators & Data</h4>
        <div className="grid grid-cols-2 gap-2">
            {[
                { key: 'cvd', label: 'CVD' },
                { key: 'oi', label: 'Open Interest' },
                { key: 'funding', label: 'Funding' },
                { key: 'liquidations', label: 'Liquidations' },
                { key: 'rsi', label: 'RSI' },
                { key: 'macd', label: 'MACD' },
                { key: 'stoch', label: 'Stochastic' },
                { key: 'atr', label: 'ATR' },
            ].map((opt) => (
                <label key={opt.key} className="flex items-center space-x-2 cursor-pointer group bg-[#0b0c10] p-2 rounded border border-gray-800 hover:border-gray-600">
                    <input type="checkbox" className="accent-terminal-highlight" checked={config[opt.key as keyof ChartConfig]} onChange={() => toggle(opt.key as keyof ChartConfig)} />
                    <span className="text-[10px]">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const ChartWidget: React.FC<ChartWidgetProps> = ({ data, setSettingsContent, interval = '1m', onIntervalChange }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  
  const [config, setConfig] = useState<ChartConfig>({
      sma: false, ema: true, bb: false, vwap: false, vpvr: false,
      rsi: false, macd: false, stoch: false, atr: false,
      cvd: false, oi: false, funding: false, liquidations: false
  });

  const toggle = (key: keyof ChartConfig) => {
      setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
      if (setSettingsContent) {
          setSettingsContent(<ChartSettings config={config} toggle={toggle} />);
      }
  }, [setSettingsContent, config]);

  useEffect(() => {
      if (chartContainerRef.current) {
          const options: Highcharts.Options = {
              chart: {
                  backgroundColor: '#0b0c10',
                  style: { fontFamily: "'JetBrains Mono', monospace" },
                  height: null,
                  marginLeft: 0,
                  marginRight: 50, // Space for Y-Axis
                  panning: { enabled: true, type: 'x' },
                  panKey: 'shift',
                  zoomType: 'x'
              },
              rangeSelector: { enabled: false },
              scrollbar: { enabled: false },
              navigator: { enabled: false },
              credits: { enabled: false },
              plotOptions: {
                  candlestick: {
                      color: '#ef5350',
                      upColor: '#26a69a',
                      lineColor: '#ef5350',
                      upLineColor: '#26a69a',
                  },
                  column: {
                      borderWidth: 0,
                      maxPointWidth: 10
                  }
              },
              xAxis: {
                  gridLineWidth: 1,
                  gridLineColor: '#16171d',
                  lineColor: '#2a2b30',
                  tickColor: '#2a2b30',
                  labels: { style: { color: '#555', fontSize: '9px' } },
                  crosshair: {
                      label: { enabled: true, backgroundColor: '#2a2b30', style: { fontSize: '9px' } },
                      color: '#2a2b30',
                      dashStyle: 'ShortDot'
                  }
              },
              yAxis: [
                  { 
                      height: '100%',
                      gridLineColor: '#16171d',
                      labels: { style: { color: '#8b9bb4', fontSize: '9px' }, align: 'left', x: 5 },
                      crosshair: {
                          label: { enabled: true, backgroundColor: '#2a2b30', style: { fontSize: '9px' } },
                          color: '#2a2b30',
                          dashStyle: 'ShortDot'
                      },
                      resize: { enabled: true }
                  }, 
                  { 
                      top: '80%',
                      height: '20%',
                      offset: 0,
                      visible: false
                  }
              ],
              tooltip: {
                  backgroundColor: '#16171d',
                  borderColor: '#2a2b30',
                  style: { color: '#fff', fontSize: '10px' },
                  split: true,
                  shadow: false,
                  padding: 4
              },
              series: [
                  { type: 'candlestick', id: 'main', name: 'Price', data: [] },
                  { type: 'column', id: 'volume', name: 'Volume', data: [], yAxis: 1, opacity: 0.5, color: '#555' }
              ]
          };
          chartRef.current = Highcharts.stockChart(chartContainerRef.current, options);
      }
      return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  useEffect(() => {
      if (!chartRef.current) return;
      const chart = chartRef.current;

      const ohlc = data.candles.map(d => [Number(d.time) * 1000, d.open, d.high, d.low, d.close]);
      const vol = data.candles.map(d => [Number(d.time) * 1000, d.volume]);

      if (chart.series[0]) chart.series[0].setData(ohlc, false);
      if (chart.series[1]) chart.series[1].setData(vol, false);

      const manageSeries = (id: string, type: string, params: any, enabled: boolean, yAxis = 0) => {
          let series = chart.get(id) as Highcharts.Series;
          if (enabled) {
              if (!series) {
                  chart.addSeries({ id, type: type as any, linkedTo: params.linkedTo, yAxis, ...params }, false);
              } else if (params.data) {
                  series.setData(params.data, false);
              }
          } else {
              if (series) series.remove(false);
          }
      };

      manageSeries('sma', 'sma', { linkedTo: 'main', params: { period: 20 }, color: '#fbbf24', lineWidth: 1 }, config.sma);
      manageSeries('ema', 'ema', { linkedTo: 'main', params: { period: 20 }, color: '#22d3ee', lineWidth: 1 }, config.ema);
      manageSeries('bb', 'bb', { linkedTo: 'main', params: { period: 20, standardDeviation: 2 }, color: '#c084fc', lineWidth: 1 }, config.bb);
      manageSeries('vwap', 'vwap', { linkedTo: 'main', params: { period: 20 }, color: '#ec4899', lineWidth: 1 }, config.vwap);
      manageSeries('vpvr', 'volume-by-price', { linkedTo: 'main', params: { volumeSeriesID: 'volume' }, color: '#3b82f6', opacity: 0.5 }, config.vpvr);

      const subPanes = [];
      if (config.cvd) subPanes.push({ id: 'cvd', title: 'CVD', type: 'area', color: '#a855f7', data: data.cvd.map(d => [d.time * 1000, d.value]) });
      if (config.oi) subPanes.push({ id: 'oi', title: 'OI', type: 'line', color: '#3b82f6', data: data.oi.map(d => [d.time * 1000, d.value]) });
      if (config.funding) subPanes.push({ id: 'funding', title: 'Fund', type: 'column', color: '#fbbf24', data: data.funding.map(d => [d.time * 1000, d.value]) });
      if (config.liquidations) subPanes.push({ id: 'liqs', title: 'Liqs', type: 'column', color: '#ef4444', data: data.liquidations.map(d => [d.time * 1000, d.long + d.short]) });
      
      if (config.rsi) subPanes.push({ id: 'rsi', title: 'RSI', type: 'rsi', linkedTo: 'main', params: { period: 14 }, color: '#c084fc' });
      if (config.macd) subPanes.push({ id: 'macd', title: 'MACD', type: 'macd', linkedTo: 'main' });
      if (config.stoch) subPanes.push({ id: 'stoch', title: 'Stoch', type: 'stochastic', linkedTo: 'main' });
      if (config.atr) subPanes.push({ id: 'atr', title: 'ATR', type: 'atr', linkedTo: 'main' });

      const paneHeight = 15;
      let mainHeight = 100;
      if (subPanes.length > 0) mainHeight = Math.max(30, 100 - (subPanes.length * paneHeight));

      chart.yAxis[0].update({ height: `${mainHeight}%`, top: '0%' }, false);
      chart.yAxis[1].update({ height: `${Math.min(15, mainHeight * 0.2)}%`, top: `${mainHeight * 0.8}%` }, false);

      subPanes.forEach((pane, idx) => {
          const axisId = `axis-${pane.id}`;
          const top = mainHeight + (idx * paneHeight);
          
          let axis = chart.get(axisId) as Highcharts.Axis;
          if (!axis) {
              chart.addAxis({
                  id: axisId,
                  top: `${top}%`,
                  height: `${paneHeight}%`,
                  offset: 0,
                  gridLineColor: '#16171d',
                  labels: { align: 'left', x: 5, style: { fontSize: '8px', color: pane.color } },
                  title: { text: pane.title, align: 'high', offset: 0, rotation: 0, y: -10, style: { fontSize: '9px', color: pane.color } },
                  resize: { enabled: true }
              }, false);
          } else {
              axis.update({ top: `${top}%`, height: `${paneHeight}%` }, false);
          }

          const axisIndex = chart.yAxis.findIndex(y => y.options.id === axisId);
          if (pane.linkedTo) {
              manageSeries(pane.id, pane.type, { ...pane.params, linkedTo: 'main', color: pane.color }, true, axisIndex);
          } else {
              manageSeries(pane.id, pane.type, { data: pane.data, color: pane.color, name: pane.title, fillColor: { linearGradient: {x1:0,y1:0,x2:0,y2:1}, stops: [[0, pane.color],[1, 'rgba(0,0,0,0)']] } }, true, axisIndex);
          }
      });

      // Cleanup
      ['cvd', 'oi', 'funding', 'liqs', 'rsi', 'macd', 'stoch', 'atr'].forEach(k => {
          if (!config[k as keyof ChartConfig]) {
              const s = chart.get(k); if (s) s.remove(false);
              const a = chart.get(`axis-${k}`); if (a) a.remove(false);
          }
      });

      chart.redraw();
  }, [data, config]);

  return (
    <div className="flex flex-col h-full bg-terminal-panel">
        <div className="flex items-center px-2 py-1 bg-[#111217] border-b border-terminal-border/50 text-[10px] font-mono select-none">
            <div className="flex items-center space-x-3 mr-4">
                <div className="text-terminal-highlight font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block"></span>
                    Binance
                </div>
                <div className="text-white font-bold">BTCUSDT</div>
                <div className="text-gray-500">{interval}</div>
            </div>
            <div className="flex space-x-0.5 mr-4">
                {['1m', '5m', '15m', '1h', '4h'].map(t => (
                    <button key={t} onClick={() => onIntervalChange && onIntervalChange(t)} className={`px-1.5 py-0.5 rounded transition-colors ${interval === t ? 'text-terminal-highlight bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
                ))}
            </div>
            {data.candles.length > 0 && (
                <div className="flex space-x-3 text-gray-500 hidden sm:flex">
                    <span>O: <span className="text-gray-300">{data.candles[data.candles.length-1].open.toFixed(2)}</span></span>
                    <span>C: <span className={`font-bold ${data.candles[data.candles.length-1].close >= data.candles[data.candles.length-1].open ? 'text-terminal-green' : 'text-terminal-red'}`}>{data.candles[data.candles.length-1].close.toFixed(2)}</span></span>
                </div>
            )}
        </div>
        <div className="flex-1 w-full relative">
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    </div>
  );
};

export default ChartWidget;
