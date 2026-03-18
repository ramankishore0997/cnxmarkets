import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useUpdateAdminUser, useGetAdminKyc, useUpdateAdminKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Users, ShieldCheck, ShieldOff, Search, Loader2,
  ChevronDown, ChevronUp, DollarSign, Target, Save,
  KeyRound, Eye, EyeOff, Check, X, CreditCard, Hash, TrendingUp
} from 'lucide-react';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editState, setEditState] = useState<Record<number, { balance: string; growth: string }>>({});
  const [pwState, setPwState] = useState<Record<number, { value: string; show: boolean; loading: boolean }>>({});
  const [kycRejectState, setKycRejectState] = useState<Record<number, { reason: string; rejecting: boolean }>>({});
  const [kycProcessing, setKycProcessing] = useState<number | null>(null);

  const { data: users, isLoading } = useGetAdminUsers({ ...getAuthOptions() });
  const { data: allKycDocs } = useGetAdminKyc({ ...getAuthOptions() });

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
          growth:  user.dailyGrowthTarget != null ? String(user.dailyGrowthTarget) : '',
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
    if (status === 'submitted') return { color: '#00C274', label: 'Pending' };
    if (status === 'rejected') return { color: '#CF304A', label: 'Rejected' };
    return { color: '#848E9C', label: 'Not Submitted' };
  };

  const getMonthlyCompound = (dailyPct: number) =>
    parseFloat(((Math.pow(1 + dailyPct / 100, 30) - 1) * 100).toFixed(2));

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#00C274]" /></div>
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
          { label: 'Total Users',      value: allUsers.length,                                              color: '#00C274' },
          { label: 'Active',           value: allUsers.filter((u: any) => u.isActive).length,               color: '#02C076' },
          { label: 'KYC Verified',     value: allUsers.filter((u: any) => u.kycStatus === 'approved').length, color: '#2a6df4' },
          { label: 'Growth Active',    value: allUsers.filter((u: any) => u.dailyGrowthTarget).length,       color: '#00C274' },
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
            <Users className="w-16 h-16 text-[#181B23] mx-auto mb-6" />
            <p className="text-[#848E9C] font-medium">{search ? 'No users match your search.' : 'No users yet.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#181B23]">
            {filtered.map((user: any) => {
              const kyc   = kycColor(user.kycStatus);
              const isExpanded = expandedId === user.id;
              const state = editState[user.id] || { balance: '', growth: '' };
              const userKycDoc = kycDocsList.find((d: any) => d.userId === user.id) || null;
              const pwS   = pwState[user.id] || { value: '', show: false, loading: false };
              const kycRej = kycRejectState[user.id] || { reason: '', rejecting: false };

              return (
                <div key={user.id}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-[#181B23]/40 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(user)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#00C274] flex items-center justify-center font-bold text-black text-sm shrink-0">
                        {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-[#848E9C] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="text-right min-w-[140px]">
                        <p className="font-bold text-white text-sm">₹{Number(user.totalBalance || 0).toLocaleString('en-IN')}</p>
                        {user.dailyGrowthTarget ? (
                          <span className="flex items-center gap-1 text-xs text-[#00C274] justify-end">
                            <TrendingUp className="w-3 h-3" />+{user.dailyGrowthTarget}%/day
                          </span>
                        ) : (
                          <span className="text-xs text-[#3d4450]">No growth target</span>
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
                        <button className="p-1.5 rounded-lg hover:bg-[#181B23] text-[#848E9C] hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-[#060709] border-t border-[#181B23] px-6 py-5 space-y-6">

                      {/* ── Account Settings ── */}
                      <div>
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4">Account Settings</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#EAECEF] flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#00C274]" /> Account Balance (₹)
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
                              <Target className="w-4 h-4 text-[#2a6df4]" /> Daily Growth Target (%)
                            </label>
                            <input
                              type="number"
                              value={state.growth}
                              onChange={e => setEditState(prev => ({ ...prev, [user.id]: { ...prev[user.id], growth: e.target.value } }))}
                              placeholder="e.g. 4"
                              className="input-stealth"
                              min="0" max="100" step="0.1"
                            />
                            <p className="text-xs text-[#848E9C]">Actual daily return will vary ±1% around this target (e.g. 4% → 3–5%/day)</p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => saveAccountSettings(user)}
                            disabled={processingId === user.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C274] text-black font-bold text-sm hover:bg-[#02C076] transition-all"
                          >
                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                        </div>

                        {user.totalBalance > 0 && user.dailyGrowthTarget && (() => {
                          const dailyPct   = parseFloat(user.dailyGrowthTarget);
                          const monthlyPct = getMonthlyCompound(dailyPct);
                          const dailyAmt   = user.totalBalance * (dailyPct / 100);
                          const monthlyAmt = user.totalBalance * (monthlyPct / 100);
                          return (
                            <div className="mt-4 p-4 rounded-xl border bg-[#00C274]/5 border-[#00C274]/20">
                              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#00C274]">
                                Projected Earnings ({dailyPct}%/day target)
                              </p>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-lg font-black text-white">+₹{Math.round(dailyAmt).toLocaleString('en-IN')}</p>
                                  <p className="text-[10px] text-[#848E9C] font-medium">Daily</p>
                                </div>
                                <div>
                                  <p className="text-lg font-black text-[#00C274]">+₹{Math.round(monthlyAmt / 4).toLocaleString('en-IN')}</p>
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
                      <div className="border-t border-[#181B23] pt-5">
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> KYC Verification
                          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: `${kycColor(user.kycStatus).color}20`, color: kycColor(user.kycStatus).color }}>
                            {kycColor(user.kycStatus).label}
                          </span>
                        </p>

                        {userKycDoc && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-[#0d1117] border border-[#181B23] rounded-xl px-4 py-3 flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-[#00C274] shrink-0" />
                              <div>
                                <p className="text-[10px] text-[#848E9C] font-semibold uppercase tracking-wider">PAN</p>
                                <p className="text-white font-mono text-sm font-bold">{userKycDoc.panNumber || '—'}</p>
                              </div>
                            </div>
                            <div className="bg-[#0d1117] border border-[#181B23] rounded-xl px-4 py-3 flex items-center gap-2">
                              <Hash className="w-3.5 h-3.5 text-[#2a6df4] shrink-0" />
                              <div>
                                <p className="text-[10px] text-[#848E9C] font-semibold uppercase tracking-wider">Aadhaar</p>
                                <p className="text-white font-mono text-sm font-bold">
                                  {userKycDoc.aadharNumber ? `XXXX XXXX ${String(userKycDoc.aadharNumber).slice(-4)}` : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {!userKycDoc ? (
                          <div className="space-y-3">
                            <p className="text-xs text-[#848E9C]">
                              {user.kycStatus === 'approved'
                                ? 'KYC was manually approved — no details submitted.'
                                : 'Client has not submitted KYC details yet.'}
                            </p>
                            {user.kycStatus !== 'approved' ? (
                              <button
                                onClick={() => updateMutation.mutate({ id: user.id, data: { kycStatus: 'approved' } as any })}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-sm transition-all"
                              >
                                <Check className="w-3.5 h-3.5" /> Manually Verify KYC
                              </button>
                            ) : (
                              <button
                                onClick={() => updateMutation.mutate({ id: user.id, data: { kycStatus: 'pending' } as any })}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181B23] text-[#848E9C] hover:text-white font-bold text-sm transition-all"
                              >
                                <X className="w-3.5 h-3.5" /> Reset to Pending
                              </button>
                            )}
                          </div>
                        ) : userKycDoc.status === 'approved' ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#02C076]">
                              <ShieldCheck className="w-4 h-4" />
                              <span className="text-sm font-bold">KYC Verified</span>
                            </div>
                            <button
                              onClick={() => updateMutation.mutate({ id: user.id, data: { kycStatus: 'pending' } as any })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181B23] text-[#848E9C] hover:text-white text-xs font-bold transition-all"
                            >
                              <X className="w-3 h-3" /> Revoke
                            </button>
                          </div>
                        ) : userKycDoc.status === 'rejected' ? (
                          <div className="space-y-3">
                            <p className="text-xs text-[#CF304A] font-medium">
                              Rejected: {userKycDoc.rejectionReason || 'No reason provided'}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleKycApprove(userKycDoc)}
                                disabled={kycProcessing === userKycDoc.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-sm transition-all"
                              >
                                {kycProcessing === userKycDoc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Approve
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-[#848E9C]">KYC documents submitted. Review and approve or reject.</p>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleKycApprove(userKycDoc)}
                                  disabled={kycProcessing === userKycDoc.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold text-sm transition-all"
                                >
                                  {kycProcessing === userKycDoc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  Approve KYC
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  value={kycRej.reason}
                                  onChange={e => setKycRejectState(p => ({ ...p, [user.id]: { ...p[user.id], reason: e.target.value } }))}
                                  placeholder="Rejection reason..."
                                  className="input-stealth flex-1 text-sm"
                                />
                                <button
                                  onClick={() => handleKycReject(userKycDoc)}
                                  disabled={kycProcessing === userKycDoc.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/40 hover:bg-[#CF304A]/30 font-bold text-sm transition-all"
                                >
                                  {kycProcessing === userKycDoc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Change Password ── */}
                      <div className="border-t border-[#181B23] pt-5">
                        <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5" /> Change Password
                        </p>
                        <div className="flex gap-2 max-w-sm">
                          <div className="relative flex-1">
                            <input
                              type={pwS.show ? 'text' : 'password'}
                              value={pwS.value}
                              onChange={e => setPwState(p => ({ ...p, [user.id]: { ...p[user.id], value: e.target.value } }))}
                              placeholder="New password..."
                              className="input-stealth pr-10 w-full"
                            />
                            <button
                              type="button"
                              onClick={() => setPwState(p => ({ ...p, [user.id]: { ...p[user.id], show: !p[user.id]?.show } }))}
                              className="absolute right-3 top-3 text-[#848E9C] hover:text-white"
                            >
                              {pwS.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            onClick={() => handleChangePassword(user.id)}
                            disabled={pwS.loading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181B23] text-white hover:bg-[#1A1D27] font-bold text-sm transition-all border border-[#2d3340]"
                          >
                            {pwS.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            Set
                          </button>
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
