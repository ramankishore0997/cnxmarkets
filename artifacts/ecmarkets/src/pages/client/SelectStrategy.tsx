import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetStrategies, useGetDashboard, useSelectStrategy } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'wouter';
import {
  Zap, Search, CheckCircle, Loader2, TrendingUp,
  Shield, AlertTriangle, Target, Wallet, Filter, Lock, ShieldCheck
} from 'lucide-react';

const RAZR_MIN_BALANCE = 20_000;

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };
const RISK_BG: Record<string, string> = { low: '#02C07620', medium: '#F0B90B20', high: '#CF304A20' };
const RISK_ICONS: Record<string, any> = { low: Shield, medium: Target, high: AlertTriangle };

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
          description: stratId ? 'Your portfolio is now running this strategy.' : 'Strategy removed from your account.',
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

  const currentStrategyId = (dashboard as any)?.assignedStrategyId;
  const currentStrategyName = (dashboard as any)?.assignedStrategy;
  const balance = dashboard?.totalBalance ?? 0;
  const kycStatus: string = (dashboard as any)?.kycStatus ?? 'pending';
  const kycApproved = kycStatus === 'approved';

  const allStrategies = (strategies as any[]) || [];
  const filtered = allStrategies.filter((s: any) => {
    if (!s.isActive) return false;
    const matchesSearch = search === '' || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.riskProfile === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getButtonState = (s: any): { label: string; icon: any; disabled: boolean; className: string; locked: boolean } => {
    if (!kycApproved) {
      return {
        label: 'Complete KYC to Unlock',
        icon: Lock,
        disabled: true,
        className: 'w-full py-3 rounded-xl bg-[#2B3139] text-[#848E9C] border border-[#2B3139] font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed',
        locked: true,
      };
    }
    if (isRazrName(s.name) && balance < RAZR_MIN_BALANCE) {
      return {
        label: 'Minimum ₹20,000 Required',
        icon: Lock,
        disabled: true,
        className: 'w-full py-3 rounded-xl bg-[#CF304A]/10 text-[#CF304A] border border-[#CF304A]/30 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed',
        locked: true,
      };
    }
    return {
      label: 'Activate Strategy',
      icon: Zap,
      disabled: activating !== null,
      className: 'w-full py-3 rounded-xl bg-[#F0B90B] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F8D33A] transition-all disabled:opacity-60 disabled:cursor-not-allowed',
      locked: false,
    };
  };

  const activate = (strategyId: number | null, s?: any) => {
    if (s && !getButtonState(s).locked === false) return;
    setActivating(strategyId ?? -1);
    selectMutation.mutate({ data: { strategyId: strategyId ?? undefined } } as any);
  };

  if (loadingStrats) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#2B3139] rounded-full" />
            <div className="absolute inset-0 border-t-4 border-[#F0B90B] rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Strategy Selection</h1>
        <p className="text-[#848E9C] font-medium">Browse and activate institutional-grade algorithmic trading strategies</p>
      </div>

      {/* KYC Status Banner */}
      {!kycApproved && (
        <div className="mb-6 p-4 rounded-xl border border-[#F0B90B]/40 bg-[#F0B90B]/08 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 border border-[#F0B90B]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#F0B90B]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#F0B90B] text-sm">KYC Verification Required</p>
            <p className="text-xs text-[#848E9C] mt-0.5">
              {kycStatus === 'submitted' ? 'Your KYC is under review. Strategies will unlock once approved.' : 'Complete your KYC verification to activate any trading strategy.'}
            </p>
          </div>
          {kycStatus !== 'submitted' && (
            <Link href="/dashboard/kyc" className="shrink-0 px-4 py-2 rounded-xl bg-[#F0B90B] text-black font-bold text-sm hover:bg-[#F8D33A] transition-all">
              Complete KYC →
            </Link>
          )}
        </div>
      )}

      {/* Current Strategy Banner */}
      {currentStrategyName ? (
        <div className="card-stealth-gold p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#F0B90B]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F0B90B] uppercase tracking-wider mb-0.5">Currently Active</p>
              <p className="text-lg font-bold text-white">{currentStrategyName}</p>
              <p className="text-xs text-[#848E9C] mt-0.5">
                <span className={isRazrName(currentStrategyName) ? 'text-[#02C076] font-bold' : 'text-[#F0B90B] font-bold'}>
                  +{getDailyRate(currentStrategyName)}% /day
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => activate(null)}
            disabled={activating !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/30 font-bold text-sm hover:bg-[#CF304A]/30 transition-all"
          >
            {activating === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deactivate
          </button>
        </div>
      ) : (
        <div className="card-stealth p-5 mb-8 flex items-center gap-4 border-dashed border-[#2B3139]">
          <div className="w-10 h-10 rounded-xl bg-[#2B3139] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#848E9C]" />
          </div>
          <div>
            <p className="font-semibold text-[#EAECEF]">No Active Strategy</p>
            <p className="text-xs text-[#848E9C]">Select a strategy below to start automated trading on your account.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#848E9C]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search strategies by name or description..." className="input-stealth pl-9 w-full" />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', color: '#EAECEF' },
            { key: 'low', label: 'Low Risk', color: '#02C076' },
            { key: 'medium', label: 'Medium', color: '#F0B90B' },
            { key: 'high', label: 'High Risk', color: '#CF304A' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setRiskFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${riskFilter === f.key ? 'bg-[#1E2329] border-[#F0B90B] text-white' : 'border-[#2B3139] text-[#848E9C] hover:border-[#F0B90B]/50 hover:text-white'}`}
              style={riskFilter === f.key ? { borderColor: f.color, color: f.color } : undefined}
            >
              <Filter className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#848E9C] mb-4 font-medium">
        {filtered.length} of {allStrategies.length} strategies shown
      </p>

      {/* Strategy Grid */}
      {filtered.length === 0 ? (
        <div className="card-stealth p-16 text-center">
          <TrendingUp className="w-16 h-16 text-[#2B3139] mx-auto mb-4" />
          <p className="text-[#848E9C] font-medium">No strategies found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((s: any) => {
            const isActive = s.id === currentStrategyId;
            const RiskIcon = RISK_ICONS[s.riskProfile] || Target;
            const isLoading = activating === s.id;
            const isRazr = isRazrName(s.name);
            const dailyRate = getDailyRate(s.name);
            const monthlyRate = parseFloat(s.monthlyReturn ?? 0);
            const btn = getButtonState(s);
            const BtnIcon = btn.icon;

            // RazrMarket min balance check for badge/info
            const razrBalanceLocked = isRazr && !kycApproved === false && kycApproved && balance < RAZR_MIN_BALANCE;

            return (
              <div
                key={s.id}
                className={`card-stealth p-6 relative overflow-hidden transition-all duration-300 flex flex-col ${isActive ? 'border-[#F0B90B]/60 shadow-[0_0_20px_rgba(240,185,11,0.15)]' : 'hover:border-[#F0B90B]/30'}`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0B90B]/20 border border-[#F0B90B]/40">
                    <CheckCircle className="w-3.5 h-3.5 text-[#F0B90B]" />
                    <span className="text-[#F0B90B] text-xs font-bold">ACTIVE</span>
                  </div>
                )}
                {isRazr && !isActive && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#F0B90B] text-black text-[9px] font-black uppercase tracking-wide">FLAGSHIP</div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: RISK_BG[s.riskProfile], border: `1px solid ${RISK_COLORS[s.riskProfile]}40` }}>
                    <RiskIcon className="w-5 h-5" style={{ color: RISK_COLORS[s.riskProfile] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold capitalize px-2 py-0.5 rounded" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile} risk</span>
                      <span className="text-xs text-[#848E9C]">{s.markets}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#848E9C] mb-4 leading-relaxed flex-1">{s.description}</p>

                {/* ROI Banner */}
                <div className={`rounded-xl p-3 mb-4 border flex items-center justify-between ${isRazr ? 'bg-[#02C076]/10 border-[#02C076]/30' : 'bg-[#F0B90B]/10 border-[#F0B90B]/30'}`}>
                  <div className="text-center">
                    <p className={`text-lg font-black tabular-nums ${isRazr ? 'text-[#02C076]' : 'text-[#F0B90B]'}`}>+{dailyRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-[#848E9C]">Daily ROI</p>
                  </div>
                  <div className="text-[#2B3139] text-lg">→</div>
                  <div className="text-center">
                    <p className="text-lg font-black text-[#02C076] tabular-nums">+{monthlyRate.toFixed(2)}%</p>
                    <p className="text-[10px] text-[#848E9C]">Monthly</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#0B0E11] rounded-xl p-3 text-center border border-[#2B3139]">
                    <p className="text-base font-bold text-[#F0B90B]">{s.winRate}%</p>
                    <p className="text-[10px] text-[#848E9C] mt-0.5">Win Rate</p>
                  </div>
                  <div className="bg-[#0B0E11] rounded-xl p-3 text-center border border-[#2B3139]">
                    <p className="text-base font-bold text-[#CF304A]">{s.maxDrawdown}%</p>
                    <p className="text-[10px] text-[#848E9C] mt-0.5">Max Drawdown</p>
                  </div>
                </div>

                {/* Min Capital / RazrMarket requirement row */}
                <div className="flex items-center justify-between mb-4 text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-[#848E9C]">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Min Capital: <span className="font-bold text-[#EAECEF]">₹{Number(s.minCapital).toLocaleString('en-IN')}</span></span>
                  </div>
                  {isRazr && (
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${balance >= RAZR_MIN_BALANCE ? 'bg-[#02C076]/15 text-[#02C076] border-[#02C076]/30' : 'bg-[#CF304A]/15 text-[#CF304A] border-[#CF304A]/30'}`}>
                      Min. Req: ₹{RAZR_MIN_BALANCE.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {isActive ? (
                  <button className="w-full py-3 rounded-xl bg-[#F0B90B]/20 border border-[#F0B90B]/40 text-[#F0B90B] font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                    <CheckCircle className="w-4 h-4" /> Currently Active
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (btn.locked) {
                        if (!kycApproved) {
                          toast({ title: 'KYC Required', description: 'Please complete your KYC verification before activating a strategy.', variant: 'destructive' });
                        } else if (razrBalanceLocked || (isRazr && balance < RAZR_MIN_BALANCE)) {
                          toast({ title: 'Insufficient Funds', description: `A minimum balance of ₹${RAZR_MIN_BALANCE.toLocaleString('en-IN')} is required to activate the RazrMarket Strategy. Please deposit funds to continue.`, variant: 'destructive' });
                        }
                        return;
                      }
                      setActivating(s.id);
                      selectMutation.mutate({ data: { strategyId: s.id } } as any);
                    }}
                    disabled={isLoading}
                    className={btn.className}
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
