import { useEffect, useRef, useState } from 'react';

interface TickerItem {
  symbol: string;
  flag: string;
  price: number;
  change: number;
  decimals: number;
  isCrypto: boolean;
}

const SEED: TickerItem[] = [
  { symbol: 'EUR/USD',  flag: '🇪🇺', price: 1.09230, change:  0.12, decimals: 5, isCrypto: false },
  { symbol: 'GBP/USD',  flag: '🇬🇧', price: 1.27250, change:  0.08, decimals: 5, isCrypto: false },
  { symbol: 'USD/JPY',  flag: '🇯🇵', price: 155.202, change: -0.22, decimals: 3, isCrypto: false },
  { symbol: 'AUD/USD',  flag: '🇦🇺', price: 0.64450, change: -0.31, decimals: 5, isCrypto: false },
  { symbol: 'EUR/GBP',  flag: '🇪🇺', price: 0.85780, change:  0.05, decimals: 5, isCrypto: false },
  { symbol: 'USD/CAD',  flag: '🇨🇦', price: 1.36180, change:  0.17, decimals: 5, isCrypto: false },
  { symbol: 'USD/CHF',  flag: '🇨🇭', price: 0.90120, change: -0.09, decimals: 5, isCrypto: false },
  { symbol: 'XAU/USD',  flag: '🥇', price: 2342.50,  change:  0.41, decimals: 2, isCrypto: false },
  { symbol: 'BTC/USD',  flag: '₿',  price: 65_240,  change:  1.24, decimals: 2, isCrypto: true  },
  { symbol: 'ETH/USD',  flag: 'Ξ',  price: 3_215,   change:  0.87, decimals: 2, isCrypto: true  },
  { symbol: 'SOL/USD',  flag: '◎',  price: 158.45,  change:  2.14, decimals: 2, isCrypto: true  },
  { symbol: 'XRP/USD',  flag: '✕',  price: 0.5262,  change: -0.45, decimals: 4, isCrypto: true  },
];

export function TradingWidget() {
  const [items, setItems] = useState<TickerItem[]>(SEED);
  const flashMap = useRef<Record<string, 'up' | 'down' | null>>({});
  const [, forceRender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          const vol = item.isCrypto ? 0.20 : 0.04;
          const move = (Math.random() - 0.487) * vol;
          const newPrice = item.price * (1 + move / 100);
          const delta = (Math.random() - 0.487) * (item.isCrypto ? 0.08 : 0.02);
          const dir = newPrice >= item.price ? 'up' : 'down';
          flashMap.current[item.symbol] = dir;
          setTimeout(() => { flashMap.current[item.symbol] = null; forceRender(n => n + 1); }, 600);
          return { ...item, price: newPrice, change: item.change + delta };
        })
      );
    }, 1_400);
    return () => clearInterval(id);
  }, []);

  const fmt = (item: TickerItem) =>
    item.price.toLocaleString('en-US', {
      minimumFractionDigits: item.decimals,
      maximumFractionDigits: item.decimals,
    });

  const track = [...items, ...items];

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div style={{
        background: '#060e1a',
        borderBottom: '1px solid rgba(31,119,180,0.18)',
        height: 38,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>

        {/* LEFT: LIVE badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          paddingLeft: 16,
          paddingRight: 18,
          height: '100%',
          background: 'linear-gradient(90deg, #060e1a 70%, transparent)',
          flexShrink: 0,
          zIndex: 2,
          position: 'relative',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(22,163,74,0.12)',
            border: '1px solid rgba(22,163,74,0.28)',
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 10,
            fontWeight: 800,
            color: '#16A34A',
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#16A34A',
              boxShadow: '0 0 0 3px rgba(22,163,74,0.25)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            LIVE
          </span>
        </div>

        {/* SCROLLING TRACK */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* fade edges */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 60,
            background: 'linear-gradient(90deg, #060e1a, transparent)',
            zIndex: 1, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 60,
            background: 'linear-gradient(270deg, #060e1a, transparent)',
            zIndex: 1, pointerEvents: 'none',
          }} />

          <div className="ticker-track">
            {track.map((item, idx) => {
              const flash = flashMap.current[item.symbol];
              const up = item.change >= 0;
              const priceColor = flash === 'up' ? '#16A34A' : flash === 'down' ? '#DC2626' : 'rgba(255,255,255,0.92)';

              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 20px',
                  height: 38,
                  cursor: 'default',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s',
                }}>
                  {/* flag + symbol */}
                  <span style={{ fontSize: 13, lineHeight: 1, userSelect: 'none' }}>{item.flag}</span>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: 0.4,
                    whiteSpace: 'nowrap',
                  }}>
                    {item.symbol}
                  </span>

                  {/* price */}
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: priceColor,
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'color 0.4s ease',
                    whiteSpace: 'nowrap',
                    letterSpacing: 0.2,
                  }}>
                    {fmt(item)}
                  </span>

                  {/* change badge */}
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: up ? '#16A34A' : '#DC2626',
                    background: up ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)',
                    border: `1px solid ${up ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                    borderRadius: 4,
                    padding: '1px 5px',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                    {up ? '▲' : '▼'} {up ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
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
      symbol,
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
    return () => { if (containerRef.current) containerRef.current.innerHTML = ''; };
  }, [symbol]);

  return (
    <div className="w-full h-[500px] glass-panel rounded-xl overflow-hidden p-1">
      <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
        <div id="tradingview_chart" ref={containerRef} style={{ height: "calc(100% - 32px)", width: "100%" }} />
      </div>
    </div>
  );
}
