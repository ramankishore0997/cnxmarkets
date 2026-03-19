import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthState } from '@/hooks/use-auth-state';
import { TrendingUp, Trophy, Flame, ChevronUp, Star } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

const BASE_TRADERS = [
  { id: 'f1',  name: 'Arjun S.',   location: 'Mumbai',    profit: 4840000, trades: 1847, winRate: 94, isReal: false },
  { id: 'f2',  name: 'Priya M.',   location: 'Delhi',     profit: 3920000, trades: 1623, winRate: 91, isReal: false },
  { id: 'f3',  name: 'Rohit K.',   location: 'Bangalore', profit: 3180000, trades: 1412, winRate: 89, isReal: false },
  { id: 'f4',  name: 'Sneha V.',   location: 'Hyderabad', profit: 2540000, trades: 1198, winRate: 88, isReal: false },
  { id: 'f5',  name: 'Vikram T.',  location: 'Chennai',   profit: 2090000, trades: 1034, winRate: 86, isReal: false },
  { id: 'f6',  name: 'Kavya R.',   location: 'Pune',      profit: 1740000, trades: 892,  winRate: 84, isReal: false },
  { id: 'f7',  name: 'Aditya P.',  location: 'Kolkata',   profit: 1430000, trades: 756,  winRate: 83, isReal: false },
  // user slot ~8
  { id: 'f8',  name: 'Meera J.',   location: 'Ahmedabad', profit: 1020000, trades: 621,  winRate: 81, isReal: false },
  { id: 'f9',  name: 'Suresh N.',  location: 'Jaipur',    profit: 840000,  trades: 534,  winRate: 79, isReal: false },
  { id: 'f10', name: 'Ananya D.',  location: 'Surat',     profit: 690000,  trades: 447,  winRate: 78, isReal: false },
  { id: 'f11', name: 'Karan B.',   location: 'Mumbai',    profit: 560000,  trades: 381,  winRate: 76, isReal: false },
  { id: 'f12', name: 'Pooja L.',   location: 'Delhi',     profit: 450000,  trades: 312,  winRate: 75, isReal: false },
  { id: 'f13', name: 'Rahul G.',   location: 'Bangalore', profit: 360000,  trades: 247,  winRate: 73, isReal: false },
  { id: 'f14', name: 'Divya C.',   location: 'Hyderabad', profit: 284000,  trades: 196,  winRate: 72, isReal: false },
  { id: 'f15', name: 'Nikhil A.',  location: 'Chennai',   profit: 218000,  trades: 158,  winRate: 71, isReal: false },
  { id: 'f16', name: 'Tanvi S.',   location: 'Pune',      profit: 164000,  trades: 124,  winRate: 70, isReal: false },
  { id: 'f17', name: 'Gaurav M.',  location: 'Kolkata',   profit: 124000,  trades: 97,   winRate: 69, isReal: false },
  { id: 'f18', name: 'Riya P.',    location: 'Ahmedabad', profit: 92000,   trades: 74,   winRate: 68, isReal: false },
];

type Trader = {
  id: string; name: string; location: string;
  profit: number; trades: number; winRate: number;
  isReal: boolean; isMe?: boolean; flash?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}

function retPct(profit: number, trades: number) {
  return ((profit / Math.max(trades * 3500, 1)) * 100).toFixed(1);
}

