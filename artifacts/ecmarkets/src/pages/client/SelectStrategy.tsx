import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetStrategies, useGetDashboard, useSelectStrategy } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'wouter';
import {
  Zap, Search, CheckCircle, Loader2, TrendingUp,
  Shield, AlertTriangle, Target, Wallet, Filter, Lock, ShieldCheck, Activity
} from 'lucide-react';

const RAZR_MIN_BALANCE = 20_000;

const RISK_COLORS: Record<string, string> = { low: '#1F77B4', medium: '#F59E0B', high: '#DC2626' };
const RISK_BG: Record<string, string>    = { low: '#1F77B418', medium: '#F59E0B18', high: '#DC262618' };
const RISK_ICONS: Record<string, any>    = { low: Shield, medium: Target, high: AlertTriangle };

const isRazrName = (n: string) => n.toLowerCase().includes('razr') || n.toLowerCase().includes('razor');
const getDailyRate = (n: string) => isRazrName(n) ? 8.0 : 4.0;

export function SelectStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [activating, setActivating] = useState<number | null>(null);

  const { data: strategies, isLoading: loadingStrats } = useGetStrategies();
  const { data: dashboard } = useGetDashboard({
    ...getAuthOptions(),
    query: { staleTime: 0, refetchOnMount: true },
  });

  const selectMutation = useSelectStrategy({
    ...getAuthOptions(),
    mutation: {
      onSuccess: (_data, vars) => {
        const stratId = (vars.data as any).strategyId;
        toast({
          title: stratId ? 'Strategy Activated!' : 'Strategy Removed',
          description: stratId ? 'Auto trading is now running on your account.' : 'Strategy removed from your account.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
        setActivating(null);
      },
      onError: (err: any) => {
        toast({ title: 'Activation Failed', description: err?.response?.data?.message || err?.message || 'Could not update strategy.', variant: 'destructive' });
        setActivating(null);
      },
    },
  });

  const currentStrategyId   = (dashboard as any)?.assignedStrategyId;
  const currentStrategyName = (dashboard as any)?.assignedStrategy;
  const balance             = dashboard?.totalBalance ?? 0;
  const kycStatus: string   = (dashboard as any)?.kycStatus ?? 'pending';
  const kycApproved         = kycStatus === 'approved';

  const allStrategies = (strategies as any[]) || [];
  const filtered = allStrategies.filter((s: any) => {
    if (!s.isActive) return false;
    const matchSearch = search === '' || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = riskFilter === 'all' || s.riskProfile === riskFilter;
    return matchSearch && matchRisk;
  });

  const getBtn = (s: any) => {
    if (!kycApproved) return { label: 'Complete KYC First', icon: Lock, disabled: true, locked: true, variant: 'locked' as const };
    if (isRazrName(s.name) && balance < RAZR_MIN_BALANCE) return { label: `Min ₹${RAZR_MIN_BALANCE.toLocaleString('en-IN')} Required`, icon: Lock, disabled: true, locked: true, variant: 'balance' as const };
    return { label: 'Activate Strategy', icon: Zap, disabled: activating !== null, locked: false, variant: 'activate' as const };
  };

  if (loadingStrats) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-4 border-[#1F77B4] rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Auto Trading Strategies</h1>
        <p className="text-sm text-[#4B5563] font-medium">Activate an algorithm to automate your portfolio growth</p>
      </div>

      {/* KYC Banner */}
      {!kycApproved && (
        <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#F59E0B] text-sm">KYC Required to Activate</p>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {kycStatus === 'submitted' ? 'Your KYC is under review — strategies unlock once approved.' : 'Complete identity verification to start automated trading.'}
            </p>
          </div>
          {kycStatus !== 'submitted' && (
            <Link href="/dashboard/kyc" className="shrink-0 px-4 py-2 rounded-xl text-black font-bold text-sm transition-all"
              style={{ background: '#F59E0B' }}>
              Verify Now →
            </Link>
          )}
        </div>
      )}

      {/* Active Strategy Banner */}
      {currentStrategyName ? (
        <div className="mb-6 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: 'rgba(31,119,180,0.06)', border: '1px solid rgba(31,119,180,0.25)', boxShadow: '0 0 24px rgba(31,119,180,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.3)' }}>
              <Activity className="w-5 h-5 text-[#1F77B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-[#1F77B4] uppercase tracking-wider">Currently Active</p>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F77B4] animate-pulse" />
              </div>
              <p className="text-lg font-bold text-[#111827]">{currentStrategyName}</p>
              <p className="text-xs text-[#4B5563] mt-0.5">
                <span className="text-[#1F77B4] font-bold">+{getDailyRate(currentStrategyName)}% /day</span>
                {' '}· +{(getDailyRate(currentStrategyName) * 30).toFixed(0)}% /mo
              </p>
            </div>
          </div>
          <button
            onClick={() => { setActivating(-1); selectMutation.mutate({ data: { strategyId: undefined } } as any); }}
            disabled={activating !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#DC2626' }}
          >
            {activating === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deactivate
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 border border-dashed border-[#E5E7EB]">
          <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#4B5563]" />
          </div>
          <div>
            <p className="font-semibold text-[#111827] text-sm">No Active Strategy</p>
            <p className="text-xs text-[#4B5563]">Select a strategy below to start auto trading</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#4B5563]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search strategies..."
            className="input-stealth pl-9 w-full"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', color: '#111827' },
            { key: 'low', label: 'Low Risk', color: '#1F77B4' },
            { key: 'medium', label: 'Medium', color: '#F59E0B' },
            { key: 'high', label: 'High Risk', color: '#DC2626' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setRiskFilter(f.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border"
              style={riskFilter === f.key
                ? { background: `${f.color}18`, borderColor: `${f.color}50`, color: f.color }
                : { background: 'transparent', borderColor: '#E5E7EB', color: '#4B5563' }}
            >
              <Filter className="w-3 h-3" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#4B5563] mb-4 font-medium">{filtered.length} of {allStrategies.length} strategies shown</p>

      {/* Strategy Grid */}
      {filtered.length === 0 ? (
        <div className="card-stealth p-16 text-center">
          <TrendingUp className="w-14 h-14 text-white/[0.05] mx-auto mb-4" />
          <p className="text-[#4B5563] font-medium">No strategies match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s: any) => {
            const isActive = s.id === currentStrategyId;
            const RiskIcon = RISK_ICONS[s.riskProfile] || Target;
            const isLoading = activating === s.id;
            const isRazr = isRazrName(s.name);
            const dailyRate = getDailyRate(s.name);
            const btn = getBtn(s);
            const BtnIcon = btn.icon;

            return (
              <div key={s.id}
                className="card-stealth p-5 relative flex flex-col transition-all duration-200"
                style={isActive ? { borderColor: 'rgba(31,119,180,0.5)', boxShadow: '0 0 24px rgba(31,119,180,0.08)' } : undefined}>

                {/* Badges */}
                {isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    style={{ background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.35)', color: '#1F77B4' }}>
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                {isRazr && !isActive && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide"
                    style={{ background: '#1F77B4', color: '#000' }}>FLAGSHIP</div>
                )}

                {/* Strategy Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: RISK_BG[s.riskProfile], border: `1px solid ${RISK_COLORS[s.riskProfile]}35` }}>
                    <RiskIcon className="w-5 h-5" style={{ color: RISK_COLORS[s.riskProfile] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#111827] truncate text-sm">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold capitalize px-1.5 py-0.5 rounded"
                        style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>
                        {s.riskProfile} risk
                      </span>
                      <span className="text-[11px] text-[#4B5563]">{s.markets}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] mb-4 leading-relaxed flex-1">{s.description}</p>

                {/* ROI Strip */}
                <div className="rounded-xl p-3 mb-3 flex items-center justify-between"
                  style={{ background: 'rgba(31,119,180,0.06)', border: '1px solid rgba(31,119,180,0.18)' }}>
                  <div className="text-center">
                    <p className="text-base font-black tabular-nums text-[#1F77B4]">+{dailyRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-[#4B5563]">Daily ROI</p>
                  </div>
                  <div className="text-[#E5E7EB] font-bold">→</div>
                  <div className="text-center">
                    <p className="text-base font-black tabular-nums text-[#1F77B4]">+{(dailyRate * 30).toFixed(0)}%</p>
                    <p className="text-[10px] text-[#4B5563]">Monthly</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-sm font-bold text-[#1F77B4]">{s.winRate}%</p>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">Win Rate</p>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-sm font-bold text-[#DC2626]">{s.maxDrawdown}%</p>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">Max DD</p>
                  </div>
                </div>

                {/* Min Capital */}
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] mb-4">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Min: <span className="font-bold text-[#111827]">₹{Number(s.minCapital).toLocaleString('en-IN')}</span></span>
                </div>

                {/* Action Button */}
                {isActive ? (
                  <button className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default"
                    style={{ background: 'rgba(31,119,180,0.12)', border: '1px solid rgba(31,119,180,0.3)', color: '#1F77B4' }}>
                    <CheckCircle className="w-4 h-4" /> Currently Active
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (btn.locked) {
                        if (!kycApproved) toast({ title: 'KYC Required', description: 'Complete verification to activate strategies.', variant: 'destructive' });
                        else toast({ title: 'Insufficient Funds', description: `Deposit at least ₹${RAZR_MIN_BALANCE.toLocaleString('en-IN')} to activate this strategy.`, variant: 'destructive' });
                        return;
                      }
                      setActivating(s.id);
                      selectMutation.mutate({ data: { strategyId: s.id } } as any);
                    }}
                    disabled={btn.disabled}
                    className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={btn.variant === 'activate'
                      ? { background: 'linear-gradient(135deg, #1F77B4 0%, #155D8B 100%)', color: '#000' }
                      : btn.variant === 'balance'
                      ? { background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#DC2626' }
                      : { background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#4B5563' }}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BtnIcon className="w-4 h-4" />}
                    {isLoading ? 'Activating...' : btn.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
