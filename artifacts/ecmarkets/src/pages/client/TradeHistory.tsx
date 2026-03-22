import { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetTradeHistory } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  TrendingUp, TrendingDown, Trophy, Target, Loader2,
  ChevronLeft, ChevronRight, CalendarDays, BarChart2,
  AlertCircle, Filter, Zap, BarChart
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(price: number, instrument: string): string {
  if (!price) return '—';
  const isJpy    = instrument.includes('JPY');
  const isCrypto = ['BTC','ETH','SOL','BNB','XRP','ADA','DOT'].some(c => instrument.startsWith(c));
  if (isCrypto && price > 10_000) return price.toFixed(2);
  if (isCrypto)  return price.toFixed(4);
  if (isJpy)     return price.toFixed(3);
  return price.toFixed(5);
}

function formatDuration(openedAt?: string | Date, closedAt?: string | Date): string {
  if (!openedAt || !closedAt) return '—';
  const diffMs = new Date(closedAt).getTime() - new Date(openedAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function formatDateTime(iso: string | Date): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

function toDateStr(d: Date): string { return d.toISOString().slice(0, 10); }

function fmtPnl(v: number) {
  return `${v >= 0 ? '+' : ''}₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Date Presets ────────────────────────────────────────────────────────────
type Preset = 'today' | '7d' | '30d' | 'all' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today',  label: 'Today'   },
  { key: '7d',     label: '7 Days'  },
  { key: '30d',    label: '30 Days' },
  { key: 'all',    label: 'All Time'},
  { key: 'custom', label: 'Custom'  },
];

function presetDates(p: Preset): { from?: string; to?: string } {
  const now   = new Date();
  const toStr = toDateStr(now);
  if (p === 'today') return { from: toStr, to: toStr };
  if (p === '7d')  { const f = new Date(now); f.setDate(f.getDate() - 7);  return { from: toDateStr(f), to: toStr }; }
  if (p === '30d') { const f = new Date(now); f.setDate(f.getDate() - 30); return { from: toDateStr(f), to: toStr }; }
  return {};
}

// ─── Binary trades hook (plain fetch) ────────────────────────────────────────
interface BinaryTrade {
  id: number; instrument: string; direction: string;
  entryPrice: number; closingPrice: number | null;
  amount: number; duration: number; payoutPct: number;
  profit: number | null; status: string;
  openedAt: Date; closedAt: Date | null;
}
interface BinaryHistoryResp {
  trades: BinaryTrade[]; total: number; page: number;
  pages: number; limit: number;
  periodPnl: number; periodWins: number;
}

function useBinaryHistory(from?: string, to?: string, page = 1, limit = 20) {
  const [data, setData]       = useState<BinaryHistoryResp | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ecm_token');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (from) params.set('from', from);
      if (to)   params.set('to', to);
      const res  = await fetch(`/api/binary/history?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [from, to, page, limit]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, refetch: fetch_ };
}

// ─── Component ───────────────────────────────────────────────────────────────
type TradeTab = 'algo' | 'binary';

export function TradeHistory() {
  const [tab,       setTab]       = useState<TradeTab>('algo');
  const [preset,    setPreset]    = useState<Preset>('30d');
  const [customFrom,setCustomFrom]= useState('');
  const [customTo,  setCustomTo]  = useState('');
  const [page,      setPage]      = useState(1);
  const LIMIT = 20;

  const { from, to } = preset === 'custom'
    ? { from: customFrom || undefined, to: customTo || undefined }
    : presetDates(preset);

  const handlePreset = (p: Preset) => { setPreset(p); setPage(1); };

  // ── Algo trades
  const { data: algoRaw, isLoading: algoLoading, isFetching: algoFetching } = useGetTradeHistory(
    { from, to, page, limit: LIMIT },
    { ...getAuthOptions() }
  );
  const algoData  = algoRaw as any;
  const algoTrades = algoData?.trades ?? [];
  const algoTotal  = algoData?.total  ?? 0;
  const algoPages  = algoData?.pages  ?? 1;
  const algoPnl    = algoData?.periodPnl   ?? 0;
  const algoWins   = algoData?.periodWins  ?? 0;

  // ── Binary trades
  const { data: binData, loading: binLoading } = useBinaryHistory(from, to, page, LIMIT);
  const binTrades = binData?.trades   ?? [];
  const binTotal  = binData?.total    ?? 0;
  const binPages  = binData?.pages    ?? 1;
  const binPnl    = binData?.periodPnl  ?? 0;
  const binWins   = binData?.periodWins ?? 0;

  // ── Computed stats for best trade on current page
  const algoBest = useMemo(() =>
    algoTrades.length ? Math.max(...algoTrades.map((t: any) => t.profit ?? 0)) : 0,
    [algoTrades]
  );
  const binBest = useMemo(() =>
    binTrades.length ? Math.max(...binTrades.map(t => t.profit ?? 0)) : 0,
    [binTrades]
  );

  const activeTotal = tab === 'algo' ? algoTotal : binTotal;
  const activePages = tab === 'algo' ? algoPages : binPages;
  const activePnl   = tab === 'algo' ? algoPnl   : binPnl;
  const activeWins  = tab === 'algo' ? algoWins  : binWins;
  const activeBest  = tab === 'algo' ? algoBest  : binBest;
  const loading     = tab === 'algo' ? (algoLoading || algoFetching) : binLoading;
  const winRate     = activeTotal > 0 ? ((activeWins / activeTotal) * 100).toFixed(1) : '0.0';

  const switchTab = (t: TradeTab) => { setTab(t); setPage(1); };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Trade History</h1>
        <p className="text-[#848E9C] text-sm font-medium">Complete record of all closed positions</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => switchTab('algo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'algo'
              ? 'bg-[#00C274] text-black shadow-[0_0_14px_rgba(0,194,116,0.35)]'
              : 'bg-[#0C0E15] border border-[#1A1D27] text-[#848E9C] hover:border-[#00C274] hover:text-[#00C274]'
          }`}
        >
          <BarChart className="w-4 h-4" />
          Algo Trades
        </button>
        <button
          onClick={() => switchTab('binary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'binary'
              ? 'bg-[#F0B90B] text-black shadow-[0_0_14px_rgba(240,185,11,0.35)]'
              : 'bg-[#0C0E15] border border-[#1A1D27] text-[#848E9C] hover:border-[#F0B90B] hover:text-[#F0B90B]'
          }`}
        >
          <Zap className="w-4 h-4" />
          Binary Trades
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-stealth p-3 md:p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3.5 h-3.5 text-[#848E9C] shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#848E9C]">Period</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                preset === p.key
                  ? 'bg-[#00C274] text-black shadow-[0_0_12px_rgba(0,194,116,0.35)]'
                  : 'bg-[#060709] border border-[#181B23] text-[#848E9C] hover:border-[#00C274] hover:text-[#00C274]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <input type="date" value={customFrom}
              onChange={e => { setCustomFrom(e.target.value); setPage(1); }}
              className="input-stealth !py-1.5 !text-sm w-full sm:w-36" />
            <span className="text-[#848E9C] text-sm hidden sm:inline">to</span>
            <input type="date" value={customTo}
              onChange={e => { setCustomTo(e.target.value); setPage(1); }}
              className="input-stealth !py-1.5 !text-sm w-full sm:w-36" />
          </div>
        )}
      </div>

      {/* Summary Strip — full period stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Trades',
            value: activeTotal.toLocaleString('en-IN'),
            sub: preset === 'today' ? 'Today' : `${preset === 'all' ? 'All time' : preset}`,
            icon: Filter, color: '#00C274',
          },
          {
            label: 'Win Rate',
            value: `${winRate}%`,
            sub: `${activeWins}W / ${activeTotal - activeWins}L`,
            icon: Target, color: '#02C076',
          },
          {
            label: 'Net P&L',
            value: fmtPnl(activePnl),
            sub: 'For selected period',
            icon: BarChart2, color: activePnl >= 0 ? '#02C076' : '#CF304A',
          },
          {
            label: 'Best Trade',
            value: `₹${Math.abs(activeBest).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'From current page',
            icon: Trophy, color: '#00C274',
          },
        ].map(s => (
          <div key={s.label} className="card-stealth p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#848E9C] font-medium truncate">{s.label}</p>
              <p className="text-lg font-bold leading-tight" style={{ color: s.color === '#CF304A' ? '#CF304A' : '#fff' }}>
                {s.value}
              </p>
              <p className="text-[10px] text-[#848E9C] truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-stealth overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#181B23]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#00C274]" />
            <span className="text-white font-bold text-sm">
              {tab === 'algo' ? 'Algo Trades' : 'Binary Trades'} — Closed Positions
            </span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#848E9C] ml-1" />}
          </div>
          <span className="text-xs text-[#848E9C] font-medium">
            {activeTotal > 0
              ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, activeTotal)} of ${activeTotal}`
              : '0 records'}
          </span>
        </div>

        {/* ── ALGO TABLE ─────────────────────────────────────────────────────── */}
        {tab === 'algo' && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#181B23]">
                    {['Date & Time','Instrument','Type','Entry','Exit','Lot','P&L (₹)','Duration','Result'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {algoLoading ? (
                    <tr><td colSpan={9} className="text-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-[#00C274] mx-auto" />
                      <p className="text-[#848E9C] text-sm mt-3">Loading trades…</p>
                    </td></tr>
                  ) : algoTrades.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-16">
                      <AlertCircle className="w-10 h-10 text-[#181B23] mx-auto mb-3" />
                      <p className="text-[#848E9C] text-sm">No algo trades found for this period.</p>
                    </td></tr>
                  ) : algoTrades.map((trade: any, idx: number) => {
                    const isWin = (trade.profit ?? 0) >= 0;
                    const dt    = formatDateTime(trade.closedAt ?? trade.openedAt);
                    return (
                      <tr key={trade.id}
                        className={`border-b border-[#181B23]/60 transition-colors hover:bg-[#1E2329]/60 ${idx % 2 === 0 ? 'bg-[#060709]/40' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-[#EAECEF] font-medium text-xs">{dt.date}</p>
                          <p className="text-[#848E9C] text-[11px]">{dt.time}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-white font-bold text-sm">{trade.instrument}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            trade.market === 'Forex' ? 'bg-blue-500/15 text-blue-400' : 'bg-orange-500/15 text-orange-400'
                          }`}>{trade.market}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            trade.direction === 'buy'
                              ? 'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/20'
                              : 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/20'
                          }`}>
                            {trade.direction === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trade.direction.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#EAECEF] text-xs whitespace-nowrap">{formatPrice(trade.entryPrice, trade.instrument)}</td>
                        <td className="px-4 py-3 font-mono text-[#EAECEF] text-xs whitespace-nowrap">{trade.exitPrice ? formatPrice(trade.exitPrice, trade.instrument) : '—'}</td>
                        <td className="px-4 py-3 text-[#848E9C] text-xs">{trade.lotSize}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                            {fmtPnl(trade.profit ?? 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#848E9C] text-xs whitespace-nowrap">{formatDuration(trade.openedAt, trade.closedAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isWin ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                          }`}>{isWin ? '▲ WIN' : '▼ LOSS'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Algo mobile */}
            <div className="md:hidden divide-y divide-[#181B23]">
              {algoLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00C274]" />
                  <p className="text-[#848E9C] text-sm">Loading trades…</p>
                </div>
              ) : algoTrades.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-10 h-10 text-[#181B23] mx-auto mb-3" />
                  <p className="text-[#848E9C] text-sm">No algo trades found.</p>
                </div>
              ) : algoTrades.map((trade: any) => {
                const isWin = (trade.profit ?? 0) >= 0;
                const dt    = formatDateTime(trade.closedAt ?? trade.openedAt);
                return (
                  <div key={trade.id} className="px-4 py-4">
                    {/* Row 1: Instrument + P&L */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold text-sm">{trade.instrument}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            trade.market === 'Forex' ? 'bg-blue-500/15 text-blue-400' : 'bg-orange-500/15 text-orange-400'
                          }`}>{trade.market}</span>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trade.direction === 'buy'
                              ? 'bg-[#02C076]/15 text-[#02C076]'
                              : 'bg-[#CF304A]/15 text-[#CF304A]'
                          }`}>
                            {trade.direction === 'buy' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {trade.direction.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#848E9C] text-xs mt-0.5">{dt.date} · {dt.time}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{fmtPnl(trade.profit ?? 0)}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          isWin ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                        }`}>{isWin ? '▲ WIN' : '▼ LOSS'}</span>
                      </div>
                    </div>
                    {/* Row 2: Price details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-[#0C0E15] rounded-lg px-3 py-2">
                      <div>
                        <span className="text-[#848E9C]">Entry </span>
                        <span className="font-mono text-[#EAECEF]">{formatPrice(trade.entryPrice, trade.instrument)}</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Exit </span>
                        <span className="font-mono text-[#EAECEF]">{trade.exitPrice ? formatPrice(trade.exitPrice, trade.instrument) : '—'}</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Lot </span>
                        <span className="text-[#EAECEF]">{trade.lotSize}</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Duration </span>
                        <span className="text-[#EAECEF]">{formatDuration(trade.openedAt, trade.closedAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── BINARY TABLE ───────────────────────────────────────────────────── */}
        {tab === 'binary' && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#181B23]">
                    {['Date & Time','Instrument','Direction','Invested','Duration','Payout %','Profit / Loss','Result'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {binLoading ? (
                    <tr><td colSpan={8} className="text-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B] mx-auto" />
                      <p className="text-[#848E9C] text-sm mt-3">Loading binary trades…</p>
                    </td></tr>
                  ) : binTrades.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16">
                      <AlertCircle className="w-10 h-10 text-[#181B23] mx-auto mb-3" />
                      <p className="text-[#848E9C] text-sm">No binary trades found for this period.</p>
                    </td></tr>
                  ) : binTrades.map((trade, idx) => {
                    const profit = trade.profit ?? 0;
                    const isWin  = profit > 0;
                    const isOpen = trade.status === 'open';
                    const dt     = formatDateTime(trade.closedAt ?? trade.openedAt);
                    return (
                      <tr key={trade.id}
                        className={`border-b border-[#181B23]/60 transition-colors hover:bg-[#1E2329]/60 ${idx % 2 === 0 ? 'bg-[#060709]/40' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-[#EAECEF] font-medium text-xs">{dt.date}</p>
                          <p className="text-[#848E9C] text-[11px]">{dt.time}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-white font-bold text-sm">{trade.instrument}</p>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Binary</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            trade.direction === 'call' || trade.direction === 'up'
                              ? 'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/20'
                              : 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/20'
                          }`}>
                            {(trade.direction === 'call' || trade.direction === 'up')
                              ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trade.direction.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#EAECEF] text-sm">
                          ₹{trade.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-[#848E9C] text-xs">{trade.duration}s</td>
                        <td className="px-4 py-3 text-[#F0B90B] font-bold text-sm">{trade.payoutPct}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isOpen ? (
                            <span className="text-[#848E9C] text-xs">Pending…</span>
                          ) : (
                            <span className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                              {fmtPnl(profit)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/15 text-yellow-400">
                              ● OPEN
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isWin ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                            }`}>{isWin ? '▲ WIN' : '▼ LOSS'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Binary mobile */}
            <div className="md:hidden divide-y divide-[#181B23]">
              {binLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
                  <p className="text-[#848E9C] text-sm">Loading…</p>
                </div>
              ) : binTrades.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-10 h-10 text-[#181B23] mx-auto mb-3" />
                  <p className="text-[#848E9C] text-sm">No binary trades found.</p>
                </div>
              ) : binTrades.map(trade => {
                const profit = trade.profit ?? 0;
                const isWin  = profit > 0;
                const isOpen = trade.status === 'open';
                const dt     = formatDateTime(trade.closedAt ?? trade.openedAt);
                const isCall = trade.direction === 'call' || trade.direction === 'up';
                return (
                  <div key={trade.id} className="px-4 py-4">
                    {/* Row 1: Instrument + P&L */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold text-sm">{trade.instrument}</p>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Binary</span>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCall ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                          }`}>
                            {isCall ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {trade.direction.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#848E9C] text-xs mt-0.5">{dt.date} · {dt.time}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        {isOpen ? (
                          <p className="text-yellow-400 text-xs font-semibold">Pending…</p>
                        ) : (
                          <p className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{fmtPnl(profit)}</p>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          isOpen ? 'bg-yellow-500/15 text-yellow-400' : isWin ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                        }`}>{isOpen ? '● OPEN' : isWin ? '▲ WIN' : '▼ LOSS'}</span>
                      </div>
                    </div>
                    {/* Row 2: Trade detail grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-[#0C0E15] rounded-lg px-3 py-2">
                      <div>
                        <span className="text-[#848E9C]">Invested </span>
                        <span className="text-[#EAECEF] font-semibold">₹{trade.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Duration </span>
                        <span className="text-[#EAECEF]">{trade.duration}s</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Payout </span>
                        <span className="text-[#F0B90B] font-bold">{trade.payoutPct}%</span>
                      </div>
                      <div>
                        <span className="text-[#848E9C]">Entry </span>
                        <span className="font-mono text-[#EAECEF]">{trade.entryPrice ? formatPrice(trade.entryPrice, trade.instrument) : '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {activePages > 1 && (
          <div className="px-4 py-4 border-t border-[#181B23] flex items-center justify-between gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#848E9C] hover:text-white hover:bg-[#181B23] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Desktop: numbered pages */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(7, activePages) }, (_, i) => {
                const pg = activePages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? activePages : page - 2 + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      pg === page ? 'bg-[#00C274] text-black' : 'text-[#848E9C] hover:bg-[#181B23] hover:text-white'
                    }`}>{pg}</button>
                );
              })}
            </div>

            {/* Mobile: page X / Y */}
            <span className="sm:hidden text-xs font-semibold text-[#848E9C]">
              Page <span className="text-white">{page}</span> / {activePages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(activePages, p + 1))}
              disabled={page >= activePages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#848E9C] hover:text-white hover:bg-[#181B23] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
