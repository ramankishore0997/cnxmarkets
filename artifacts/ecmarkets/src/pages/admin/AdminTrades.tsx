import { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useGetAdminUserTrades } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Loader2, History,
  ChevronLeft, ChevronRight, CalendarDays,
  Activity, RefreshCw, Wifi, Users, ArrowUp, ArrowDown, Clock,
  Plus, Zap, BarChart2, CheckCircle2
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number, instrument: string): string {
  if (!price) return '—';
  const isJpy    = instrument.includes('JPY');
  const isCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'].some(c => instrument.startsWith(c));
  if (isCrypto && price > 10_000) return price.toFixed(2);
  if (isCrypto) return price.toFixed(4);
  if (isJpy) return price.toFixed(3);
  return price.toFixed(5);
}

function formatDuration(openedAt: string, closedAt?: string): string {
  const endMs  = closedAt ? new Date(closedAt).getTime() : Date.now();
  const diffMs = endMs - new Date(openedAt).getTime();
  const mins   = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function toDateStr(d: Date): string { return d.toISOString().slice(0, 10); }

type DatePreset = 'today' | '7d' | '30d' | 'all' | 'custom';
function presetDates(p: DatePreset): { from?: string; to?: string } {
  const now   = new Date();
  const toStr = toDateStr(now);
  if (p === 'today') return { from: toStr, to: toStr };
  if (p === '7d')  { const f = new Date(now); f.setDate(f.getDate() - 7);  return { from: toDateStr(f), to: toStr }; }
  if (p === '30d') { const f = new Date(now); f.setDate(f.getDate() - 30); return { from: toDateStr(f), to: toStr }; }
  return {};
}

// ─── Live Trades Panel ───────────────────────────────────────────────────────

function LiveTradesPanel() {
  const [trades, setTrades]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  const fetchLive = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ecm_token');
      const res = await fetch('/api/admin/live-trades', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setTrades(await res.json());
      setLastRefresh(new Date());
    } catch {
      toast({ title: 'Error', description: 'Could not load live trades.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLive(); }, []);
  useEffect(() => {
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, []);

  const byUser = useMemo(() => {
    const map: Record<number, { name: string; email: string; trades: any[] }> = {};
    for (const t of trades) {
      if (!map[t.userId]) map[t.userId] = { name: `${t.firstName} ${t.lastName}`, email: t.email, trades: [] };
      map[t.userId].trades.push(t);
    }
    return Object.entries(map).map(([uid, info]) => ({ userId: parseInt(uid), ...info }));
  }, [trades]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C274] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00C274]"></span>
          </span>
          <span className="text-[#00C274] font-bold text-sm uppercase tracking-wider">Live</span>
          <span className="text-[#848E9C] text-sm">
            {trades.length} open position{trades.length !== 1 ? 's' : ''} across {byUser.length} client{byUser.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#848E9C]">Updated {lastRefresh.toLocaleTimeString()}</span>
          <button
            onClick={fetchLive}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181B23] text-[#848E9C] hover:text-white text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Positions', value: trades.length,  color: '#00C274', Icon: Activity },
          { label: 'Active Clients', value: byUser.length,  color: '#2a6df4', Icon: Users },
          { label: 'Buy / Sell',
            value: `${trades.filter(t => t.direction === 'buy').length} / ${trades.filter(t => t.direction === 'sell').length}`,
            color: '#00C274', Icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
              <s.Icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-[#848E9C] text-xs font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading && trades.length === 0 ? (
        <div className="card-stealth p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00C274]" />
        </div>
      ) : trades.length === 0 ? (
        <div className="card-stealth p-16 text-center">
          <Wifi className="w-12 h-12 text-[#181B23] mx-auto mb-4" />
          <p className="text-[#848E9C] font-medium">No open positions right now.</p>
          <p className="text-[#3d4450] text-sm mt-1">Live trades appear here as soon as the trade engine opens them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {byUser.map(({ userId, name, email, trades: uTrades }) => (
            <div key={userId} className="card-stealth overflow-hidden">
              <div className="px-5 py-3 border-b border-[#181B23] flex items-center gap-3 bg-[#0C0E15]/60">
                <div className="w-7 h-7 rounded-full bg-[#00C274] flex items-center justify-center text-black font-black text-xs shrink-0">
                  {name[0] || '?'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{name}</p>
                  <p className="text-[#848E9C] text-xs">{email}</p>
                </div>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[#00C274]/15 text-[#00C274]">
                  {uTrades.length} live
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#848E9C] text-xs uppercase tracking-wider border-b border-[#181B23]">
                      <th className="px-5 py-3 text-left font-semibold">Instrument</th>
                      <th className="px-4 py-3 text-left font-semibold">Market</th>
                      <th className="px-4 py-3 text-left font-semibold">Direction</th>
                      <th className="px-4 py-3 text-right font-semibold">Entry Price</th>
                      <th className="px-4 py-3 text-right font-semibold">Duration</th>
                      <th className="px-4 py-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B23]">
                    {uTrades.map((trade: any) => (
                      <tr key={trade.id} className="hover:bg-[#181B23]/30 transition-colors">
                        <td className="px-5 py-3 font-bold text-white">{trade.instrument}</td>
                        <td className="px-4 py-3 text-[#848E9C]">{trade.market}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                            trade.direction === 'buy' ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                          }`}>
                            {trade.direction === 'buy' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {trade.direction.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#EAECEF] text-xs">
                          {formatPrice(trade.entryPrice, trade.instrument)}
                        </td>
                        <td className="px-4 py-3 text-right text-[#848E9C] text-xs">
                          <span className="flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />{formatDuration(trade.openedAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-[#00C274]/15 text-[#00C274]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C274] animate-pulse"></span>LIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trade History Panel ─────────────────────────────────────────────────────

function TradeHistoryPanel({ users }: { users: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [preset, setPreset]     = useState<DatePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 20;

  const { from, to } = preset === 'custom'
    ? { from: customFrom || undefined, to: customTo || undefined }
    : presetDates(preset);

  const { data, isLoading, isFetching } = useGetAdminUserTrades(
    { userId: selectedUserId ?? 0, from, to, page, limit: LIMIT },
    { ...getAuthOptions(), query: { enabled: !!selectedUserId } },
  );

  const trades = (data as any)?.trades ?? [];
  const total  = (data as any)?.total  ?? 0;
  const pages  = (data as any)?.pages  ?? 1;

  const stats = useMemo(() => {
    const wins = trades.filter((t: any) => (t.profit ?? 0) >= 0).length;
    const pnl  = trades.reduce((s: number, t: any) => s + (t.profit ?? 0), 0);
    return { wins, losses: trades.length - wins, pnl };
  }, [trades]);

  const clientUsers = users.filter((u: any) => u.role !== 'admin');

  return (
    <div className="space-y-5">
      <div className="card-stealth p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
        <select
          value={selectedUserId ?? ''}
          onChange={e => { setSelectedUserId(parseInt(e.target.value) || null); setPage(1); }}
          className="input-stealth min-w-[220px]"
        >
          <option value="">— Select Client —</option>
          {clientUsers.map((u: any) => (
            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {(['today', '7d', '30d', 'all', 'custom'] as DatePreset[]).map(p => (
            <button
              key={p}
              onClick={() => { setPreset(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === p ? 'bg-[#00C274] text-black' : 'bg-[#181B23] text-[#848E9C] hover:text-white'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'all' ? 'All Time' : p === 'custom' ? 'Custom' : p}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex gap-2 items-center">
            <CalendarDays className="w-4 h-4 text-[#848E9C]" />
            <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); setPage(1); }} className="input-stealth text-sm" />
            <span className="text-[#848E9C]">—</span>
            <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); setPage(1); }} className="input-stealth text-sm" />
          </div>
        )}
      </div>

      {!selectedUserId ? (
        <div className="card-stealth p-16 text-center">
          <History className="w-12 h-12 text-[#181B23] mx-auto mb-4" />
          <p className="text-[#848E9C] font-medium">Select a client to view their trade history.</p>
        </div>
      ) : (
        <>
          {trades.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Wins',    value: stats.wins,   color: '#02C076' },
                { label: 'Losses',  value: stats.losses, color: '#CF304A' },
                { label: 'Net P&L',
                  value: `${stats.pnl >= 0 ? '+' : ''}₹${Math.abs(stats.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                  color: stats.pnl >= 0 ? '#02C076' : '#CF304A' },
              ].map((s, i) => (
                <div key={i} className="card-stealth p-4 text-center">
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[#848E9C] text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card-stealth overflow-hidden">
            {(isLoading || isFetching) && trades.length === 0 ? (
              <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#00C274]" /></div>
            ) : trades.length === 0 ? (
              <div className="p-16 text-center">
                <History className="w-12 h-12 text-[#181B23] mx-auto mb-4" />
                <p className="text-[#848E9C]">No closed trades found for this period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#848E9C] text-xs uppercase tracking-wider border-b border-[#181B23]">
                      <th className="px-5 py-3 text-left font-semibold">Instrument</th>
                      <th className="px-4 py-3 text-left font-semibold">Dir.</th>
                      <th className="px-4 py-3 text-right font-semibold">Entry</th>
                      <th className="px-4 py-3 text-right font-semibold">Exit</th>
                      <th className="px-4 py-3 text-right font-semibold">Duration</th>
                      <th className="px-4 py-3 text-right font-semibold">P&L (₹)</th>
                      <th className="px-4 py-3 text-right font-semibold">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B23]">
                    {trades.map((t: any) => {
                      const isWin = (t.profit ?? 0) >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#181B23]/30 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-bold text-white">{t.instrument}</p>
                            <p className="text-xs text-[#848E9C]">{t.market}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                              t.direction === 'buy' ? 'bg-[#02C076]/15 text-[#02C076]' : 'bg-[#CF304A]/15 text-[#CF304A]'
                            }`}>
                              {t.direction === 'buy' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {t.direction?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#EAECEF] text-xs">
                            {formatPrice(t.entryPrice, t.instrument)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#EAECEF] text-xs">
                            {t.exitPrice ? formatPrice(t.exitPrice, t.instrument) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-[#848E9C] text-xs">
                            {formatDuration(t.openedAt, t.closedAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-black text-sm ${isWin ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                              {isWin ? '+' : ''}₹{Number(t.profit ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-[#848E9C]">
                            {t.closedAt ? new Date(t.closedAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#181B23]">
                <span className="text-[#848E9C] text-xs">{total} total trades</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-[#181B23] text-[#848E9C] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm font-bold">{page} / {pages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                    className="p-1.5 rounded-lg bg-[#181B23] text-[#848E9C] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Instruments reference (mirrors tradeCron) ────────────────────────────────

const INSTRUMENTS_DATA = [
  { instrument: 'EUR/USD',  market: 'Forex',  basePrice: 1.0923,  lotSize: 100000 },
  { instrument: 'GBP/USD',  market: 'Forex',  basePrice: 1.2725,  lotSize: 100000 },
  { instrument: 'USD/JPY',  market: 'Forex',  basePrice: 155.20,  lotSize: 100000 },
  { instrument: 'AUD/USD',  market: 'Forex',  basePrice: 0.6445,  lotSize: 100000 },
  { instrument: 'USD/CAD',  market: 'Forex',  basePrice: 1.3618,  lotSize: 100000 },
  { instrument: 'NZD/USD',  market: 'Forex',  basePrice: 0.5950,  lotSize: 100000 },
  { instrument: 'EUR/GBP',  market: 'Forex',  basePrice: 0.8578,  lotSize: 100000 },
  { instrument: 'GBP/JPY',  market: 'Forex',  basePrice: 197.10,  lotSize: 100000 },
  { instrument: 'BTC/USDT', market: 'Crypto', basePrice: 65240,   lotSize: 0.01   },
  { instrument: 'ETH/USDT', market: 'Crypto', basePrice: 3215,    lotSize: 0.1    },
  { instrument: 'SOL/USDT', market: 'Crypto', basePrice: 158,     lotSize: 1.0    },
  { instrument: 'BNB/USDT', market: 'Crypto', basePrice: 582,     lotSize: 0.1    },
  { instrument: 'XRP/USDT', market: 'Crypto', basePrice: 0.526,   lotSize: 500    },
];

// ─── Inject Trade Panel ───────────────────────────────────────────────────────

function InjectTradePanel({ users }: { users: any[] }) {
  const { toast }   = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [userId,     setUserId]     = useState('');
  const [instrKey,   setInstrKey]   = useState('EUR/USD');
  const [direction,  setDirection]  = useState<'buy' | 'sell'>('buy');
  const [tradeStatus, setTradeStatus] = useState<'open' | 'closed'>('closed');
  const [profit,     setProfit]     = useState('');
  const [entryOverride, setEntryOverride] = useState('');

  const instr = INSTRUMENTS_DATA.find(i => i.instrument === instrKey) || INSTRUMENTS_DATA[0];

  const handleSubmit = async () => {
    if (!userId) { toast({ title: 'No user selected', description: 'Please choose a client.', variant: 'destructive' }); return; }
    if (tradeStatus === 'closed' && profit === '') { toast({ title: 'Profit required', description: 'Enter a profit or loss amount (₹).', variant: 'destructive' }); return; }

    const entryPrice = entryOverride ? parseFloat(entryOverride) : instr.basePrice;
    const profitVal  = tradeStatus === 'closed' ? parseFloat(profit) : undefined;

    setSubmitting(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem('ecm_token');
      const res = await fetch('/api/admin/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId:     parseInt(userId),
          instrument: instr.instrument,
          market:     instr.market,
          direction,
          entryPrice,
          lotSize:    instr.lotSize,
          status:     tradeStatus,
          profit:     profitVal,
          closedAt:   tradeStatus === 'closed' ? new Date().toISOString() : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      const userName = users.find(u => u.id === parseInt(userId));
      const label    = userName ? `${userName.firstName} ${userName.lastName}`.trim() || userName.email : `User #${userId}`;
      toast({
        title: 'Trade Injected',
        description: `${direction.toUpperCase()} ${instr.instrument} ${tradeStatus === 'closed' ? `(₹${profitVal! >= 0 ? '+' : ''}${profitVal})` : '(OPEN)'} → ${label}`,
      });
      setSuccess(true);
      setProfit('');
      setEntryOverride('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find(u => u.id === parseInt(userId));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card-stealth p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#00C27420', border: '1px solid #00C27440' }}>
          <Zap className="w-5 h-5 text-[#00C274]" />
        </div>
        <div>
          <p className="text-white font-bold">Manual Trade Injection</p>
          <p className="text-[#848E9C] text-sm">Add a simulated trade directly to a client's account</p>
        </div>
      </div>

      <div className="card-stealth p-6 space-y-6">
        {/* User */}
        <div>
          <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Client *</label>
          <select
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="w-full bg-[#0C0E15] border border-[#1A1D27] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00C274] transition-colors"
          >
            <option value="">— Select a client —</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>
                {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email} ({u.email})
              </option>
            ))}
          </select>
          {selectedUser && (
            <p className="text-xs text-[#00C274] mt-1.5">
              Balance: ₹{(selectedUser.totalBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Instrument */}
        <div>
          <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Instrument *</label>
          <select
            value={instrKey}
            onChange={e => { setInstrKey(e.target.value); setEntryOverride(''); }}
            className="w-full bg-[#0C0E15] border border-[#1A1D27] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00C274] transition-colors"
          >
            <optgroup label="Forex">
              {INSTRUMENTS_DATA.filter(i => i.market === 'Forex').map(i => (
                <option key={i.instrument} value={i.instrument}>{i.instrument}</option>
              ))}
            </optgroup>
            <optgroup label="Crypto">
              {INSTRUMENTS_DATA.filter(i => i.market === 'Crypto').map(i => (
                <option key={i.instrument} value={i.instrument}>{i.instrument}</option>
              ))}
            </optgroup>
          </select>
          <p className="text-xs text-[#848E9C] mt-1">
            Market: <span className="text-white">{instr.market}</span> &nbsp;|&nbsp;
            Default entry: <span className="text-white font-mono">{instr.basePrice}</span> &nbsp;|&nbsp;
            Lot size: <span className="text-white font-mono">{instr.lotSize}</span>
          </p>
        </div>

        {/* Entry override */}
        <div>
          <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Entry Price (optional override)</label>
          <input
            type="number"
            step="any"
            value={entryOverride}
            onChange={e => setEntryOverride(e.target.value)}
            placeholder={`Default: ${instr.basePrice}`}
            className="w-full bg-[#0C0E15] border border-[#1A1D27] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#00C274] transition-colors placeholder-[#3d4450]"
          />
        </div>

        {/* Direction + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Direction *</label>
            <div className="flex rounded-xl overflow-hidden border border-[#1A1D27]">
              <button
                onClick={() => setDirection('buy')}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${direction === 'buy' ? 'bg-[#02C076] text-black' : 'bg-[#0C0E15] text-[#848E9C] hover:text-white'}`}
              >▲ BUY</button>
              <button
                onClick={() => setDirection('sell')}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${direction === 'sell' ? 'bg-[#CF304A] text-white' : 'bg-[#0C0E15] text-[#848E9C] hover:text-white'}`}
              >▼ SELL</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Status *</label>
            <div className="flex rounded-xl overflow-hidden border border-[#1A1D27]">
              <button
                onClick={() => setTradeStatus('closed')}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${tradeStatus === 'closed' ? 'bg-[#00C274] text-black' : 'bg-[#0C0E15] text-[#848E9C] hover:text-white'}`}
              >Closed</button>
              <button
                onClick={() => setTradeStatus('open')}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${tradeStatus === 'open' ? 'bg-[#2a6df4] text-white' : 'bg-[#0C0E15] text-[#848E9C] hover:text-white'}`}
              >Open</button>
            </div>
          </div>
        </div>

        {/* Profit — only for closed trades */}
        {tradeStatus === 'closed' && (
          <div>
            <label className="block text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-2">Profit / Loss (₹) *</label>
            <input
              type="number"
              step="any"
              value={profit}
              onChange={e => setProfit(e.target.value)}
              placeholder="e.g. 1500 for profit, -300 for loss"
              className="w-full bg-[#0C0E15] border border-[#1A1D27] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#00C274] transition-colors placeholder-[#3d4450]"
            />
            {profit !== '' && (
              <p className={`text-sm font-bold mt-1.5 ${parseFloat(profit) >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                {parseFloat(profit) >= 0 ? `+₹${parseFloat(profit).toLocaleString('en-IN')} will be added to balance` : `₹${Math.abs(parseFloat(profit)).toLocaleString('en-IN')} will be deducted from balance`}
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !userId}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: success ? '#02C076' : '#00C274', color: 'black' }}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Injecting...</>
          ) : success ? (
            <><CheckCircle2 className="w-4 h-4" /> Trade Injected!</>
          ) : (
            <><Plus className="w-4 h-4" /> Inject Trade</>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-[#3d4450]">
        Closed trades immediately update the client's balance and appear in Trade History.
        Open trades appear in Live Positions and will be closed by the next cron cycle.
      </p>
    </div>
  );
}

// ─── Main AdminTrades ─────────────────────────────────────────────────────────

export function AdminTrades() {
  const [tab, setTab] = useState<'live' | 'history' | 'inject'>('live');
  const { data: users } = useGetAdminUsers({ ...getAuthOptions() });
  const allUsers = (users as any[]) || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trade Monitor</h1>
        <p className="text-[#848E9C] font-medium">Live positions and closed trade history across all clients</p>
      </div>

      <div className="flex gap-1 p-1 bg-[#0C0E15] border border-[#181B23] rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab('live')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'live' ? 'bg-[#00C274] text-black' : 'text-[#848E9C] hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Live Trades
          {tab === 'live' && <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'history' ? 'bg-[#00C274] text-black' : 'text-[#848E9C] hover:text-white'
          }`}
        >
          <History className="w-4 h-4" /> Trade History
        </button>
        <button
          onClick={() => setTab('inject')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'inject' ? 'bg-[#00C274] text-black' : 'text-[#848E9C] hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" /> Inject Trade
        </button>
      </div>

      {tab === 'live' && <LiveTradesPanel />}
      {tab === 'history' && <TradeHistoryPanel users={allUsers} />}
      {tab === 'inject' && <InjectTradePanel users={allUsers} />}
    </AdminLayout>
  );
}
