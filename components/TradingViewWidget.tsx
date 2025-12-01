
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "BINANCE:BTCUSDT", interval = "1" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a stable ID for the container to prevent re-renders from breaking the widget association
  const widgetId = useRef(`tv-widget-${Math.random().toString(36).substring(7)}`).current;

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    "autosize": true,
                    "symbol": symbol,
                    "interval": interval,
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#111217",
                    "enable_publishing": false,
                    "hide_side_toolbar": true,
                    "allow_symbol_change": true,
                    "container_id": widgetId
                });
            }
        };
        containerRef.current.appendChild(script);
    }
  }, [symbol, interval, widgetId]);

  return (
    <div className="w-full h-full bg-[#111217] flex flex-col">
       <div id={widgetId} ref={containerRef} className="flex-1 w-full h-full" />
    </div>
  );
};

export default TradingViewWidget;