function avatar(name: string, isMe: boolean, size: 'sm' | 'lg' = 'sm') {
  const dim = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-8 h-8 text-xs';
  const bg  = isMe
    ? 'linear-gradient(135deg,#00C274,#00A85E)'
    : 'linear-gradient(135deg,#1A1D2E,#252838)';
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-black shrink-0`}
      style={{ background: bg, border: isMe ? '2px solid rgba(0,194,116,0.5)' : '1px solid rgba(255,255,255,0.07)', color: isMe ? '#000' : '#94A3B8' }}>
      {name.charAt(0)}
    </div>
  );
}

// ─── Top-3 Podium Card ────────────────────────────────────────────────────────

const MEDAL = ['#FFD700','#C0C0C0','#CD7F32'];
const MEDAL_SHADOW = ['rgba(255,215,0,0.25)','rgba(192,192,192,0.18)','rgba(205,127,50,0.18)'];
const MEDAL_LABEL  = ['🥇 #1 Champion','🥈 #2 Runner-up','🥉 #3 Third'];

function PodiumCard({ trader, rank }: { trader: Trader; rank: number }) {
  const mc = MEDAL[rank - 1];
  return (
    <div className={`relative flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-500 ${trader.flash ? 'scale-[1.02]' : ''} ${rank === 1 ? 'pt-7' : ''}`}
      style={{ background: `linear-gradient(160deg, ${mc}0D 0%, #0C0E1500 100%), #0C0E15`, border: `1px solid ${mc}35`, boxShadow: trader.flash ? `0 0 28px ${MEDAL_SHADOW[rank-1]}` : 'none' }}>

      {rank === 1 && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{ background: `linear-gradient(90deg,${mc},${mc}99)`, color: '#000' }}>
          {MEDAL_LABEL[0]}
        </span>
      )}

      <div className="relative">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
          style={{ background: `linear-gradient(135deg,${mc}33,${mc}55)`, border: `2px solid ${mc}66`, color: mc }}>
          {trader.name.charAt(0)}
        </div>
        {rank > 1 && (
          <span className="absolute -bottom-1 -right-1 text-sm">{rank === 2 ? '🥈' : '🥉'}</span>
        )}
      </div>

      <div className="text-center">
        <p className="font-bold text-[#F8FAFC] text-[13px] leading-tight">{trader.name}</p>
        <p className="text-[10px] text-[#4B5563] mt-0.5">{trader.location}</p>
      </div>

      <div className="text-center">
        <p className={`font-terminal text-[22px] font-black leading-none transition-colors duration-700`}
          style={{ color: trader.flash ? '#00C274' : mc }}>
          {fmt(trader.profit)}
        </p>
        <p className="text-[10px] text-[#4B5563] mt-1">+{retPct(trader.profit, trader.trades)}% return</p>
      </div>

      <div className="flex items-center gap-3 text-center">
        <div>
          <p className="text-[10px] text-[#374151] uppercase tracking-wider">Win Rate</p>
          <p className="text-[13px] font-bold text-[#00C274]">{trader.winRate}%</p>
        </div>
        <div className="w-px h-7 bg-white/[0.06]" />
        <div>
          <p className="text-[10px] text-[#374151] uppercase tracking-wider">Trades</p>
          <p className="text-[13px] font-bold text-[#F8FAFC]">{trader.trades.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Leaderboard() {
  const { user } = useAuthState();

  const [traders, setTraders] = useState<Trader[]>(() => {
    const list: Trader[] = BASE_TRADERS.map(t => ({ ...t, flash: false }));
    if (user) {
      list.splice(7, 0, {
        id: 'me',
        name: `${user.firstName} ${(user.lastName?.[0] || '')}.`,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        profit: 1180000,
        trades: 687,
        winRate: 82,
        isReal: true,
        isMe: true,
        flash: false,
      });
    }
    return list;
  });

  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick]               = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTraders(prev => {
        const upd = [...prev];
        const idxs = new Set<number>();
        while (idxs.size < 3) idxs.add(Math.floor(Math.random() * upd.length));
        idxs.forEach(i => {
          const gain = Math.floor(Math.random() * 12000) + 3000;
          upd[i] = { ...upd[i], profit: upd[i].profit + gain, flash: true };
        });
        setTimeout(() => setTraders(p => p.map(t => ({ ...t, flash: false }))), 900);
        return upd;
      });
      setLastUpdated(0);
      setTick(t => t + 1);
    }, 3800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [tick]);

  const myRank   = traders.findIndex(t => t.isMe) + 1;
  const myTrader = traders.find(t => t.isMe);
  const aboveMe  = myRank > 1 ? traders[myRank - 2] : null;
  const profitGap = aboveMe ? aboveMe.profit - (myTrader?.profit ?? 0) : 0;

  const top3 = traders.slice(0, 3);
  const rest  = traders.slice(3);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-[#FFD700]" />
              <h1 className="text-xl font-black text-[#F8FAFC]">Leaderboard</h1>
            </div>
            <p className="text-[12px] text-[#4B5563]">Top performing traders on CNXMarkets — all time</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,194,116,0.08)', border: '1px solid rgba(0,194,116,0.2)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C274] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C274]" />
              </span>
              <span className="text-[11px] font-bold text-[#00C274]">LIVE</span>
            </div>
            <span className="text-[11px] text-[#374151]">
              {lastUpdated === 0 ? 'just now' : `${lastUpdated}s ago`}
            </span>
          </div>
        </div>

        {/* ── "You're so close" nudge ── */}
        {myRank > 0 && aboveMe && (
          <div className="rounded-xl px-4 py-3.5 flex items-center justify-between gap-3"
            style={{ background: 'linear-gradient(90deg,rgba(0,194,116,0.07) 0%,rgba(0,194,116,0.02) 100%)', border: '1px solid rgba(0,194,116,0.18)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,194,116,0.12)', border: '1px solid rgba(0,194,116,0.25)' }}>
                <Flame className="w-4 h-4 text-[#00C274]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#F8FAFC]">
                  Aap #{myRank} pe hain — sirf <span className="text-[#00C274]">{fmt(profitGap)}</span> aur chahiye!
                </p>
                <p className="text-[11px] text-[#4B5563] mt-0.5">
                  {aboveMe.name} se {fmt(profitGap)} peeche — ek aur trade aur aap #{myRank - 1} ho sakte hain 🚀
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#00C274]"
              style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)' }}>
              <ChevronUp className="w-3.5 h-3.5" />
              Rank #{myRank - 1}
            </div>
          </div>
        )}

        {/* ── Top 3 Podium ── */}
        <div className="grid grid-cols-3 gap-3">
          {top3.map((t, i) => <PodiumCard key={t.id} trader={t} rank={i + 1} />)}
        </div>

        {/* ── Rank 4+ Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: '#0C0E15' }}>

          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="col-span-1 text-[10px] font-bold text-[#374151] uppercase tracking-wider">#</span>
            <span className="col-span-4 text-[10px] font-bold text-[#374151] uppercase tracking-wider">Trader</span>
            <span className="col-span-2 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right hidden sm:block">Win Rate</span>
            <span className="col-span-3 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Profit</span>
            <span className="col-span-2 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Trades</span>
          </div>

          {rest.map((trader, i) => {
            const rank  = i + 4;
            const isMe  = !!trader.isMe;
            const above = rank > 4 ? rest[i - 1] : top3[2];
            const gap   = above ? above.profit - trader.profit : 0;

            return (
              <div key={trader.id}
                className={`group grid grid-cols-12 px-4 py-3 items-center border-b transition-all duration-500 ${
                  trader.flash
                    ? 'bg-[#00C274]/[0.06]'
                    : isMe
                    ? 'bg-[#00C274]/[0.04]'
                    : 'hover:bg-white/[0.018]'
                }`}
                style={{ borderColor: isMe ? 'rgba(0,194,116,0.12)' : 'rgba(255,255,255,0.04)' }}>

                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {isMe
                    ? <span className="text-[12px] font-black text-[#00C274]">#{rank}</span>
                    : <span className="text-[12px] font-black text-[#374151]">{rank}</span>
                  }
                </div>

                {/* Name */}
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  {avatar(trader.name, isMe)}
                  <div className="min-w-0">
                    <p className={`text-[13px] font-semibold truncate leading-tight ${isMe ? 'text-[#00C274]' : 'text-[#D1D5DB]'}`}>
                      {trader.name}
                      {isMe && <span className="ml-1 text-[10px] font-bold bg-[#00C274]/20 text-[#00C274] px-1.5 py-0.5 rounded-full align-middle">You</span>}
                    </p>
                    <p className="text-[10px] text-[#374151] truncate">{trader.location}</p>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="col-span-2 text-right hidden sm:block">
                  <div className="inline-flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-[#00C274]" />
                    <span className="text-[12px] font-bold text-[#00C274]">{trader.winRate}%</span>
                  </div>
                </div>

                {/* Profit */}
                <div className="col-span-3 text-right">
                  <p className={`font-terminal text-[13px] font-bold leading-tight transition-colors duration-700 ${
                    trader.flash ? 'text-[#00C274]' : isMe ? 'text-[#00C274]' : 'text-[#F8FAFC]'
                  }`}>
                    {fmt(trader.profit)}
                  </p>
                  <p className="text-[10px] text-[#374151]">+{retPct(trader.profit, trader.trades)}%</p>
                </div>

                {/* Trades */}
                <div className="col-span-2 text-right">
                  <span className="text-[12px] text-[#6B7280] font-semibold">{trader.trades}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Traders', value: `${traders.length}+`, icon: TrendingUp },
            { label: 'Avg Win Rate', value: '79%', icon: Star },
            { label: 'Total Volume', value: '₹48.2Cr', icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl px-4 py-3 flex flex-col items-center gap-1"
              style={{ background: '#0C0E15', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon className="w-4 h-4 text-[#374151]" />
              <p className="font-terminal text-base font-black text-[#F8FAFC]">{value}</p>
              <p className="text-[10px] text-[#374151]">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#1F2937] pb-2">
          Rankings update live every few seconds • Figures in INR
        </p>
      </div>
    </DashboardLayout>
  );
}
