import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useUpdateAdminUser, useGetStrategies, useGetAdminKyc, useUpdateAdminKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Users, ShieldCheck, ShieldOff, Search, Loader2,
  ChevronDown, ChevronUp, DollarSign, TrendingUp, Target, Save, Zap,
  KeyRound, Eye, EyeOff, Check, X, AlertTriangle, ImageIcon, CreditCard, Hash
} from 'lucide-react';

function KycImagePreview({ url, label }: { url?: string | null; label: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return (
    <div className="bg-[#0B0E11] border border-dashed border-[#2B3139] rounded-lg p-3 flex flex-col items-center justify-center gap-1 text-[#848E9C] text-xs text-center min-h-[64px]">
      <ImageIcon className="w-4 h-4" />
      <span className="text-[10px]">{label}</span>
    </div>
  );
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-[#848E9C] font-semibold">{label}</p>
      {open ? (
        <div className="relative">
          <img src={url} alt={label} className="w-full rounded-lg border border-[#2B3139] max-h-32 object-cover" />
          <button onClick={() => setOpen(false)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white hover:bg-black/80">
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-1.5 bg-[#0B0E11] border border-[#2B3139] rounded-lg p-2 text-[#F0B90B] text-[10px] font-medium hover:border-[#F0B90B]/40 transition-colors">
          <Eye className="w-3 h-3" /> View
        </button>
      )}
    </div>
  );
}

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editState, setEditState] = useState<Record<number, { balance: string; strategyId: string; growth: string }>>({});
  const [pwState, setPwState] = useState<Record<number, { value: string; show: boolean; loading: boolean }>>({});
  const [kycRejectState, setKycRejectState] = useState<Record<number, { reason: string; rejecting: boolean }>>({});
  const [kycProcessing, setKycProcessing] = useState<number | null>(null);

  const { data: users, isLoading } = useGetAdminUsers({ ...getAuthOptions() });
  const { data: strategies } = useGetStrategies();
  const { data: allKycDocs } = useGetAdminKyc({ ...getAuthOptions() });

  const allStrategies = (strategies as any[]) || [];
  const kycDocsList = (allKycDocs as any[]) || [];

  const updateMutation = useUpdateAdminUser({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "User Updated", description: "Changes saved successfully." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        setProcessingId(null);
      },
      onError: () => toast({ title: "Failed to update user", variant: "destructive" })
    }
  });

  const kycUpdateMutation = useUpdateAdminKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Updated", description: "Client's KYC status has been updated." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        setKycProcessing(null);
        setKycRejectState({});
      },
      onError: () => toast({ title: "Failed to update KYC", variant: "destructive" })
    }
  });

  const toggleActive = (id: number, current: boolean) => {
    setProcessingId(id);
    updateMutation.mutate({ id, data: { isActive: !current } });
  };

  const saveAccountSettings = (user: any) => {
    const state = editState[user.id];
    if (!state) return;
    setProcessingId(user.id);
    updateMutation.mutate({
      id: user.id,
      data: {
        totalBalance: state.balance !== '' ? parseFloat(state.balance) : undefined,
        assignedStrategyId: state.strategyId !== '' ? parseInt(state.strategyId) : (state.strategyId === '' ? 0 : undefined),
        dailyGrowthTarget: state.growth !== '' ? parseFloat(state.growth) : undefined,
      } as any,
    });
  };

  const handleChangePassword = async (userId: number) => {
    const pw = pwState[userId]?.value || '';
    if (pw.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setPwState(p => ({ ...p, [userId]: { ...p[userId], loading: true } }));
    try {
      const token = localStorage.getItem('ecm_token');
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Password Changed", description: "New password set successfully." });
      setPwState(p => ({ ...p, [userId]: { value: '', show: false, loading: false } }));
    } catch (err: unknown) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
      setPwState(p => ({ ...p, [userId]: { ...p[userId], loading: false } }));
    }
  };

  const handleKycApprove = (doc: any) => {
    setKycProcessing(doc.id);
    kycUpdateMutation.mutate({ id: doc.id, data: { status: 'approved' } });
  };

  const handleKycReject = (doc: any) => {
    const reason = kycRejectState[doc.id]?.reason || '';
    if (!reason.trim()) {
      toast({ title: "Reason required", description: "Enter a rejection reason.", variant: "destructive" });
      return;
    }
    setKycProcessing(doc.id);
    kycUpdateMutation.mutate({ id: doc.id, data: { status: 'rejected', rejectionReason: reason } });
  };

  const toggleExpand = (user: any) => {
    if (expandedId === user.id) {
      setExpandedId(null);
    } else {
      setExpandedId(user.id);
      setEditState(prev => ({
        ...prev,
        [user.id]: {
          balance: user.totalBalance != null ? String(user.totalBalance) : '0',
          strategyId: user.assignedStrategyId != null ? String(user.assignedStrategyId) : '',
          growth: user.dailyGrowthTarget != null ? String(user.dailyGrowthTarget) : '',
        }
      }));
    }
  };

  const allUsers = (users as any[]) || [];
  const filtered = allUsers.filter((u: any) =>
    search === '' ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const kycColor = (status: string) => {
    if (status === 'approved') return { color: '#02C076', label: 'Verified' };
    if (status === 'submitted') return { color: '#F0B90B', label: 'Pending' };
    if (status === 'rejected') return { color: '#CF304A', label: 'Rejected' };
    return { color: '#848E9C', label: 'Not Submitted' };
  };

  const riskColors: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };

  const isRazrName = (n?: string) => n?.toLowerCase().includes('razr') || n?.toLowerCase().includes('razor');
  const getDailyPct = (name?: string, target?: number | null) => {
    if (isRazrName(name)) return 8.0;
    return target ?? 4.0;
  };
  const getMonthlyCompound = (dailyPct: number) =>
    parseFloat(((Math.pow(1 + dailyPct / 100, 30) - 1) * 100).toFixed(2));

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-[#848E9C] font-medium">{allUsers.length} registered client{allUsers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#848E9C]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-stealth pl-10 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: allUsers.length, color: '#F0B90B' },
          { label: 'Active', value: allUsers.filter((u: any) => u.isActive).length, color: '#02C076' },
          { label: 'KYC Verified', value: allUsers.filter((u: any) => u.kycStatus === 'approved').length, color: '#2a6df4' },
          { label: 'With Strategy', value: allUsers.filter((u: any) => u.assignedStrategyId).length, color: '#F0B90B' },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5">
            <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#848E9C] text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-stealth overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 text-[#2B3139] mx-auto mb-6" />
            <p className="text-[#848E9C] font-medium">{search ? 'No users match your search.' : 'No users yet.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2B3139]">
            {filtered.map((user: any) => {
              const kyc = kycColor(user.kycStatus);
              const isExpanded = expandedId === user.id;
              const state = editState[user.id] || { balance: '', strategyId: '', growth: '' };
              const assignedStrat = allStrategies.find((s: any) => s.id === user.assignedStrategyId);
              const userKycDoc = kycDocsList.find((d: any) => d.userId === user.id) || null;
              const pwS = pwState[user.id] || { value: '', show: false, loading: false };
              const kycRej = kycRejectState[user.id] || { reason: '', rejecting: false };

              return (
                <div key={user.id}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-[#2B3139]/40 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(user)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F0B90B] flex items-center justify-center font-bold text-black text-sm shrink-0">
                        {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-[#848E9C] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="text-right min-w-[130px]">
                        <p className="font-bold text-white text-sm">₹{Number(user.totalBalance || 0).toLocaleString('en-IN')}</p>
                        {assignedStrat ? (
                          <span className="flex items-center gap-1 text-xs text-[#F0B90B] justify-end">
                            <Zap className="w-3 h-3" />{assignedStrat.name}
                          </span>
                        ) : (
                          <span className="text-xs text-[#2B3139]">No strategy</span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${kyc.color}20`, color: kyc.color }}>
                        <ShieldCheck className="w-3 h-3" />{kyc.label}
                      </span>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleActive(user.id, user.isActive)}
                          disabled={processingId === user.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${user.isActive
                            ? 'bg-[#CF304A]/10 text-[#CF304A] border-[#CF304A]/20 hover:bg-[#CF304A]/20'
                            : 'bg-[#02C076]/10 text-[#02C076] border-[#02C076]/20 hover:bg-[#02C076]/20'
                          }`}
                        >
                          {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (user.isActive ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />)}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#2B3139] text-[#848E9C] hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-[#0B0E11] border-t border-[#2B3139] px-6 py-5 space-y-6">

                      {/* ── Account Settings ── */}
                      <div>
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4">Account Settings</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#EAECEF] flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#F0B90B]" /> Account Balance (₹)
                            </label>
                            <input
                              type="number"
                              value={state.balance}
                              onChange={e => setEditState(prev => ({ ...prev, [user.id]: { ...prev[user.id], balance: e.target.value } }))}
                              placeholder="0.00"
                              className="input-stealth"
                              min="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#EAECEF] flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-[#02C076]" /> Assign Strategy
                            </label>
                            <select
                              value={state.strategyId}
                              onChange={e => setEditState(prev => ({ ...prev, [user.id]: { ...prev[user.id], strategyId: e.target.value } }))}
                              className="input-stealth appearance-none"
                            >
                              <option value="">— None —</option>
                              {allStrategies.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.riskProfile} risk · {s.monthlyReturn}%/mo)
                                </option>
                              ))}
                            </select>
                            {state.strategyId && (() => {
                              const sel = allStrategies.find((s: any) => s.id === parseInt(state.strategyId));
                              return sel ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-[#1E2329] border border-[#2B3139] rounded-lg">
                                  <span className="text-xs font-bold capitalize" style={{ color: riskColors[sel.riskProfile] || '#848E9C' }}>
                                    {sel.riskProfile} risk
                                  </span>
                                  <span className="text-[#2B3139]">·</span>
                                  <span className="text-xs text-[#02C076] font-semibold">+{sel.monthlyReturn}%/mo</span>
                                  <span className="text-[#2B3139]">·</span>
                                  <span className="text-xs text-[#848E9C]">{sel.winRate}% win rate</span>
                                </div>
                              ) : null;
                            })()}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#EAECEF] flex items-center gap-2">
                              <Target className="w-4 h-4 text-[#2a6df4]" /> Daily Growth Target (%)
                            </label>
                            <input
                              type="number"
                              value={state.growth}
                              onChange={e => setEditState(prev => ({ ...prev, [user.id]: { ...prev[user.id], growth: e.target.value } }))}
                              placeholder="e.g. 1.5"
                              className="input-stealth"
                              min="0" max="100" step="0.1"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => saveAccountSettings(user)}
                            disabled={processingId === user.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0B90B] text-black font-bold text-sm hover:bg-[#F8D33A] transition-all"
                          >
                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                        </div>

                        {user.totalBalance > 0 && (() => {
                          const dailyPct = getDailyPct(user.assignedStrategy, user.dailyGrowthTarget);
                          const monthlyPct = getMonthlyCompound(dailyPct);
                          const dailyAmt = user.totalBalance * (dailyPct / 100);
                          const monthlyAmt = user.totalBalance * (monthlyPct / 100);
                          const isRazr = isRazrName(user.assignedStrategy);
                          return (
                            <div className={`mt-4 p-4 rounded-xl border ${isRazr ? 'bg-[#02C076]/5 border-[#02C076]/20' : 'bg-[#F0B90B]/5 border-[#F0B90B]/20'}`}>
                              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isRazr ? '#02C076' : '#F0B90B' }}>
                                Projected Earnings ({isRazr ? 'RazrMarket 8%/day' : `Standard ${dailyPct}%/day`})
                              </p>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-lg font-black text-white">+₹{Math.round(dailyAmt).toLocaleString('en-IN')}</p>
                                  <p className="text-[10px] text-[#848E9C] font-medium">Daily</p>
                                </div>
                                <div>
                                  <p className="text-lg font-black" style={{ color: isRazr ? '#02C076' : '#F0B90B' }}>
                                    +₹{Math.round(monthlyAmt / 4).toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-[10px] text-[#848E9C] font-medium">Weekly (est.)</p>
                                </div>
                                <div>
                                  <p className="text-lg font-black text-[#02C076]">+₹{Math.round(monthlyAmt).toLocaleString('en-IN')}</p>
                                  <p className="text-[10px] text-[#848E9C] font-medium">Monthly ({monthlyPct}%)</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* ── KYC Verification ── */}
                      <div className="border-t border-[#2B3139] pt-5">
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> KYC Verification
                          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: `${kycColor(user.kycStatus).color}20`, color: kycColor(user.kycStatus).color }}>
                            {kycColor(user.kycStatus).label}
                          </span>
                        </p>

                        {!userKycDoc ? (
                          <div className="flex items-start gap-3 bg-[#1E2329] border border-[#2B3139] rounded-xl p-4">
                            <AlertTriangle className="w-4 h-4 text-[#848E9C] mt-0.5 shrink-0" />
                            <p className="text-xs text-[#848E9C]">
                              {user.kycStatus === 'pending' || !user.kycStatus
                                ? 'Client has not submitted KYC documents yet.'
                                : 'KYC status was set manually. No documents were submitted through the portal.'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* PAN & Aadhar details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-[#0d1117] border border-[#2B3139] rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-3.5 h-3.5 text-[#F0B90B]" />
                                  <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-wider">PAN Card</p>
                                </div>
                                {userKycDoc.panNumber && (
                                  <div className="flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-[#848E9C]" />
                                    <span className="text-white font-mono text-sm font-bold">{userKycDoc.panNumber}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                  <KycImagePreview url={userKycDoc.panCardFrontUrl} label="Front" />
                                  <KycImagePreview url={userKycDoc.panCardBackUrl} label="Back" />
                                </div>
                              </div>

                              <div className="bg-[#0d1117] border border-[#2B3139] rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-3.5 h-3.5 text-[#2a6df4]" />
                                  <p className="text-[#2a6df4] text-xs font-bold uppercase tracking-wider">Aadhar Card</p>
                                </div>
                                {userKycDoc.aadharNumber && (
                                  <div className="flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-[#848E9C]" />
                                    <span className="text-white font-mono text-sm font-bold">{userKycDoc.aadharNumber}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                  <KycImagePreview url={userKycDoc.aadharCardFrontUrl} label="Front" />
                                  <KycImagePreview url={userKycDoc.aadharCardBackUrl} label="Back" />
                                </div>
                              </div>
                            </div>

                            {/* Approve / Reject actions */}
                            {userKycDoc.status === 'submitted' && (
                              <div className="space-y-3">
                                {kycRej.rejecting && (
                                  <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#CF304A]">Rejection Reason (required)</label>
                                    <textarea
                                      value={kycRej.reason}
                                      onChange={e => setKycRejectState(p => ({ ...p, [user.id]: { ...p[user.id], reason: e.target.value } }))}
                                      placeholder="Explain why the documents were rejected..."
                                      className="input-stealth resize-none text-sm"
                                      rows={2}
                                    />
                                  </div>
                                )}
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleKycApprove(userKycDoc)}
                                    disabled={kycProcessing === userKycDoc.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-sm transition-all"
                                  >
                                    {kycProcessing === userKycDoc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Approve KYC
                                  </button>

                                  {kycRej.rejecting ? (
                                    <>
                                      <button
                                        onClick={() => handleKycReject(userKycDoc)}
                                        disabled={kycProcessing === userKycDoc.id}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CF304A] text-white font-bold text-sm hover:bg-[#CF304A]/80 transition-all"
                                      >
                                        {kycProcessing === userKycDoc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                        Confirm Reject
                                      </button>
                                      <button
                                        onClick={() => setKycRejectState(p => ({ ...p, [user.id]: { reason: '', rejecting: false } }))}
                                        className="px-4 py-2 rounded-xl bg-[#2B3139] text-[#848E9C] hover:text-white font-bold text-sm transition-all"
                                      >Cancel</button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setKycRejectState(p => ({ ...p, [user.id]: { ...p[user.id], rejecting: true } }))}
                                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/40 hover:bg-[#CF304A]/30 font-bold text-sm transition-all"
                                    >
                                      <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {userKycDoc.status === 'approved' && (
                              <div className="flex items-center gap-2 px-4 py-3 bg-[#02C076]/10 border border-[#02C076]/30 rounded-xl">
                                <ShieldCheck className="w-4 h-4 text-[#02C076]" />
                                <span className="text-sm font-bold text-[#02C076]">KYC Approved — Identity Verified</span>
                              </div>
                            )}

                            {userKycDoc.status === 'rejected' && (
                              <div className="space-y-2">
                                <div className="flex items-start gap-2 px-4 py-3 bg-[#CF304A]/10 border border-[#CF304A]/30 rounded-xl">
                                  <X className="w-4 h-4 text-[#CF304A] mt-0.5" />
                                  <div>
                                    <p className="text-sm font-bold text-[#CF304A]">KYC Rejected</p>
                                    {userKycDoc.rejectionReason && <p className="text-xs text-[#848E9C] mt-0.5">{userKycDoc.rejectionReason}</p>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleKycApprove(userKycDoc)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-sm transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" /> Re-approve KYC
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quick KYC status override (no docs) */}
                        {!userKycDoc && user.kycStatus !== 'approved' && (
                          <div className="mt-3 flex gap-3">
                            <button
                              onClick={() => {
                                updateMutation.mutate({ id: user.id, data: { kycStatus: 'approved' } as any });
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-xs transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark as Verified
                            </button>
                            {user.kycStatus !== 'pending' && (
                              <button
                                onClick={() => updateMutation.mutate({ id: user.id, data: { kycStatus: 'pending' } as any })}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B3139] text-[#848E9C] hover:text-white border border-[#2B3139] font-bold text-xs transition-all"
                              >
                                Reset to Pending
                              </button>
                            )}
                          </div>
                        )}
                        {!userKycDoc && user.kycStatus === 'approved' && (
                          <div className="mt-3">
                            <button
                              onClick={() => updateMutation.mutate({ id: user.id, data: { kycStatus: 'pending' } as any })}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B3139] text-[#848E9C] hover:text-white border border-[#2B3139] font-bold text-xs transition-all"
                            >
                              Reset Status to Pending
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ── Change Password ── */}
                      <div className="border-t border-[#2B3139] pt-5">
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5" /> Change Password
                        </p>
                        <div className="flex gap-3 items-start max-w-md">
                          <div className="relative flex-1">
                            <input
                              type={pwS.show ? 'text' : 'password'}
                              value={pwS.value}
                              onChange={e => setPwState(p => ({ ...p, [user.id]: { ...p[user.id], value: e.target.value } }))}
                              placeholder="Enter new password (min 6 chars)"
                              className="input-stealth pr-10 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setPwState(p => ({ ...p, [user.id]: { ...p[user.id], show: !pwS.show } }))}
                              className="absolute right-3 top-3 text-[#848E9C] hover:text-white"
                            >
                              {pwS.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            onClick={() => handleChangePassword(user.id)}
                            disabled={pwS.loading || !pwS.value}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a6df4]/20 text-[#2a6df4] border border-[#2a6df4]/40 hover:bg-[#2a6df4]/30 font-bold text-sm transition-all shrink-0"
                          >
                            {pwS.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            Set Password
                          </button>
                        </div>
                      </div>

                      {/* ── User Details ── */}
                      <div className="border-t border-[#2B3139] pt-4 grid grid-cols-3 gap-4 text-xs text-[#848E9C]">
                        <div>
                          <span className="block font-semibold text-[#EAECEF]">Joined</span>
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div>
                          <span className="block font-semibold text-[#EAECEF]">Phone</span>
                          {user.phone || '—'}
                        </div>
                        <div>
                          <span className="block font-semibold text-[#EAECEF]">Country</span>
                          {user.country || '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
