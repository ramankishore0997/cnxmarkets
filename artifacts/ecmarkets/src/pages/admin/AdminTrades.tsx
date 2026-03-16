import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useCreateAdminTrade } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, PlusCircle, Loader2, AlertCircle } from 'lucide-react';

const INSTRUMENTS = [
  'NIFTY', 'BANKNIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'INFY',
  'HDFC', 'ICICI', 'SBIN', 'WIPRO', 'ADANIGREEN', 'BAJFINANCE',
  'EURUSD', 'GBPUSD', 'USDINR', 'XAUUSD', 'BTCUSDT', 'ETHUSDT',
];
const MARKETS = ['NSE', 'BSE', 'MCX', 'CRYPTO', 'FOREX', 'COMEX'];

const defaultForm = {
  userId: '',
  instrument: 'NIFTY',
  market: 'NSE',
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

export function AdminTrades() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manual Trade Entry</h1>
        <p className="text-[#848E9C] font-medium">Inject trades into any client account</p>
      </div>

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
                      <button
                        key={d}
                        type="button"
                        onClick={() => set('direction', d)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                          form.direction === d
                            ? d === 'buy' ? 'bg-[#02C076]/20 border-[#02C076] text-[#02C076]' : 'bg-[#CF304A]/20 border-[#CF304A] text-[#CF304A]'
                            : 'bg-[#1E2329] border-[#2B3139] text-[#848E9C] hover:border-[#848E9C]'
                        }`}
                      >
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
                  <input type="number" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} placeholder="0.00" className="input-stealth" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Exit Price</label>
                  <input type="number" value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)} placeholder="0.00" className="input-stealth" step="0.01" />
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

              <button
                type="submit"
                disabled={tradeMutation.isPending}
                className="btn-gold w-full flex justify-center items-center gap-2 text-lg"
              >
                {tradeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Add Trade
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
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

          <div className="card-stealth p-5 mt-4">
            <h3 className="text-sm font-bold text-[#848E9C] uppercase tracking-wider mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-xs text-[#848E9C]">
              <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Positive profit will increase the client's balance automatically.</li>
              <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Leave exit price empty for open trades.</li>
              <li className="flex items-start gap-2"><span className="text-[#F0B90B] mt-0.5">•</span>Profit % is cosmetic only — enter the actual P&L value for balance updates.</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
