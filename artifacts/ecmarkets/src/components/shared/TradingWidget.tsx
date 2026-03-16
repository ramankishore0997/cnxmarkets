import { useEffect, useRef } from 'react';

export function TradingWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
        { proName: "FOREXCOM:GBPUSD", title: "GBP/USD" },
        { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "OANDA:SPX500USD", title: "S&P 500" },
        { proName: "BINANCE:BTCUSD", title: "Bitcoin" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en"
    });
    
    containerRef.current.appendChild(script);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full border-b border-white/5 bg-background/50 backdrop-blur-md">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

export function TradingChartWidget({ symbol = "FOREXCOM:EURUSD" }: { symbol?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(10, 15, 30, 1)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_chart"
    });
    
    containerRef.current.appendChild(script);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="w-full h-[500px] glass-panel rounded-xl overflow-hidden p-1">
      <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
        <div id="tradingview_chart" ref={containerRef} style={{ height: "calc(100% - 32px)", width: "100%" }} />
      </div>
    </div>
  );
}
