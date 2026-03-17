import { useState, useMemo, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useCreateAdminTrade, useGetAdminUserTrades } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, TrendingDown, PlusCircle, Loader2, AlertCircle,
  History, ChevronLeft, ChevronRight, Filter, CalendarDays,
  Zap, Trash2, ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';

const INSTRUMENTS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT',
  'NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY',
];
const MARKETS = ['Forex', 'Crypto', 'NSE', 'BSE', 'MCX'];

const defaultForm = {
  userId: '',
  instrument: 'EUR/USD',
  market: 'Forex',
  direction: 'buy' as 'buy' | 'sell',
  entryPrice: '',
  exitPrice: '',
  lotSize: '1',
  profit: '',
  profitPercent: '',
  status: 'closed' as 'open' | 'closed',
  openedAt: new Date().toISOString().slice(0, 16),
  closedAt: new Date().toISOString().slice(0, 16),
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(price: number, instrument: string): string {
  if (!price) return '—';
  const isJpy = instrument.includes('JPY');
  const isCrypto = ['BTC','ETH','SOL','BNB','XRP'].some(c => instrument.startsWith(c));
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

function toDateStr(d: Date): string { return d.toISOString().slice(0, 10); }

type DatePreset = 'today' | '7d' | '30d' | 'all' | 'custom';
function presetDates(p: DatePreset): { from?: string; to?: string } {
  const now = new Date();
  const toStr = toDateStr(now);
  if (p === 'today') return { from: toStr, to: toStr };
  if (p === '7d') { const f = new Date(now); f.setDate(f.getDate() - 7); return { from: toDateStr(f), to: toStr }; }
  if (p === '30d') { const f = new Date(now); f.setDate(f.getDate() - 30); return { from: toDateStr(f), to: toStr }; }
  return {};
}

// ─── User History Sub-panel ─────────────────────────────────────────────────
function UserHistoryPanel({ users }: { users: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { from, to } = preset === 'custom'
    ? { from: customFrom || undefined, to: customTo || undefined }
    : presetDates(preset);

  const { data, isLoading, isFetching } = useGetAdminUserTrades(
    { userId: selectedUserId ?? 0, from, to, page, limit: LIMIT },
    {
      ...getAuthOptions(),
      query: { enabled: !!selectedUserId },
    }
  );

  const trades = data?.trades ?? [];
  const total  = data?.total  ?? 0;
  const pages  = data?.pages  ?? 1;

  const stats = useMemo(() => {
    const wins = trades.filter(t => (t.profit ?? 0) >= 0).length;
    const pnl  = trades.reduce((s, t) => s + (t.profit ?? 0), 0);
    return { wins, losses: trades.length - wins, pnl };
  }, [trades]);

  const clientUsers = users.filter(u => u.role !== 'admin');

  return (
    <div className="space-y-4">
      {/* User selector */}
      <div className="card-stealth p-5">
        <label className="text-sm font-semibold text-[#848E9C] block mb-2">Select Client</label>
        <select
          value={selectedUserId ?? ''}
          onChange={e => { setSelectedUserId(parseInt(e.target.value) || null); setPage(1); }}
          className="input-stealth appearance-none"
        >
          <option value="">— Choose a client —</option>
          {clientUsers.map((u: any) => (
            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
          ))}
        </select>
      </div>

      {selectedUserId && (
        <>
          {/* Date filter */}
          <div className="card-stealth p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-[#848E9C]" />
              {(['today','7d','30d','all','custom'] as DatePreset[]).map(p => (
                <button
                  key={p}
                  onClick={() => { setPreset(p); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    preset === p
                      ? 'bg-[#F0B90B] text-black'
                      : 'bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-[#F0B90B] hover:text-[#F0B90B]'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
              {preset === 'custom' && (
                <>
                  <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); setPage(1); }} className="input-stealth !py-1 !text-xs w-32" />
                  <span className="text-[#848E9C] text-xs">to</span>
                  <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); setPage(1); }} className="input-stealth !py-1 !text-xs w-32" />
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: total.toLocaleString('en-IN'), color: '#F0B90B' },
              { label: `${stats.wins}W / ${stats.losses}L`, value: trades.length ? `${((stats.wins / trades.length) * 100).toFixed(0)}% Win` : '0% Win', color: '#02C076' },
              { label: 'Net P&L (page)', value: `${stats.pnl >= 0 ? '+' : ''}₹${Math.abs(stats.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: stats.pnl >= 0 ? '#02C076' : '#CF304A' },
            ].map(s => (
              <div key={s.label} className="card-stealth p-4 text-center">
                <p className="text-xs text-[#848E9C]">{s.label}</p>
                <p className="font-bold text-sm mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card-stealth overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-white font-bold text-sm">Trade History</span>
                {(isLoading || isFetching) && <Loader2 className="w-4 h-4 animate-spin text-[#848E9C]" />}
              </div>
              <span className="text-xs text-[#848E9C]">
                {total > 0 ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}` : '0 records'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    {['Date/Time','Instrument','Type','Entry','Exit','Lot','P&L (₹)','Duration','Result'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={9} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#F0B90B] mx-auto" /></td></tr>
                  ) : trades.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-[#848E9C] text-sm">No trades found.</td></tr>
                  ) : (
                    trades.map((t, idx) => {
                      const isWin = (t.profit ?? 0) >= 0;
                      const d = new Date(t.closedAt ?? t.openedAt);
                      return (
                        <tr key={t.id} className={`border-b border-[#2B3139]/50 hover:bg-[#1E2329]/50 ${idx % 2 === 0 ? 'bg-[#0B0E11]/30' : ''}`}>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <p className="text-[#EAECEF] text-xs">{d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</p>
                            <p className="text-[#848E9C] text-[10px]">{d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false })}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-white font-bold text-xs">{t.instrument}</p>
                            <span className="text-[9px] text-[#848E9C]">{t.market}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${t.direction === 'buy' ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'}`}>
                              {t.direction === 'buy' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              {t.direction.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[#EAECEF] text-xs whitespace-nowrap">{formatPrice(t.entryPrice, t.instrument)}</td>
                          <td className="px-3 py-2.5 font-mono text-[#EAECEF] text-xs whitespace-nowrap">{t.exitPrice ? formatPrice(t.exitPrice, t.instrument) : '—'}</td>
                          <td className="px-3 py-2.5 text-[#848E9C] text-xs">{t.lotSize}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`font-bold text-xs ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                              {(t.profit ?? 0) >= 0 ? '+' : ''}₹{Math.abs(t.profit ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[#848E9C] text-xs whitespace-nowrap">{formatDuration(t.openedAt, t.closedAt)}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] font-bold ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{isWin ? '▲ WIN' : '▼ LOSS'}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="px-4 py-3 border-t border-[#2B3139] flex items-center justify-between">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="text-xs text-[#848E9C]">Page {page} / {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedUserId && (
        <div className="card-stealth p-12 text-center">
          <History className="w-12 h-12 text-[#2B3139] mx-auto mb-4" />
          <p className="text-[#848E9C] text-sm">Select a client above to view their trade history.</p>
        </div>
      )}
    </div>
  );
}

// ─── Binary Trades Panel ─────────────────────────────────────────────────────
function BinaryTradesPanel({ users }: { users: any[] }) {
  const { toast } = useToast();
  const [trades, setTrades] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const LIMIT = 50;

  const token = localStorage.getItem('ecm_token');
  const authHdr = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), status: filterStatus });
      if (filterUser) params.set('userId', filterUser);
      const res = await fetch(`/api/admin/binary-trades?${params}`, { headers: authHdr });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTrades(data.trades ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      toast({ title: 'Failed to load binary trades', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, filterUser, filterStatus]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/binary-trades/${id}`, { method: 'DELETE', headers: authHdr });
      if (!res.ok) throw new Error();
      toast({ title: 'Trade deleted', description: `Trade #${id} removed.` });
      setConfirmDelete(null);
      fetchTrades();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const stats = useMemo(() => {
    const won = trades.filter(t => t.status === 'won').length;
    const lost = trades.filter(t => t.status === 'lost').length;
    const totalAmount = trades.reduce((s, t) => s + parseFloat(t.amount ?? '0'), 0);
    const netProfit = trades.reduce((s, t) => s + parseFloat(t.profit ?? '0'), 0);
    return { won, lost, totalAmount, netProfit };
  }, [trades]);

  const clientUsers = users.filter(u => u.role !== 'admin');

  const statusStyle: Record<string, string> = {
    won:    'bg-[#02C076]/15 text-[#02C076] border-[#02C076]/30',
    lost:   'bg-[#CF304A]/15 text-[#CF304A] border-[#CF304A]/30',
    open:   'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/30',
    expired:'bg-[#848E9C]/15 text-[#848E9C] border-[#848E9C]/30',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card-stealth p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-[#848E9C] block mb-1.5">Filter by Client</label>
            <select
              value={filterUser}
              onChange={e => { setFilterUser(e.target.value); setPage(1); }}
              className="input-stealth appearance-none text-sm"
            >
              <option value="">All Clients</option>
              {clientUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <label className="text-xs font-semibold text-[#848E9C] block mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="input-stealth appearance-none text-sm"
            >
              {['all','open','won','lost','expired'].map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => fetchTrades()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2B3139] text-[#848E9C] hover:text-white hover:border-[#F0B90B] text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total (page)', value: String(trades.length), sub: `of ${total}`, color: '#F0B90B' },
          { label: 'Won / Lost', value: `${stats.won} / ${stats.lost}`, sub: trades.length ? `${Math.round((stats.won / trades.filter(t=>t.status==='won'||t.status==='lost').length || 1) * 100)}% win` : '', color: '#02C076' },
          { label: 'Total Amount', value: `₹${stats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'page sum', color: '#848E9C' },
          { label: 'Net Profit', value: `${stats.netProfit >= 0 ? '+' : ''}₹${Math.abs(stats.netProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'page sum', color: stats.netProfit >= 0 ? '#02C076' : '#CF304A' },
        ].map(s => (
          <div key={s.label} className="card-stealth p-4 text-center">
            <p className="text-xs text-[#848E9C] mb-1">{s.label}</p>
            <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
            {s.sub && <p className="text-[10px] text-[#848E9C] mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-stealth overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-white font-bold text-sm">Binary Trades</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#848E9C]" />}
          </div>
          <span className="text-xs text-[#848E9C]">
            {total > 0 ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}` : '0 records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B3139]">
                {['ID','Client','Instrument','Direction','Amount (₹)','Entry','Closing','Duration','Payout%','Profit (₹)','Status','Opened At','Action'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#F0B90B] mx-auto" /></td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={13} className="text-center py-12 text-[#848E9C] text-sm">No binary trades found.</td></tr>
              ) : (
                trades.map((t, idx) => {
                  const openedAt = t.openedAt ? new Date(t.openedAt) : null;
                  const profit = parseFloat(t.profit ?? '0');
                  const amount = parseFloat(t.amount ?? '0');
                  const isConfirming = confirmDelete === t.id;
                  return (
                    <tr key={t.id} className={`border-b border-[#2B3139]/50 hover:bg-[#1E2329]/60 transition-colors ${idx % 2 === 0 ? 'bg-[#0B0E11]/20' : ''}`}>
                      <td className="px-3 py-2.5 text-[#848E9C] text-xs font-mono">#{t.id}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <p className="text-white text-xs font-semibold">{t.userFirstName} {t.userLastName}</p>
                        <p className="text-[#848E9C] text-[10px]">{t.userEmail}</p>
                      </td>
                      <td className="px-3 py-2.5 text-white text-xs font-bold whitespace-nowrap">{t.instrument}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${t.direction === 'higher' ? 'bg-[#02C076]/10 text-[#02C076] border-[#02C076]/30' : 'bg-[#CF304A]/10 text-[#CF304A] border-[#CF304A]/30'}`}>
                          {t.direction === 'higher' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                          {(t.direction ?? '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#EAECEF] text-xs font-mono">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2.5 text-[#848E9C] text-xs font-mono">{t.entryPrice ? parseFloat(t.entryPrice).toFixed(5) : '—'}</td>
                      <td className="px-3 py-2.5 text-[#848E9C] text-xs font-mono">{t.closingPrice ? parseFloat(t.closingPrice).toFixed(5) : '—'}</td>
                      <td className="px-3 py-2.5 text-[#848E9C] text-xs">{t.duration}s</td>
                      <td className="px-3 py-2.5 text-[#F0B90B] text-xs font-bold">{parseFloat(t.payoutPct ?? '90').toFixed(0)}%</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`text-xs font-bold ${profit > 0 ? 'text-[#02C076]' : profit < 0 ? 'text-[#CF304A]' : 'text-[#848E9C]'}`}>
                          {t.status === 'open' ? '—' : `${profit >= 0 ? '+' : ''}₹${Math.abs(profit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle[t.status] ?? 'bg-[#848E9C]/10 text-[#848E9C] border-[#848E9C]/20'}`}>
                          {(t.status ?? '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {openedAt && (
                          <>
                            <p className="text-[#EAECEF] text-[10px]">{openedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                            <p className="text-[#848E9C] text-[10px]">{openedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(t.id)}
                              disabled={deleting === t.id}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-[#CF304A] text-white hover:bg-[#CF304A]/80 transition-all disabled:opacity-50"
                            >
                              {deleting === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-[#2B3139] text-[#848E9C] hover:text-white transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(t.id)}
                            className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#CF304A] hover:bg-[#CF304A]/10 transition-all"
                            title="Delete trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-4 py-3 border-t border-[#2B3139] flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs text-[#848E9C]">Page {page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-[#848E9C] hover:text-white hover:bg-[#2B3139] disabled:opacity-40 transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AdminTrades() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'binary'>('binary');
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState<any[]>([]);

  const { data: users } = useGetAdminUsers({ ...getAuthOptions() });
  const allUsers = (users as any[]) || [];

  const tradeMutation = useCreateAdminTrade({
    ...getAuthOptions(),
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Trade Added", description: `${form.direction.toUpperCase()} ${form.instrument} recorded successfully.` });
        setSubmitted(prev => [data, ...prev.slice(0, 9)]);
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        setForm(prev => ({ ...defaultForm, userId: prev.userId }));
      },
      onError: () => toast({ title: "Failed to add trade", variant: "destructive" })
    }
  });

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId) { toast({ title: "Select a user", variant: "destructive" }); return; }
    if (!form.entryPrice) { toast({ title: "Entry price required", variant: "destructive" }); return; }
    tradeMutation.mutate({
      data: {
        userId: parseInt(form.userId),
        instrument: form.instrument,
        market: form.market,
        direction: form.direction,
        entryPrice: parseFloat(form.entryPrice),
        exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : undefined,
        lotSize: parseFloat(form.lotSize) || 1,
        profit: form.profit ? parseFloat(form.profit) : undefined,
        profitPercent: form.profitPercent ? parseFloat(form.profitPercent) : undefined,
        status: form.status,
        openedAt: new Date(form.openedAt).toISOString(),
        closedAt: form.status === 'closed' && form.closedAt ? new Date(form.closedAt).toISOString() : undefined,
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Trade Management</h1>
        <p className="text-[#848E9C] font-medium">Inject trades or review client trade history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#1E2329] border border-[#2B3139] rounded-xl mb-6 w-fit">
        {[
          { key: 'binary', label: 'Binary Trades', icon: Zap },
          { key: 'entry', label: 'Manual Entry', icon: PlusCircle },
          { key: 'history', label: 'User History', icon: History },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-[#F0B90B] text-black shadow-sm'
                : 'text-[#848E9C] hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'binary' ? (
        <BinaryTradesPanel users={allUsers} />
      ) : activeTab === 'entry' ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            <div className="card-stealth p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Client Account <span className="text-[#CF304A]">*</span></label>
                  <select value={form.userId} onChange={e => set('userId', e.target.value)} className="input-stealth appearance-none">
                    <option value="">— Select Client —</option>
                    {allUsers.filter((u: any) => u.role !== 'admin').map((u: any) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Instrument <span className="text-[#CF304A]">*</span></label>
                    <select value={form.instrument} onChange={e => set('instrument', e.target.value)} className="input-stealth appearance-none">
                      {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Market <span className="text-[#CF304A]">*</span></label>
                    <select value={form.market} onChange={e => set('market', e.target.value)} className="input-stealth appearance-none">
                      {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Direction <span className="text-[#CF304A]">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['buy', 'sell'] as const).map(d => (
                        <button key={d} type="button" onClick={() => set('direction', d)}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                            form.direction === d
                              ? d === 'buy' ? 'bg-[#02C076]/20 border-[#02C076] text-[#02C076]' : 'bg-[#CF304A]/20 border-[#CF304A] text-[#CF304A]'
                              : 'bg-[#1E2329] border-[#2B3139] text-[#848E9C] hover:border-[#848E9C]'
                          }`}>
                          {d === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {d.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Lot Size <span className="text-[#CF304A]">*</span></label>
                    <input type="number" value={form.lotSize} onChange={e => set('lotSize', e.target.value)} placeholder="1" className="input-stealth" min="0.01" step="0.01" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Entry Price <span className="text-[#CF304A]">*</span></label>
                    <input type="number" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} placeholder="0.00" className="input-stealth" step="0.00001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Exit Price</label>
                    <input type="number" value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)} placeholder="0.00" className="input-stealth" step="0.00001" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Profit / Loss (₹)</label>
                    <input type="number" value={form.profit} onChange={e => set('profit', e.target.value)} placeholder="+500.00 or -200.00" className="input-stealth" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Profit %</label>
                    <input type="number" value={form.profitPercent} onChange={e => set('profitPercent', e.target.value)} placeholder="1.5 or -0.8" className="input-stealth" step="0.01" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)} className="input-stealth appearance-none">
                      <option value="closed">Closed</option>
                      <option value="open">Open</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Opened At</label>
                    <input type="datetime-local" value={form.openedAt} onChange={e => set('openedAt', e.target.value)} className="input-stealth" />
                  </div>
                </div>

                {form.status === 'closed' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Closed At</label>
                    <input type="datetime-local" value={form.closedAt} onChange={e => set('closedAt', e.target.value)} className="input-stealth" />
                  </div>
                )}

                {form.profit && parseFloat(form.profit) !== 0 && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${parseFloat(form.profit) > 0 ? 'bg-[#02C076]/10 border-[#02C076]/30 text-[#02C076]' : 'bg-[#CF304A]/10 border-[#CF304A]/30 text-[#CF304A]'}`}>
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">
                      The client's balance will be {parseFloat(form.profit) > 0 ? 'increased' : 'decreased'} by ₹{Math.abs(parseFloat(form.profit)).toLocaleString('en-IN')} when this trade is saved.
                    </p>
                  </div>
                )}

                <button type="submit" disabled={tradeMutation.isPending}
                  className="btn-gold w-full flex justify-center items-center gap-2 text-lg">
                  {tradeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                  Add Trade
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="card-stealth p-6">
              <h2 className="text-lg font-bold text-white mb-4">Recent Entries</h2>
              {submitted.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-[#2B3139] mx-auto mb-4" />
                  <p className="text-[#848E9C] text-sm">Trades you add this session will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submitted.map((t: any, i) => (
                    <div key={i} className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{t.instrument}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.direction === 'buy' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                          {t.direction?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#848E9C]">
                        <span>{t.market} · {t.lotSize} lot</span>
                        {t.profit != null && (
                          <span className={`font-bold ${t.profit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                            {t.profit >= 0 ? '+' : ''}₹{Number(t.profit).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-stealth p-5">
              <h3 className="text-sm font-bold text-[#848E9C] uppercase tracking-wider mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-xs text-[#848E9C]">
                <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Positive profit increases the client's balance automatically.</li>
                <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Leave exit price empty for open trades.</li>
                <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Forex prices: 5 decimals. JPY: 3 decimals. Crypto: 2–4 decimals.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <UserHistoryPanel users={allUsers} />
      )}
    </AdminLayout>
  );
}
