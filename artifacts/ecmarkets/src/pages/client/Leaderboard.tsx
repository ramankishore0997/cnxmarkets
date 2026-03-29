import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthState } from '@/hooks/use-auth-state';
import { TrendingUp, Trophy, Flame, Star, ArrowUp, Target } from 'lucide-react';
import { Link } from 'wouter';

// ─── Static top traders data ──────────────────────────────────────────────────

const TOP_TRADERS = [
  { id: 'f1',  name: 'Arjun S.',   location: 'Mumbai',    profit: 48400000, trades: 8247, winRate: 94 },
  { id: 'f2',  name: 'Priya M.',   location: 'Delhi',     profit: 39200000, trades: 7123, winRate: 91 },
  { id: 'f3',  name: 'Rohit K.',   location: 'Bangalore', profit: 31800000, trades: 6412, winRate: 89 },
  { id: 'f4',  name: 'Sneha V.',   location: 'Hyderabad', profit: 25400000, trades: 5198, winRate: 88 },
  { id: 'f5',  name: 'Vikram T.',  location: 'Chennai',   profit: 20900000, trades: 4534, winRate: 86 },
  { id: 'f6',  name: 'Kavya R.',   location: 'Pune',      profit: 17400000, trades: 3892, winRate: 84 },
  { id: 'f7',  name: 'Aditya P.',  location: 'Kolkata',   profit: 14300000, trades: 3256, winRate: 83 },
  { id: 'f8',  name: 'Meera J.',   location: 'Ahmedabad', profit: 11800000, trades: 2821, winRate: 81 },
  { id: 'f9',  name: 'Suresh N.',  location: 'Jaipur',    profit: 9600000,  trades: 2434, winRate: 79 },
  { id: 'f10', name: 'Ananya D.',  location: 'Surat',     profit: 7900000,  trades: 2147, winRate: 78 },
  { id: 'f11', name: 'Karan B.',   location: 'Mumbai',    profit: 6400000,  trades: 1881, winRate: 76 },
  { id: 'f12', name: 'Pooja L.',   location: 'Delhi',     profit: 5100000,  trades: 1612, winRate: 75 },
  { id: 'f13', name: 'Rahul G.',   location: 'Bangalore', profit: 4000000,  trades: 1347, winRate: 73 },
  { id: 'f14', name: 'Divya C.',   location: 'Hyderabad', profit: 3100000,  trades: 1096, winRate: 72 },
  { id: 'f15', name: 'Nikhil A.',  location: 'Chennai',   profit: 2400000,  trades: 858,  winRate: 71 },
  { id: 'f16', name: 'Tanvi S.',   location: 'Pune',      profit: 1800000,  trades: 641,  winRate: 70 },
  { id: 'f17', name: 'Gaurav M.',  location: 'Kolkata',   profit: 1300000,  trades: 487,  winRate: 69 },
  { id: 'f18', name: 'Riya P.',    location: 'Ahmedabad', profit: 940000,   trades: 361,  winRate: 68 },
  { id: 'f19', name: 'Aman K.',    location: 'Mumbai',    profit: 670000,   trades: 258,  winRate: 67 },
  { id: 'f20', name: 'Shreya V.',  location: 'Delhi',     profit: 460000,   trades: 179,  winRate: 66 },
];

const TOTAL_TRADERS = 12847;
const USER_RANK     = 6841;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}

function retPct(profit: number, trades: number) {
  return ((profit / Math.max(trades * 3200, 1)) * 100).toFixed(1);
}

const MEDAL_COLOR  = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_SHADOW = ['rgba(255,215,0,0.3)', 'rgba(192,192,192,0.2)', 'rgba(205,127,50,0.2)'];

