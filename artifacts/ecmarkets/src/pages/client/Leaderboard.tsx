import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthState } from '@/hooks/use-auth-state';
import { TrendingUp, Trophy, Medal, Award } from 'lucide-react';

const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

const BASE_TRADERS = [
  { id: 'f1', name: 'Arjun S.', location: 'Mumbai', profit: 284500, trades: 412, isReal: false },
  { id: 'f2', name: 'Priya M.', location: 'Delhi', profit: 231800, trades: 387, isReal: false },
  { id: 'f3', name: 'Rohit K.', location: 'Bangalore', profit: 198400, trades: 344, isReal: false },
  { id: 'f4', name: 'Sneha V.', location: 'Hyderabad', profit: 175200, trades: 298, isReal: false },
  { id: 'f5', name: 'Vikram T.', location: 'Chennai', profit: 152600, trades: 267, isReal: false },
  { id: 'f6', name: 'Kavya R.', location: 'Pune', profit: 134900, trades: 241, isReal: false },
  { id: 'f7', name: 'Aditya P.', location: 'Kolkata', profit: 118300, trades: 218, isReal: false },
  { id: 'f8', name: 'Meera J.', location: 'Ahmedabad', profit: 103700, trades: 196, isReal: false },
  { id: 'f9', name: 'Suresh N.', location: 'Jaipur', profit: 91200, trades: 178, isReal: false },
  { id: 'f10', name: 'Ananya D.', location: 'Surat', profit: 79800, trades: 154, isReal: false },
  { id: 'f11', name: 'Karan B.', location: 'Mumbai', profit: 68400, trades: 132, isReal: false },
  { id: 'f12', name: 'Pooja L.', location: 'Delhi', profit: 57900, trades: 118, isReal: false },
  { id: 'f13', name: 'Rahul G.', location: 'Bangalore', profit: 47600, trades: 97, isReal: false },
  { id: 'f14', name: 'Divya C.', location: 'Hyderabad', profit: 38200, trades: 81, isReal: false },
  { id: 'f15', name: 'Nikhil A.', location: 'Chennai', profit: 29800, trades: 63, isReal: false },
];

type Trader = {
  id: string;
  name: string;
  location: string;
  profit: number;
  trades: number;
  isReal: boolean;
  isMe?: boolean;
  flash?: boolean;
};

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}

function returnPct(profit: number, trades: number) {
  const base = trades * 1200;
  return ((profit / Math.max(base, 1)) * 100).toFixed(1);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 12px rgba(255,215,0,0.4)' }}>
      <Trophy className="w-4 h-4 text-black" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', boxShadow: '0 0 12px rgba(192,192,192,0.3)' }}>
      <Medal className="w-4 h-4 text-black" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #CD7F32, #8B4513)', boxShadow: '0 0 12px rgba(205,127,50,0.3)' }}>
      <Award className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black text-[#4B5563]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {rank}
    </div>
  );
}

function TopCard({ trader, rank }: { trader: Trader; rank: number }) {
  const borderColor = rank === 1 ? 'rgba(255,215,0,0.3)' : rank === 2 ? 'rgba(192,192,192,0.25)' : 'rgba(205,127,50,0.25)';
  const glowColor = rank === 1 ? 'rgba(255,215,0,0.08)' : rank === 2 ? 'rgba(192,192,192,0.06)' : 'rgba(205,127,50,0.06)';
  const medalColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
  const size = rank === 1 ? 'md:col-span-1 order-first md:order-none' : '';

  return (
    <div
      className={`relative rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-500 ${trader.flash ? 'scale-[1.02]' : ''} ${size}`}
      style={{ background: `linear-gradient(145deg, ${glowColor}, rgba(12,14,21,0.95))`, border: `1px solid ${borderColor}` }}
    >
      {rank === 1 && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
          style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', color: '#000' }}>
          Top Trader
        </div>
      )}
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black" style={{ background: `linear-gradient(135deg, ${medalColor}22, ${medalColor}44)`, border: `2px solid ${medalColor}55`, color: medalColor }}>
        {trader.name.charAt(0)}
      </div>
      <div className="text-center">
        <p className="font-bold text-[#F8FAFC] text-sm">{trader.name}</p>
        <p className="text-[11px] text-[#4B5563] mt-0.5">{trader.location}</p>
      </div>
      <div className="text-center">
        <p className={`font-terminal text-xl font-black transition-all duration-700 ${trader.flash ? 'text-[#00C274]' : ''}`} style={{ color: trader.flash ? '#00C274' : medalColor }}>
          {fmt(trader.profit)}
        </p>
        <p className="text-[10px] text-[#4B5563] mt-0.5">+{returnPct(trader.profit, trader.trades)}% return</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,194,116,0.08)', border: '1px solid rgba(0,194,116,0.15)' }}>
        <TrendingUp className="w-3 h-3 text-[#00C274]" />
        <span className="text-[10px] font-bold text-[#00C274]">{trader.trades} trades</span>
      </div>
      <RankBadge rank={rank} />
    </div>
  );
}

