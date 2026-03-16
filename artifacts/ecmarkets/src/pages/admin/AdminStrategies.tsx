import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStrategies, useCreateAdminStrategy, useUpdateAdminStrategy, useDeleteAdminStrategy } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Plus, Edit, Trash2, CheckCircle, XCircle,
  Loader2, X, BarChart2, Target, Shield, Zap, Search
} from 'lucide-react';

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };
const RISK_BG: Record<string, string> = { low: '#02C07620', medium: '#F0B90B20', high: '#CF304A20' };

const emptyForm = { name: '', description: '', riskProfile: 'medium', minCapital: '', winRate: '', maxDrawdown: '', monthlyReturn: '', markets: '', isActive: true };

export function AdminStrategies() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'delete'; data?: any } | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const { data: strategies, isLoading } = useGetAdminStrategies({ ...getAuthOptions() });

  const createMutation = useCreateAdminStrategy({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Strategy Created', description: 'New strategy is now live.' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/strategies'] });
        queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
        setModal(null); setSaving(false);
      },
      onError: () => { toast({ title: 'Failed to create', variant: 'destructive' }); setSaving(false); }
    }
  });

  const updateMutation = useUpdateAdminStrategy({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Strategy Updated', description: 'Changes saved.' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/strategies'] });
        queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
        setModal(null); setSaving(false);
      },
      onError: () => { toast({ title: 'Failed to update', variant: 'destructive' }); setSaving(false); }
    }
  });

  const deleteMutation = useDeleteAdminStrategy({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Strategy Deleted' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/strategies'] });
        queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
        setModal(null); setSaving(false);
      },
      onError: () => { toast({ title: 'Failed to delete', variant: 'destructive' }); setSaving(false); }
    }
  });

  const allStrats = (strategies as any[]) || [];
  const filtered = allStrats.filter(s =>
    search === '' || s.name?.toLowerCase().includes(search.toLowerCase()) || s.markets?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm({ ...emptyForm }); setModal({ type: 'create' }); };
  const openEdit = (s: any) => {
    setForm({ name: s.name, description: s.description, riskProfile: s.riskProfile, minCapital: String(s.minCapital), winRate: String(s.winRate), maxDrawdown: String(s.maxDrawdown), monthlyReturn: String(s.monthlyReturn), markets: s.markets, isActive: s.isActive });
    setModal({ type: 'edit', data: s });
  };
  const openDelete = (s: any) => setModal({ type: 'delete', data: s });

  const handleSubmit = () => {
    if (!form.name || !form.riskProfile || !form.minCapital || !form.winRate || !form.monthlyReturn) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, riskProfile: form.riskProfile as any,
      minCapital: parseFloat(form.minCapital), winRate: parseFloat(form.winRate),
      maxDrawdown: parseFloat(form.maxDrawdown) || 0, monthlyReturn: parseFloat(form.monthlyReturn),
      markets: form.markets, isActive: form.isActive,
    };
    if (modal?.type === 'create') {
      createMutation.mutate({ data: payload });
    } else if (modal?.type === 'edit') {
      updateMutation.mutate({ id: modal.data.id, data: payload });
    }
  };

  const handleDelete = () => {
    setSaving(true);
    deleteMutation.mutate({ id: modal?.data?.id });
  };

  const toggleActive = (s: any) => {
    updateMutation.mutate({ id: s.id, data: { ...s, isActive: !s.isActive } });
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Management</h1>
          <p className="text-[#848E9C] font-medium">{allStrats.length} strategies in database · {allStrats.filter((s: any) => s.isActive).length} active</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#848E9C]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search strategies..." className="input-stealth pl-9 w-52" />
          </div>
          <button onClick={openCreate} className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Strategy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: allStrats.length, color: '#F0B90B', icon: TrendingUp },
          { label: 'Active', value: allStrats.filter((s: any) => s.isActive).length, color: '#02C076', icon: CheckCircle },
          { label: 'Low Risk', value: allStrats.filter((s: any) => s.riskProfile === 'low').length, color: '#02C076', icon: Shield },
          { label: 'High Risk', value: allStrats.filter((s: any) => s.riskProfile === 'high').length, color: '#CF304A', icon: Zap },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[#848E9C] text-xs font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-stealth overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2B3139]">
                {['Strategy', 'Markets', 'Risk', 'Min Capital', 'Win Rate', 'Monthly Return', 'Drawdown', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[#848E9C] text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-[#848E9C]">
                  <TrendingUp className="w-12 h-12 text-[#2B3139] mx-auto mb-3" />
                  {search ? 'No matching strategies.' : 'No strategies yet.'}
                </td></tr>
              ) : filtered.map((s: any) => (
                <tr key={s.id} className="hover:bg-[#2B3139]/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: RISK_BG[s.riskProfile], border: `1px solid ${RISK_COLORS[s.riskProfile]}40` }}>
                        <Zap className="w-4 h-4" style={{ color: RISK_COLORS[s.riskProfile] }} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{s.name}</p>
                        <p className="text-xs text-[#848E9C] max-w-[180px] truncate">{s.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#848E9C] text-sm">{s.markets}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile}</span>
                  </td>
                  <td className="px-5 py-4 text-[#EAECEF] text-sm font-medium">₹{Number(s.minCapital).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-[#F0B90B] font-bold text-sm">{s.winRate}%</td>
                  <td className="px-5 py-4 text-[#02C076] font-bold text-sm">+{s.monthlyReturn}%</td>
                  <td className="px-5 py-4 text-[#CF304A] font-bold text-sm">{s.maxDrawdown}%</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(s)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${s.isActive ? 'bg-[#02C076]/20 text-[#02C076] hover:bg-[#02C076]/30' : 'bg-[#CF304A]/20 text-[#CF304A] hover:bg-[#CF304A]/30'}`}>
                      {s.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-[#2B3139] text-[#848E9C] hover:text-[#F0B90B] hover:bg-[#F0B90B]/10 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg bg-[#2B3139] text-[#848E9C] hover:text-[#CF304A] hover:bg-[#CF304A]/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2B3139]">
              <h2 className="text-xl font-bold text-white">{modal.type === 'create' ? 'Add New Strategy' : 'Edit Strategy'}</h2>
              <button onClick={() => setModal(null)} className="p-2 text-[#848E9C] hover:text-white rounded-xl hover:bg-[#2B3139] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Strategy Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-stealth w-full" placeholder="e.g. Quantum Alpha" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Markets</label>
                  <input value={form.markets} onChange={e => setForm(p => ({ ...p, markets: e.target.value }))} className="input-stealth w-full" placeholder="e.g. Forex, Gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-stealth w-full h-20 resize-none" placeholder="Brief strategy description..." />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Risk Profile *</label>
                  <select value={form.riskProfile} onChange={e => setForm(p => ({ ...p, riskProfile: e.target.value }))} className="input-stealth w-full">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Min Capital (₹) *</label>
                  <input type="number" value={form.minCapital} onChange={e => setForm(p => ({ ...p, minCapital: e.target.value }))} className="input-stealth w-full" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Win Rate (%) *</label>
                  <input type="number" value={form.winRate} onChange={e => setForm(p => ({ ...p, winRate: e.target.value }))} className="input-stealth w-full" placeholder="70.0" step="0.1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Monthly Return (%) *</label>
                  <input type="number" value={form.monthlyReturn} onChange={e => setForm(p => ({ ...p, monthlyReturn: e.target.value }))} className="input-stealth w-full" placeholder="5.0" step="0.1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#EAECEF] mb-2">Max Drawdown (%)</label>
                  <input type="number" value={form.maxDrawdown} onChange={e => setForm(p => ({ ...p, maxDrawdown: e.target.value }))} className="input-stealth w-full" placeholder="8.0" step="0.1" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-[#02C076]' : 'bg-[#2B3139]'}`} onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${form.isActive ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-[#EAECEF]">{form.isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[#2B3139]">
              <button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-gold flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {modal.type === 'create' ? 'Create Strategy' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#CF304A]/30 rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#CF304A]/20 border border-[#CF304A]/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#CF304A]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Strategy?</h2>
            <p className="text-[#848E9C] mb-6">This will permanently delete <strong className="text-white">{modal.data?.name}</strong>. Users assigned to this strategy will lose their assignment.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#CF304A] text-white font-bold hover:bg-[#e03455] transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
