import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetTransactions, useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight, Loader2, CheckCircle, Clock, XCircle,
  AlertCircle, CreditCard, Hash, Copy, X, Wallet,
  ShieldCheck, ChevronRight,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    approved: { icon: CheckCircle, color: '#02C076' },
    pending:  { icon: Clock,        color: '#00C274' },
    rejected: { icon: XCircle,      color: '#CF304A' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${s.color}20`, color: s.color }}>
      <s.icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

/* ── USDT Modal ─────────────────────────────────────────── */
function UsdtModal({
  open, onClose, amount, platformAddress, onConfirm, loading,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  platformAddress: string;
  onConfirm: (usdtAddress: string) => void;
  loading: boolean;
}) {
  const [usdtAddr, setUsdtAddr] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!platformAddress) return;
    try {
      await navigator.clipboard.writeText(platformAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#0C0E15', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 60px rgba(0,194,116,0.12)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,194,116,0.15)', border: '1px solid rgba(0,194,116,0.25)' }}>
              <Wallet className="w-5 h-5 text-[#00C274]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Withdrawal via USDT TRC20</h3>
              <p className="text-xs text-[#6B7280]">Enter your USDT wallet address</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#4B5563] hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Notice banner */}
          <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,194,116,0.06)', border: '1px solid rgba(0,194,116,0.15)' }}>
            <AlertCircle className="w-4 h-4 text-[#00C274] shrink-0 mt-0.5" />
            <div className="text-sm text-[#9CA3AF] leading-relaxed">
              <p className="text-[#F8FAFC] font-semibold mb-1">Withdrawals only via USDT TRC20</p>
              <p>Bank transfers are not currently supported. Funds will be sent to your USDT TRC20 wallet address after admin approval.</p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#060709', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm text-[#6B7280] font-medium">Withdrawal Amount</span>
            <span className="text-lg font-black text-[#00C274]">₹{amount.toLocaleString('en-IN')}</span>
          </div>

          {/* Platform USDT Address */}
          {platformAddress && (
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-[0.1em] mb-2">
                Platform USDT TRC20 Address
              </label>
              <div className="flex items-center gap-2 p-3.5 rounded-xl" style={{ background: '#060709', border: '1px solid rgba(255,255,255,0.06)' }}>
                <ShieldCheck className="w-4 h-4 text-[#00C274] shrink-0" />
                <code className="font-mono text-xs text-[#9CA3AF] flex-1 break-all leading-relaxed">{platformAddress}</code>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg shrink-0 transition-all"
                  style={{ color: copied ? '#00C274' : '#4B5563' }}
                  title="Copy address"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#4B5563] mt-1.5">This is the platform address for reference only.</p>
            </div>
          )}

          {/* User's USDT Address Input */}
          <div>
            <label className="block text-sm font-semibold text-[#9CA3AF] mb-2">
              Your USDT TRC20 Address <span className="text-[#CF304A]">*</span>
            </label>
            <textarea
              value={usdtAddr}
              onChange={(e) => setUsdtAddr(e.target.value)}
              placeholder="Enter your USDT TRC20 wallet address (starts with T...)"
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-[#00C274]/50 text-white placeholder-[#374151]"
              style={{ background: '#060709', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <p className="text-[11px] text-[#4B5563] mt-1.5">Double-check your address — incorrect addresses may result in permanent loss of funds.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const addr = usdtAddr.trim();
              if (addr.length < 10) return;
              onConfirm(addr);
            }}
            disabled={loading || usdtAddr.trim().length < 10}
            className="flex-2 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #00C274, #00A85E)', boxShadow: '0 4px 20px rgba(0,194,116,0.3)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Confirm Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function Withdraw() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  const { data: dashData } = useGetDashboard({ ...getAuthOptions() });
  const liveBalance: number = (dashData as any)?.totalBalance ?? 0;

  /* fetch platform USDT address */
  const { data: usdtData } = useQuery({
    queryKey: ['usdt-address'],
    queryFn: () => fetch('/api/transactions/usdt-address').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const platformAddress: string = (usdtData as any)?.address || '';

  const schema = z.object({
    amount: z.coerce.number()
      .min(1000, 'Minimum withdrawal is ₹1,000')
      .max(liveBalance > 0 ? liveBalance : 1, `Cannot exceed your live balance of ₹${liveBalance.toLocaleString('en-IN')}`),
  });
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 1000 },
  });

  const { data: transactions, isLoading: txLoading, refetch } = useGetTransactions({ ...getAuthOptions() });
  const withdrawals = (transactions as any[])?.filter((t: any) => t.type === 'withdrawal') || [];

  /* withdraw mutation */
  const withdrawMutation = useMutation({
    mutationFn: (body: { amount: number; usdtAddress: string }) => {
      const token = localStorage.getItem('ecm_token');
      return fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }).then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Request failed');
        return data;
      });
    },
    onSuccess: () => {
      setModalOpen(false);
      setSubmitted(true);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
    },
    onError: (err: any) => {
      toast({ title: 'Request Failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  const onFormSubmit = (data: FormData) => {
    setPendingAmount(data.amount);
    setModalOpen(true);
  };

  const onConfirmUsdt = (usdtAddress: string) => {
    withdrawMutation.mutate({ amount: pendingAmount, usdtAddress });
  };

  return (
    <DashboardLayout>
      {/* USDT Modal */}
      <UsdtModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={pendingAmount}
        platformAddress={platformAddress}
        onConfirm={onConfirmUsdt}
        loading={withdrawMutation.isPending}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-[#848E9C] font-medium">Submit a USDT TRC20 withdrawal request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Form */}
        <div className="lg:col-span-2 card-stealth p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-24 h-24 rounded-full bg-[#02C076]/20 border-2 border-[#02C076]/40 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-[#02C076]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Withdrawal Request Submitted!</h3>
              <p className="text-[#848E9C] max-w-md leading-relaxed">
                Your request is under manual verification. Once approved, the USDT will be sent to your wallet address within <span className="text-white font-semibold">24–48 hours</span>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 px-6 py-3 rounded-xl bg-[#1E2329] border border-[#181B23] text-[#848E9C] hover:text-white hover:border-[#00C274]/40 transition-colors text-sm font-semibold"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              {/* USDT notice */}
              <div className="flex gap-3 p-4 rounded-xl mb-6" style={{ background: 'rgba(0,194,116,0.06)', border: '1px solid rgba(0,194,116,0.18)' }}>
                <Wallet className="w-4 h-4 text-[#00C274] shrink-0 mt-0.5" />
                <div className="text-sm text-[#9CA3AF]">
                  <p className="text-white font-bold mb-0.5">USDT TRC20 Only</p>
                  <p>All withdrawals are processed via USDT TRC20 network. Please have your TRC20 wallet address ready before submitting.</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#00C274]" /> Withdrawal Amount
              </h3>

              <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C] flex items-center justify-between">
                    <span>Amount (INR)</span>
                    <span className="text-[#02C076] font-bold">
                      Live Balance: ₹{liveBalance.toLocaleString('en-IN')}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#848E9C] font-semibold text-sm">₹</span>
                    <input
                      {...form.register('amount')}
                      type="number"
                      min={1000}
                      max={liveBalance}
                      step={100}
                      placeholder="Minimum ₹1,000"
                      className="input-stealth pl-8"
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-xs text-[#CF304A]">{form.formState.errors.amount.message}</p>
                  )}
                  <p className="text-xs text-[#848E9C]">Min: ₹1,000 &nbsp;•&nbsp; Max: ₹{liveBalance.toLocaleString('en-IN')} (your balance)</p>
                </div>

                <button
                  type="submit"
                  disabled={liveBalance < 1000}
                  className="w-full btn-gold text-base flex justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Withdraw
                </button>

                {liveBalance < 1000 && (
                  <p className="text-center text-xs text-[#CF304A] font-medium">
                    Insufficient balance — minimum withdrawal is ₹1,000
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-5">
          {/* Balance Card */}
          <div className="card-stealth p-6 border-l-4 border-l-[#02C076]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#02C076]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#02C076]" />
              </div>
              <h3 className="font-bold text-white">Live Balance</h3>
            </div>
            <p className="text-3xl font-black text-[#02C076]">
              ₹{liveBalance.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#848E9C] mt-1">Available to withdraw</p>
          </div>

          {/* Info */}
          <div className="card-stealth p-6 border-l-4 border-l-[#00C274]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00C274]/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#00C274]" />
              </div>
              <h3 className="font-bold text-white">Processing Info</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Processing Time', value: '24–48 hours' },
                { label: 'Minimum Amount', value: '₹1,000' },
                { label: 'Network',         value: 'USDT TRC20' },
                { label: 'Method',          value: 'Crypto Wallet' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#848E9C]">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="card-stealth p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#00C274] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-sm mb-2">Important</p>
                <ul className="text-[#848E9C] text-xs space-y-1.5 leading-relaxed">
                  <li>• Only TRC20 network addresses accepted</li>
                  <li>• Wrong network address = permanent loss</li>
                  <li>• Requests require manual admin approval</li>
                  <li>• You will be notified once processed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="card-stealth p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#00C274]" /> Withdrawal History
          </h3>
          <span className="text-[#848E9C] text-sm">{withdrawals.length} request{withdrawals.length !== 1 ? 's' : ''}</span>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#00C274]" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <ArrowUpRight className="w-12 h-12 text-[#181B23] mx-auto mb-4" />
            <p className="text-[#848E9C] font-medium">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#181B23]">
                  {['Date', 'Amount', 'USDT Address', 'Status'].map((h) => (
                    <th key={h} className="pb-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181B23]">
                {withdrawals.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#060709]/40 transition-colors">
                    <td className="py-4 pr-6 text-[#848E9C] text-sm whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 pr-6 font-bold text-white whitespace-nowrap">
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 pr-6">
                      {tx.usdtAddress ? (
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-[#9CA3AF] bg-[#0C0E15] px-2 py-1 rounded-lg border border-white/[0.06]">
                            {shortAddr(tx.usdtAddress)}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(tx.usdtAddress)}
                            className="text-[#4B5563] hover:text-[#00C274] transition-colors"
                            title="Copy full address"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#4B5563]">—</span>
                      )}
                    </td>
                    <td className="py-4"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