export function Leaderboard() {
  const { user } = useAuthState();
  const [traders, setTraders] = useState<Trader[]>(() => {
    const list = BASE_TRADERS.map(t => ({ ...t, flash: false }));
    if (user) {
      list.push({
        id: 'me',
        name: `${user.firstName} ${user.lastName?.[0] || ''}.`,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        profit: Math.floor(Math.random() * 20000) + 5000,
        trades: Math.floor(Math.random() * 40) + 5,
        isReal: true,
        isMe: true,
        flash: false,
      });
    }
    return list.sort((a, b) => b.profit - a.profit);
  });

  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTraders(prev => {
        const updated = [...prev];
        const count = Math.floor(Math.random() * 3) + 2;
        const indices = new Set<number>();
        while (indices.size < Math.min(count, updated.length)) {
          indices.add(Math.floor(Math.random() * updated.length));
        }
        indices.forEach(i => {
          const gain = Math.floor(Math.random() * 1800) + 200;
          updated[i] = { ...updated[i], profit: updated[i].profit + gain, flash: true };
        });
        const sorted = updated.sort((a, b) => b.profit - a.profit);
        setTimeout(() => {
          setTraders(prev2 => prev2.map(t => ({ ...t, flash: false })));
        }, 800);
        return sorted;
      });
      setLastUpdated(0);
      setTick(t => t + 1);
    }, 3500);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [tick]);

  const top3 = traders.slice(0, 3);
  const rest = traders.slice(3);
  const myRank = traders.findIndex(t => t.isMe) + 1;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-[#F8FAFC]">Leaderboard</h1>
            <p className="text-[12px] text-[#4B5563] mt-0.5">Top performing traders on CNXMarkets</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,194,116,0.08)', border: '1px solid rgba(0,194,116,0.2)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C274] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C274]" />
              </span>
              <span className="text-[11px] font-bold text-[#00C274]">LIVE</span>
            </div>
            <span className="text-[11px] text-[#374151]">
              {lastUpdated === 0 ? 'Updated just now' : `${lastUpdated}s ago`}
            </span>
          </div>
        </div>

        {/* Your rank banner */}
        {myRank > 0 && (
          <div className="mb-5 px-4 py-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(0,194,116,0.06)', border: '1px solid rgba(0,194,116,0.15)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#4B5563]">Your current rank</span>
              <span className="font-terminal text-sm font-bold text-[#00C274]">#{myRank}</span>
            </div>
            <span className="text-[11px] text-[#4B5563]">Keep trading to climb higher 🚀</span>
          </div>
        )}

        {/* Top 3 podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {top3.map((trader, i) => (
            <TopCard key={trader.id} trader={trader} rank={i + 1} />
          ))}
        </div>

        {/* Rank 4+ table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: '#0C0E15' }}>
          <div className="grid grid-cols-12 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="col-span-1 text-[10px] font-bold text-[#374151] uppercase tracking-wider">#</span>
            <span className="col-span-5 text-[10px] font-bold text-[#374151] uppercase tracking-wider">Trader</span>
            <span className="col-span-3 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Profit</span>
            <span className="col-span-3 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Trades</span>
          </div>

          {rest.map((trader, i) => {
            const rank = i + 4;
            const isMe = trader.isMe;
            return (
              <div
                key={trader.id}
                className={`grid grid-cols-12 px-4 py-3 items-center border-b transition-all duration-500 ${trader.flash ? 'bg-[#00C274]/[0.05]' : isMe ? 'bg-[#00C274]/[0.03]' : 'hover:bg-white/[0.02]'}`}
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="col-span-1">
                  <span className="text-[12px] font-black text-[#4B5563]">{rank}</span>
                </div>
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-black shrink-0"
                    style={{ background: isMe ? 'linear-gradient(135deg, #00C274, #00A85E)' : 'linear-gradient(135deg, #1A1D27, #252836)' }}>
                    <span className={isMe ? 'text-black' : 'text-[#6B7280]'}>{trader.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-semibold truncate ${isMe ? 'text-[#00C274]' : 'text-[#D1D5DB]'}`}>
                      {trader.name} {isMe && <span className="text-[10px] font-normal text-[#00C274]/60">(You)</span>}
                    </p>
                    <p className="text-[10px] text-[#374151] truncate">{trader.location}</p>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className={`font-terminal text-[13px] font-bold transition-colors duration-500 ${trader.flash ? 'text-[#00C274]' : isMe ? 'text-[#00C274]' : 'text-[#F8FAFC]'}`}>
                    {fmt(trader.profit)}
                  </p>
                  <p className="text-[10px] text-[#374151]">+{returnPct(trader.profit, trader.trades)}%</p>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-[12px] text-[#6B7280] font-semibold">{trader.trades}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-[#1F2937] mt-4">
          Rankings update in real-time • All figures in INR
        </p>
      </div>
    </DashboardLayout>
  );
}
