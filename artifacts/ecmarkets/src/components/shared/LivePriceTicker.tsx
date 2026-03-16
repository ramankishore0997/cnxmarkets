import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceItem {
  symbol: string;
  price: number;
  change: number;
  decimals: number;
  isCrypto: boolean;
}

const SEED: PriceItem[] = [
  { symbol: 'EUR/USD',  price: 1.09230, change:  0.12, decimals: 5, isCrypto: false },
  { symbol: 'GBP/USD',  price: 1.27250, change:  0.08, decimals: 5, isCrypto: false },
  { symbol: 'USD/JPY',  price: 155.202, change: -0.22, decimals: 3, isCrypto: false },
  { symbol: 'AUD/USD',  price: 0.64450, change: -0.31, decimals: 5, isCrypto: false },
  { symbol: 'EUR/GBP',  price: 0.85780, change:  0.05, decimals: 5, isCrypto: false },
  { symbol: 'USD/CAD',  price: 1.36180, change:  0.17, decimals: 5, isCrypto: false },
  { symbol: 'BTC/USDT', price: 65_240,  change:  1.24, decimals: 2, isCrypto: true  },
  { symbol: 'ETH/USDT', price: 3_215,   change:  0.87, decimals: 2, isCrypto: true  },
  { symbol: 'SOL/USDT', price: 158.45,  change:  2.14, decimals: 2, isCrypto: true  },
  { symbol: 'XRP/USDT', price: 0.5262,  change: -0.45, decimals: 4, isCrypto: true  },
];

interface Props {
  compact?: boolean;
}

export function LivePriceTicker({ compact = false }: Props) {
  const [items, setItems] = useState<PriceItem[]>(SEED);
  const flashRef = useRef<Record<string, 'up' | 'down' | null>>({});
  // Force re-render on flash
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          // Crypto moves faster/wider; Forex moves tight
          const volatility = item.isCrypto ? 0.18 : 0.04;
          const movePct = (Math.random() - 0.487) * volatility;
          const newPrice = item.price * (1 + movePct / 100);
          const changeDelta = (Math.random() - 0.487) * (item.isCrypto ? 0.08 : 0.02);
          const newChange = item.change + changeDelta;
          flashRef.current[item.symbol] = newPrice > item.price ? 'up' : 'down';
          setTimeout(() => { flashRef.current[item.symbol] = null; setTick(n => n + 1); }, 500);
          return { ...item, price: newPrice, change: newChange };
        })
      );
    }, 1_200);
    return () => clearInterval(id);
  }, []);

  const formatPrice = (item: PriceItem) =>
    item.isCrypto
      ? `$${item.price.toLocaleString('en-US', { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}`
      : item.price.toFixed(item.decimals);

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        <Activity className="w-3.5 h-3.5 text-[#02C076] animate-pulse shrink-0" />
        <div className="flex gap-5 overflow-x-auto scrollbar-none">
          {items.map(item => (
            <span key={item.symbol} className="flex items-center gap-1.5 whitespace-nowrap text-xs">
              <span className="text-[#848E9C] font-semibold">{item.symbol}</span>
              <span className={`font-bold transition-colors duration-300 ${
                flashRef.current[item.symbol] === 'up' ? 'text-[#02C076]' :
                flashRef.current[item.symbol] === 'down' ? 'text-[#CF304A]' : 'text-white'
              }`}>{formatPrice(item)}</span>
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
          <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
          <span className="text-xs font-bold text-[#02C076] uppercase tracking-widest">Live Market Feed</span>
        </div>
        <span className="text-[10px] text-[#848E9C] font-medium">Forex &amp; Crypto · Simulated · 1.2s updates</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map(item => (
          <div
            key={item.symbol}
            className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-3 transition-all hover:border-[#F0B90B]/30"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                item.isCrypto ? 'bg-[#F0B90B]/15 text-[#F0B90B]' : 'bg-[#02C076]/15 text-[#02C076]'
              }`}>
                {item.isCrypto ? 'CRYPTO' : 'FX'}
              </span>
              <span className={`flex items-center gap-0.5 text-[10px] font-bold ${item.change >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                {item.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#848E9C] mb-0.5">{item.symbol}</p>
            <p className={`text-sm font-bold transition-colors duration-300 ${
              flashRef.current[item.symbol] === 'up' ? 'text-[#02C076]' :
              flashRef.current[item.symbol] === 'down' ? 'text-[#CF304A]' : 'text-white'
            }`}>
              {formatPrice(item)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
