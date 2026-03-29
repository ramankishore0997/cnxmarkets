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
  ShieldCheck, ChevronRight, Building2, AlertTriangle,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    approved: { icon: CheckCircle, color: '#16A34A' },
    pending:  { icon: Clock,        color: '#1F77B4' },
    rejected: { icon: XCircle,      color: '#DC2626' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ background: `${s.color}20`, color: s.color }}>
      <s.icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

/* ── Notice Modal (bank→USDT redirect) ──────────────────── */
function NoticeModal({
  open, onClose, onProceedUsdt,
}: {
  open: boolean;
  onClose: () => void;
  onProceedUsdt: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,165,0,0.2)', boxShadow: '0 0 60px rgba(255,140,0,0.08)' }}>

        {/* Top accent */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />

        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Bank Withdrawal Unavailable</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Temporarily suspended</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[#4B5563] hover:text-white hover:bg-white/[0.06] transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Main message */}
          <div className="p-4 rounded-xl space-y-2"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[#111827] font-semibold text-sm leading-relaxed">
              Currently, withdrawals are only available via <span className="text-[#1F77B4]">USDT TRC20 network</span>.
            </p>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Bank transfers are temporarily unavailable. You can withdraw your funds by providing your USDT TRC20 wallet address.
            </p>
          </div>

          {/* USDT badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(31,119,180,0.06)', border: '1px solid rgba(31,119,180,0.15)' }}>
            <Wallet className="w-4 h-4 text-[#1F77B4] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#1F77B4] uppercase tracking-wide">Available Method</p>
              <p className="text-sm font-semibold text-[#111827]">USDT TRC20 Network</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Close
          </button>
          <button
            onClick={onProceedUsdt}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all"
            style={{ background: 'linear-gradient(135deg, #1F77B4, #155D8B)', boxShadow: '0 4px 20px rgba(31,119,180,0.3)' }}>
            <Wallet className="w-4 h-4" />
            Withdraw via USDT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── USDT Address Modal ──────────────────────────────────── */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 60px rgba(31,119,180,0.12)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.25)' }}>
              <Wallet className="w-5 h-5 text-[#1F77B4]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Withdrawal via USDT TRC20</h3>
              <p className="text-xs text-[#6B7280]">Enter your USDT wallet address</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[#4B5563] hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Amount row */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm text-[#6B7280] font-medium">Withdrawal Amount</span>
            <span className="text-lg font-black text-[#1F77B4]">₹{amount.toLocaleString('en-IN')}</span>
          </div>

          {/* Platform USDT Address */}
          {platformAddress && (
            <div>
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-[0.1em] mb-2">
                Platform USDT TRC20 Address
              </label>
              <div className="flex items-center gap-2 p-3.5 rounded-xl"
                style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.06)' }}>
                <ShieldCheck className="w-4 h-4 text-[#1F77B4] shrink-0" />
                <code className="font-mono text-xs text-[#9CA3AF] flex-1 break-all leading-relaxed">
                  {platformAddress}
                </code>
                <button onClick={handleCopy}
                  className="p-1.5 rounded-lg shrink-0 transition-all"
                  style={{ color: copied ? '#1F77B4' : '#4B5563' }}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#4B5563] mt-1.5">Platform address — for reference only.</p>
            </div>
          )}

          {/* User USDT Address */}
          <div>
            <label className="block text-sm font-semibold text-[#9CA3AF] mb-2">
              Your USDT TRC20 Address <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              value={usdtAddr}
              onChange={(e) => setUsdtAddr(e.target.value)}
              placeholder="Enter your USDT TRC20 wallet address (starts with T...)"
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-[#1F77B4]/50 text-[#111827] placeholder-[#9CA3AF] bg-white border border-[#E5E7EB]"
              style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <p className="text-[11px] text-[#DC2626]/80 mt-1.5">
              ⚠ Double-check your address — incorrect addresses result in permanent loss of funds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Cancel
          </button>
          <button
            onClick={() => { const a = usdtAddr.trim(); if (a.length >= 10) onConfirm(a); }}
            disabled={loading || usdtAddr.trim().length < 10}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #1F77B4, #155D8B)', boxShadow: '0 4px 20px rgba(31,119,180,0.3)' }}>
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
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [usdtOpen, setUsdtOpen] = useState(false);
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

  /* Bank form schema */
  const schema = z.object({
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    bankName:          z.string().min(2, 'Bank name is required'),
    accountNumber:     z.string().min(6, 'Account number is required'),
    ifscCode:          z.string().min(4, 'IFSC code is required'),
    amount: z.coerce.number()
      .min(1000, 'Minimum withdrawal is ₹1,000')
      .max(liveBalance > 0 ? liveBalance : 1, `Cannot exceed ₹${liveBalance.toLocaleString('en-IN')}`),
  });
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', amount: 1000 },
  });

  const { data: transactions, isLoading: txLoading, refetch } = useGetTransactions({ ...getAuthOptions() });
  const withdrawals = (transactions as any[])?.filter((t: any) => t.type === 'withdrawal') || [];

  /* withdraw mutation (USDT) */
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
      setUsdtOpen(false);
      setNoticeOpen(false);
      setSubmitted(true);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
    },
    onError: (err: any) => {
      toast({ title: 'Request Failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  /* Bank form submit → show notice popup */
  const onBankSubmit = (data: FormData) => {
    setPendingAmount(data.amount);
    setNoticeOpen(true);
  };

  /* User clicked "Withdraw via USDT" in notice */
  const onProceedUsdt = () => {
    setNoticeOpen(false);
    setUsdtOpen(true);
  };

  const onConfirmUsdt = (usdtAddress: string) => {
    withdrawMutation.mutate({ amount: pendingAmount, usdtAddress });
  };

  return (
    <DashboardLayout>
      {/* Notice Modal */}
      <NoticeModal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        onProceedUsdt={onProceedUsdt}
      />

      {/* USDT Address Modal */}
      <UsdtModal
        open={usdtOpen}
        onClose={() => setUsdtOpen(false)}
        amount={pendingAmount}
        platformAddress={platformAddress}
        onConfirm={onConfirmUsdt}
        loading={withdrawMutation.isPending}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Withdraw Funds</h1>
        <p className="text-[#6B7280] font-medium">Submit a bank transfer withdrawal request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Form */}
        <div className="lg:col-span-2 card-stealth p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-24 h-24 rounded-full bg-[#16A34A]/20 border-2 border-[#16A34A]/40 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-[#16A34A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-3">Withdrawal Request Submitted!</h3>
              <p className="text-[#6B7280] max-w-md leading-relaxed">
                Your request is under manual verification. Once approved, the USDT will be sent to your wallet address within <span className="text-[#111827] font-semibold">24–48 hours</span>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 px-6 py-3 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB] text-[#6B7280] hover:text-white hover:border-[#1F77B4]/40 transition-colors text-sm font-semibold">
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1F77B4]" /> Bank Transfer Details
              </h3>

              <form onSubmit={form.handleSubmit(onBankSubmit)} className="space-y-5">
                {/* Account Holder + Bank Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#6B7280]">Account Holder Name</label>
                    <input
                      {...form.register('accountHolderName')}
                      placeholder="Full legal name"
                      className="input-stealth"
                    />
                    {form.formState.errors.accountHolderName && (
                      <p className="text-xs text-[#DC2626]">{form.formState.errors.accountHolderName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#6B7280]">Bank Name</label>
                    <input
                      {...form.register('bankName')}
                      placeholder="e.g. HDFC Bank, SBI"
                      className="input-stealth"
                    />
                    {form.formState.errors.bankName && (
                      <p className="text-xs text-[#DC2626]">{form.formState.errors.bankName.message}</p>
                    )}
                  </div>
                </div>

                {/* Account Number + IFSC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#6B7280]">Account Number</label>
                    <input
                      {...form.register('accountNumber')}
                      type="number"
                      placeholder="Enter account number"
                      className="input-stealth"
                    />
                    {form.formState.errors.accountNumber && (
                      <p className="text-xs text-[#DC2626]">{form.formState.errors.accountNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#6B7280]">IFSC Code</label>
                    <input
                      {...form.register('ifscCode')}
                      placeholder="e.g. HDFC0001234"
                      className="input-stealth uppercase"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        form.setValue('ifscCode', e.target.value);
                      }}
                    />
                    {form.formState.errors.ifscCode && (
                      <p className="text-xs text-[#DC2626]">{form.formState.errors.ifscCode.message}</p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6B7280] flex items-center justify-between">
                    <span>Withdrawal Amount (INR)</span>
                    <span className="text-[#16A34A] font-bold">
                      Live Balance: ₹{liveBalance.toLocaleString('en-IN')}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-sm">₹</span>
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
                    <p className="text-xs text-[#DC2626]">{form.formState.errors.amount.message}</p>
                  )}
                  <p className="text-xs text-[#6B7280]">Min: ₹1,000 &nbsp;•&nbsp; Max: ₹{liveBalance.toLocaleString('en-IN')} (your balance)</p>
                </div>

                <button
                  type="submit"
                  disabled={liveBalance < 1000}
                  className="w-full btn-gold text-base flex justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  Submit Withdrawal
                </button>

                {liveBalance < 1000 && (
                  <p className="text-center text-xs text-[#DC2626] font-medium">
                    Insufficient balance — minimum withdrawal is ₹1,000
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-5">
          <div className="card-stealth p-6 border-l-4 border-l-[#16A34A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#16A34A]" />
              </div>
              <h3 className="font-bold text-[#111827]">Live Balance</h3>
            </div>
            <p className="text-3xl font-black text-[#16A34A]">₹{liveBalance.toLocaleString('en-IN')}</p>
            <p className="text-xs text-[#6B7280] mt-1">Available to withdraw</p>
          </div>

          <div className="card-stealth p-6 border-l-4 border-l-[#1F77B4]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1F77B4]/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#1F77B4]" />
              </div>
              <h3 className="font-bold text-[#111827]">Processing Info</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Processing Time', value: '24–48 hours' },
                { label: 'Minimum Amount', value: '₹1,000' },
                { label: 'Currency',        value: 'INR' },
                { label: 'Method',          value: 'Bank Transfer' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#6B7280]">{label}</span>
                  <span className="text-[#111827] font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-stealth p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#1F77B4] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#111827] font-bold text-sm mb-2">Important</p>
                <ul className="text-[#6B7280] text-xs space-y-1.5 leading-relaxed">
                  <li>• Withdrawals are processed to verified accounts only</li>
                  <li>• Ensure bank details are accurate — errors cause delays</li>
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
          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#1F77B4]" /> Withdrawal History
          </h3>
          <span className="text-[#6B7280] text-sm">{withdrawals.length} request{withdrawals.length !== 1 ? 's' : ''}</span>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#1F77B4]" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <ArrowUpRight className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#6B7280] font-medium">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Date', 'Amount', 'USDT Address', 'Status'].map((h) => (
                    <th key={h} className="pb-4 text-left text-[#6B7280] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {withdrawals.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#FFFFFF]/40 transition-colors">
                    <td className="py-4 pr-6 text-[#6B7280] text-sm whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 pr-6 font-bold text-[#111827] whitespace-nowrap">
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 pr-6 max-w-[240px]">
                      {tx.usdtAddress ? (
                        <div className="flex items-start gap-2">
                          <code className="font-mono text-xs text-[#9CA3AF] bg-[#FFFFFF] px-2 py-1.5 rounded-lg border border-white/[0.06] break-all leading-relaxed">
                            {tx.usdtAddress}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(tx.usdtAddress)}
                            className="text-[#4B5563] hover:text-[#1F77B4] transition-colors shrink-0 mt-1"
                            title="Copy full address">
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
