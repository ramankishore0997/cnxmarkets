import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceItem {
  symbol: string;
  price: number;
  change: number;
  prev: number;
}

const SEED: PriceItem[] = [
  { symbol: 'NIFTY 50',   price: 22547.80, change:  0.72, prev: 22547.80 },
  { symbol: 'BANK NIFTY', price: 50982.35, change: -0.31, prev: 50982.35 },
  { symbol: 'SENSEX',     price: 73812.55, change:  0.59, prev: 73812.55 },
  { symbol: 'USD/INR',    price:    83.42, change:  0.15, prev:    83.42 },
  { symbol: 'EUR/INR',    price:    90.18, change: -0.22, prev:    90.18 },
  { symbol: 'MCX GOLD',   price: 62450.00, change:  0.84, prev: 62450.00 },
  { symbol: 'MCX SILVER', price: 73210.00, change: -0.14, prev: 73210.00 },
  { symbol: 'CRUDE OIL',  price:  6838.50, change:  0.37, prev:  6838.50 },
];

interface Props {
  compact?: boolean;
}

export function LivePriceTicker({ compact = false }: Props) {
  const [items, setItems] = useState<PriceItem[]>(SEED);
  const flash = useRef<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          const movePct = (Math.random() - 0.485) * 0.09;
          const newPrice = item.price * (1 + movePct / 100);
          const changeDelta = (Math.random() - 0.485) * 0.03;
          const newChange = item.change + changeDelta;
          flash.current[item.symbol] = newPrice > item.price ? 'up' : 'down';
          setTimeout(() => { flash.current[item.symbol] = null; }, 400);
          return { ...item, prev: item.price, price: newPrice, change: newChange };
        })
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        <Activity className="w-3.5 h-3.5 text-[#02C076] animate-pulse shrink-0" />
        <div className="flex gap-4 overflow-x-auto scrollbar-none">
          {items.map(item => (
            <span key={item.symbol} className="flex items-center gap-1.5 whitespace-nowrap text-xs">
              <span className="text-[#848E9C] font-medium">{item.symbol}</span>
              <span className={`font-bold transition-colors duration-300 ${
                flash.current[item.symbol] === 'up' ? 'text-[#02C076]' :
                flash.current[item.symbol] === 'down' ? 'text-[#CF304A]' : 'text-white'
              }`}>
                ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`font-bold ${item.change >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse"></div>
          <span className="text-xs font-bold text-[#02C076] uppercase tracking-widest">Live Market Prices</span>
        </div>
        <span className="text-[10px] text-[#848E9C] font-medium">Simulated · Updates every 1.4s</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(item => (
          <div
            key={item.symbol}
            className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-3 transition-all hover:border-[#F0B90B]/30"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#848E9C] uppercase tracking-wide">{item.symbol}</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${item.change >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                {item.change >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
            <p className={`text-base font-bold transition-colors duration-300 ${
              flash.current[item.symbol] === 'up' ? 'text-[#02C076]' :
              flash.current[item.symbol] === 'down' ? 'text-[#CF304A]' : 'text-white'
            }`}>
              ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