function PodiumCard({ t, rank }: { t: typeof TOP_TRADERS[0]; rank: number }) {
  const mc = MEDAL_COLOR[rank - 1];
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl p-5"
      style={{ background: `linear-gradient(160deg,${mc}0E 0%,#0C0E1500 100%),#0C0E15`, border: `1px solid ${mc}35` }}>
      {rank === 1 && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{ background: `linear-gradient(90deg,${mc},${mc}88)`, color: '#000' }}>
          🏆 Champion
        </span>
      )}
      <div className={`w-13 h-13 rounded-full flex items-center justify-center text-lg font-black ${rank === 1 ? 'w-14 h-14' : 'w-12 h-12'}`}
        style={{ background: `linear-gradient(135deg,${mc}33,${mc}55)`, border: `2px solid ${mc}66`, color: mc }}>
        {t.name.charAt(0)}
      </div>
      <div className="text-center">
        <p className="font-bold text-[#F8FAFC] text-[13px]">{t.name}</p>
        <p className="text-[10px] text-[#4B5563] mt-0.5">{t.location}</p>
      </div>
      <p className="font-terminal text-[20px] font-black" style={{ color: mc }}>{fmt(t.profit)}</p>
      <div className="flex gap-3">
        <div className="text-center">
          <p className="text-[10px] text-[#374151]">Win Rate</p>
          <p className="text-[12px] font-bold text-[#00C274]">{t.winRate}%</p>
        </div>
        <div className="w-px bg-white/[0.05]" />
        <div className="text-center">
          <p className="text-[10px] text-[#374151]">Trades</p>
          <p className="text-[12px] font-bold text-[#F8FAFC]">{t.trades.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Leaderboard() {
  const { user } = useAuthState();

  const [traders, setTraders] = useState(TOP_TRADERS.map(t => ({ ...t, flash: false })));
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);
  const [userProfit, setUserProfit] = useState(18400);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTraders(prev => {
        const upd = [...prev];
        const idxs = new Set<number>();
        while (idxs.size < 4) idxs.add(Math.floor(Math.random() * upd.length));
        idxs.forEach(i => {
          const gain = Math.floor(Math.random() * 80000) + 20000;
          upd[i] = { ...upd[i], profit: upd[i].profit + gain, flash: true };
        });
        setTimeout(() => setTraders(p => p.map(t => ({ ...t, flash: false }))), 900);
        return upd;
      });
      setUserProfit(p => p + Math.floor(Math.random() * 400) + 100);
      setLastUpdated(0);
      setTick(t => t + 1);
    }, 3800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [tick]);

  const topPercent = ((USER_RANK / TOTAL_TRADERS) * 100).toFixed(1);
  const progressPct = 100 - ((USER_RANK / TOTAL_TRADERS) * 100);
  const top3  = traders.slice(0, 3);
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
            <p className="text-[12px] text-[#4B5563]">
              <span className="text-[#00C274] font-bold">{TOTAL_TRADERS.toLocaleString()}</span> active traders on ECMarket Pro
            </p>
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

        {/* ── Your Position Card ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0C0E15' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#00C274,#00A85E)', color: '#000' }}>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#F8FAFC]">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-[#4B5563]">Your current standing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#4B5563] uppercase tracking-wider">Your Rank</p>
              <p className="font-terminal text-2xl font-black text-[#F8FAFC]">#{USER_RANK.toLocaleString()}</p>
              <p className="text-[10px] text-[#4B5563]">of {TOTAL_TRADERS.toLocaleString()}</p>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div>
              <p className="text-[10px] text-[#374151] uppercase tracking-wider mb-1">Your Profit</p>
              <p className="font-terminal text-[15px] font-bold text-[#F8FAFC]">{fmt(userProfit)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#374151] uppercase tracking-wider mb-1">Percentile</p>
              <p className="font-terminal text-[15px] font-bold text-[#F8FAFC]">Top {topPercent}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#374151] uppercase tracking-wider mb-1">To Top 100</p>
              <p className="font-terminal text-[15px] font-bold text-[#F87171]">₹4.6L needed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#374151]">Your progress to Top 10%</span>
              <span className="text-[10px] font-bold text-[#00C274]">{progressPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#00C274,#00A85E)' }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#374151]">Rank #{TOTAL_TRADERS.toLocaleString()}</span>
              <span className="text-[10px] text-[#374151]">Rank #1</span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-4">
            <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: 'rgba(0,194,116,0.06)', border: '1px solid rgba(0,194,116,0.15)' }}>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#00C274] shrink-0" />
                <p className="text-[12px] text-[#9CA3AF]">
                  Deposit & grow your trading — top traders have earned up to
                  <span className="text-[#00C274] font-bold"> ₹48.4Cr</span>
                </p>
              </div>
              <Link href="/dashboard/deposit"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#00C274,#00A85E)', color: '#000' }}>
                <ArrowUp className="w-3 h-3" /> Deposit
              </Link>
            </div>
          </div>
        </div>

        {/* ── Top 3 Podium ── */}
        <div>
          <p className="text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-3">🏆 Top Performers</p>
          <div className="grid grid-cols-3 gap-3">
            {top3.map((t, i) => <PodiumCard key={t.id} t={t} rank={i + 1} />)}
          </div>
        </div>

        {/* ── Rank 4–20 Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: '#0C0E15' }}>
          <div className="px-4 py-2.5 border-b grid grid-cols-12" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="col-span-1 text-[10px] font-bold text-[#374151] uppercase tracking-wider">#</span>
            <span className="col-span-4 text-[10px] font-bold text-[#374151] uppercase tracking-wider">Trader</span>
            <span className="col-span-2 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right hidden sm:block">Win%</span>
            <span className="col-span-3 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Profit</span>
            <span className="col-span-2 text-[10px] font-bold text-[#374151] uppercase tracking-wider text-right">Trades</span>
          </div>

          {rest.map((t, i) => (
            <div key={t.id}
              className={`grid grid-cols-12 px-4 py-3 items-center border-b transition-all duration-500 ${t.flash ? 'bg-[#00C274]/[0.05]' : 'hover:bg-white/[0.015]'}`}
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="col-span-1">
                <span className="text-[12px] font-black text-[#374151]">{i + 4}</span>
              </div>
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-[#6B7280] shrink-0"
                  style={{ background: 'linear-gradient(135deg,#1A1D2E,#252838)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#D1D5DB] truncate leading-tight">{t.name}</p>
                  <p className="text-[10px] text-[#374151] truncate">{t.location}</p>
                </div>
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <span className="text-[12px] font-bold text-[#00C274]">{t.winRate}%</span>
              </div>
              <div className="col-span-3 text-right">
                <p className={`font-terminal text-[13px] font-bold transition-colors duration-700 ${t.flash ? 'text-[#00C274]' : 'text-[#F8FAFC]'}`}>
                  {fmt(t.profit)}
                </p>
                <p className="text-[10px] text-[#374151]">+{retPct(t.profit, t.trades)}%</p>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[12px] text-[#6B7280] font-semibold">{t.trades.toLocaleString()}</span>
              </div>
            </div>
          ))}

          {/* Ellipsis rows hinting at more traders */}
          <div className="px-4 py-3 flex items-center justify-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[#1F2937] text-lg font-black tracking-widest">• • •</span>
          </div>
          <div className="px-4 py-3 grid grid-cols-12 items-center opacity-30">
            <span className="col-span-1 text-[12px] font-black text-[#374151]">6,840</span>
            <div className="col-span-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A1D2E] border border-white/[0.06]" />
              <div className="h-2 w-20 rounded-full bg-white/[0.06]" />
            </div>
            <div className="col-span-2 hidden sm:block" />
            <div className="col-span-3 text-right"><div className="h-2 w-12 rounded-full bg-white/[0.06] ml-auto" /></div>
            <div className="col-span-2 text-right"><div className="h-2 w-8 rounded-full bg-white/[0.06] ml-auto" /></div>
          </div>
          {/* User row at 6841 */}
          <div className="grid grid-cols-12 px-4 py-3 items-center"
            style={{ background: 'rgba(0,194,116,0.04)', borderTop: '1px solid rgba(0,194,116,0.12)', borderBottom: '1px solid rgba(0,194,116,0.12)' }}>
            <div className="col-span-1">
              <span className="text-[12px] font-black text-[#00C274]">#{USER_RANK.toLocaleString()}</span>
            </div>
            <div className="col-span-4 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#00C274,#00A85E)' }}>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#00C274] truncate">
                  {user?.firstName} {user?.lastName?.[0]}.
                  <span className="ml-1 text-[9px] font-bold bg-[#00C274]/20 text-[#00C274] px-1.5 py-0.5 rounded-full align-middle">You</span>
                </p>
                <p className="text-[10px] text-[#374151] truncate">New Trader</p>
              </div>
            </div>
            <div className="col-span-2 text-right hidden sm:block">
              <span className="text-[12px] font-bold text-[#00C274]">—</span>
            </div>
            <div className="col-span-3 text-right">
              <p className="font-terminal text-[13px] font-bold text-[#00C274]">{fmt(userProfit)}</p>
              <p className="text-[10px] text-[#374151]">Getting started</p>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[12px] text-[#6B7280] font-semibold">—</span>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-center gap-2">
            <span className="text-[#1F2937] text-lg font-black tracking-widest">• • •</span>
          </div>
        </div>

        {/* ── Stats footer ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Traders', value: '12,847', icon: TrendingUp },
            { label: 'Platform Win Rate', value: '79%',    icon: Star },
            { label: 'Total Volume',   value: '₹482Cr',   icon: Target },
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
          Rankings update live • {TOTAL_TRADERS.toLocaleString()} registered traders • Figures in INR
        </p>
      </div>
    </DashboardLayout>
  );
}
