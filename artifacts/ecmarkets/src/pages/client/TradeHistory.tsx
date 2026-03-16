import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetTradeHistory } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  TrendingUp, TrendingDown, Trophy, Target, Loader2,
  ChevronLeft, ChevronRight, CalendarDays, BarChart2,
  AlertCircle, Search, Filter
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(price: number, instrument: string): string {
  if (!price) return '—';
  const isJpy = instrument.includes('JPY');
  const isCrypto = ['BTC','ETH','SOL','BNB','XRP','ADA','DOT'].some(c =>
    instrument.startsWith(c)
  );
  if (isCrypto && price > 10_000) return price.toFixed(2);
  if (isCrypto) return price.toFixed(4);
  if (isJpy) return price.toFixed(3);
  return price.toFixed(5);
}

function formatDuration(openedAt?: string, closedAt?: string): string {
  if (!openedAt || !closedAt) return '—';
  const diffMs = new Date(closedAt).getTime() - new Date(openedAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Date Presets ────────────────────────────────────────────────────────────
type Preset = 'today' | '7d' | '30d' | 'all' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d',    label: '7 Days' },
  { key: '30d',   label: '30 Days' },
  { key: 'all',   label: 'All Time' },
  { key: 'custom',label: 'Custom' },
];

function presetDates(p: Preset): { from?: string; to?: string } {
  const now = new Date();
  const toStr = toDateStr(now);
  if (p === 'today') return { from: toStr, to: toStr };
  if (p === '7d') {
    const f = new Date(now); f.setDate(f.getDate() - 7);
    return { from: toDateStr(f), to: toStr };
  }
  if (p === '30d') {
    const f = new Date(now); f.setDate(f.getDate() - 30);
    return { from: toDateStr(f), to: toStr };
  }
  return {};
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TradeHistory() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');
  const [page, setPage]             = useState(1);
  const LIMIT = 20;

  const { from, to } = preset === 'custom'
    ? { from: customFrom || undefined, to: customTo || undefined }
    : presetDates(preset);

  const { data, isLoading, isFetching } = useGetTradeHistory(
    { from, to, page, limit: LIMIT },
    { ...getAuthOptions() }
  );

  const trades   = data?.trades ?? [];
  const total    = data?.total  ?? 0;
  const pages    = data?.pages  ?? 1;

  // ── Summary stats (computed from current filtered page)
  const stats = useMemo(() => {
    const wins  = trades.filter(t => (t.profit ?? 0) >= 0).length;
    const pnl   = trades.reduce((s, t) => s + (t.profit ?? 0), 0);
    const best  = trades.length ? Math.max(...trades.map(t => t.profit ?? 0)) : 0;
    return {
      pageCount: trades.length,
      wins,
      losses: trades.length - wins,
      winRate: trades.length ? ((wins / trades.length) * 100).toFixed(1) : '0.0',
      pnl,
      best,
    };
  }, [trades]);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    setPage(1);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Trade History</h1>
        <p className="text-[#848E9C] font-medium">Complete record of all closed positions</p>
      </div>

      {/* Filter Bar */}
      <div className="card-stealth p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#848E9C] mr-1">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Period</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  preset === p.key
                    ? 'bg-[#F0B90B] text-black shadow-[0_0_12px_rgba(240,185,11,0.35)]'
                    : 'bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-[#F0B90B] hover:text-[#F0B90B]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex items-center gap-2 ml-2 flex-wrap">
              <input
                type="date"
                value={customFrom}
                onChange={e => { setCustomFrom(e.target.value); setPage(1); }}
                className="input-stealth !py-1.5 !text-sm w-36"
              />
              <span className="text-[#848E9C] text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={e => { setCustomTo(e.target.value); setPage(1); }}
                className="input-stealth !py-1.5 !text-sm w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Trades',
            value: total.toLocaleString('en-IN'),
            sub: `${stats.wins}W / ${stats.losses}L (this page)`,
            icon: Search,
            color: '#F0B90B',
          },
          {
            label: 'Win Rate',
            value: `${stats.winRate}%`,
            sub: 'From current page',
            icon: Target,
            color: '#02C076',
          },
          {
            label: 'Net P&L',
            value: `${stats.pnl >= 0 ? '+' : ''}₹${Math.abs(stats.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'From current page',
            icon: BarChart2,
            color: stats.pnl >= 0 ? '#02C076' : '#CF304A',
          },
          {
            label: 'Best Trade',
            value: `₹${stats.best.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'From current page',
            icon: Trophy,
            color: '#F0B90B',
          },
        ].map(s => (
          <div key={s.label} className="card-stealth p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#848E9C] font-medium truncate">{s.label}</p>
              <p className="text-lg font-bold text-white leading-tight" style={{ color: s.color === '#F0B90B' ? undefined : s.color === '#02C076' || s.color === '#CF304A' ? s.color : undefined }}>
                {s.value}
              </p>
              <p className="text-[10px] text-[#848E9C] truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-stealth overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3139]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-white font-bold text-sm">Closed Trades</span>
            {(isLoading || isFetching) && <Loader2 className="w-4 h-4 animate-spin text-[#848E9C] ml-1" />}
          </div>
          <span className="text-xs text-[#848E9C] font-medium">
            {total > 0 ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}` : '0 records'}
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B3139]">
                {['Date & Time', 'Instrument', 'Type', 'Entry', 'Exit', 'Lot', 'P&L (₹)', 'Duration', 'Result'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B] mx-auto" />
                    <p className="text-[#848E9C] text-sm mt-3">Loading trades…</p>
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <AlertCircle className="w-10 h-10 text-[#2B3139] mx-auto mb-3" />
                    <p className="text-[#848E9C] text-sm">No trades found for the selected period.</p>
                  </td>
                </tr>
              ) : (
                trades.map((trade, idx) => {
                  const isWin = (trade.profit ?? 0) >= 0;
                  const dt    = formatDateTime(trade.closedAt ?? trade.openedAt);
                  return (
                    <tr
                      key={trade.id}
                      className={`border-b border-[#2B3139]/60 transition-colors hover:bg-[#1E2329]/60 ${
                        idx % 2 === 0 ? 'bg-[#0B0E11]/40' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[#EAECEF] font-medium text-xs">{dt.date}</p>
                        <p className="text-[#848E9C] text-[11px]">{dt.time}</p>
                      </td>

                      {/* Instrument */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-white font-bold text-sm">{trade.instrument}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          trade.market === 'Forex'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-orange-500/15 text-orange-400'
                        }`}>
                          {trade.market}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          trade.direction === 'buy'
                            ? 'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/20'
                            : 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/20'
                        }`}>
                          {trade.direction === 'buy'
                            ? <TrendingUp className="w-3 h-3" />
                            : <TrendingDown className="w-3 h-3" />}
                          {trade.direction.toUpperCase()}
                        </div>
                      </td>

                      {/* Entry */}
                      <td className="px-4 py-3 font-mono text-[#EAECEF] text-xs whitespace-nowrap">
                        {formatPrice(trade.entryPrice, trade.instrument)}
                      </td>

                      {/* Exit */}
                      <td className="px-4 py-3 font-mono text-[#EAECEF] text-xs whitespace-nowrap">
                        {trade.exitPrice ? formatPrice(trade.exitPrice, trade.instrument) : '—'}
                      </td>

                      {/* Lot */}
                      <td className="px-4 py-3 text-[#848E9C] text-xs">
                        {trade.lotSize}
                      </td>

                      {/* P&L */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                          {(trade.profit ?? 0) >= 0 ? '+' : '-'}₹{Math.abs(trade.profit ?? 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 text-[#848E9C] text-xs whitespace-nowrap">
                        {formatDuration(trade.openedAt, trade.closedAt)}
                      </td>

                      {/* Result */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isWin
                            ? 'bg-[#02C076]/15 text-[#02C076]'
                            : 'bg-[#CF304A]/15 text-[#CF304A]'
                        }`}>
                          {isWin ? '▲ WIN' : '▼ LOSS'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#2B3139]">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
              <p className="text-[#848E9C] text-sm">Loading trades…</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-[#2B3139] mx-auto mb-3" />
              <p className="text-[#848E9C] text-sm">No trades found.</p>
            </div>
          ) : (
            trades.map(trade => {
              const isWin = (trade.profit ?? 0) >= 0;
              const dt    = formatDateTime(trade.closedAt ?? trade.openedAt);
              return (
                <div key={trade.id} className="px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{trade.instrument}</p>
                      <p className="text-[#848E9C] text-xs">{dt.date} · {dt.time}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                        {(trade.profit ?? 0) >= 0 ? '+' : ''}₹{Math.abs(trade.profit ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[10px] font-bold ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                        {isWin ? '▲ WIN' : '▼ LOSS'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#848E9C]">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${trade.direction === 'buy' ? 'text-[#02C076] bg-[#02C076]/10' : 'text-[#CF304A] bg-[#CF304A]/10'}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                    <span>{formatPrice(trade.entryPrice, trade.instrument)} → {trade.exitPrice ? formatPrice(trade.exitPrice, trade.instrument) : '—'}</span>
                    <span>· {formatDuration(trade.openedAt, trade.closedAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-[#2B3139] flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, pages) }, (_, i) => {
                const pg = pages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? pages : page - 2 + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      pg === page
                        ? 'bg-[#F0B90B] text-black'
                        : 'text-[#848E9C] hover:bg-[#2B3139] hover:text-white'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
