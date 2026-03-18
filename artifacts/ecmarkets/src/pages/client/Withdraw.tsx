import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubmitWithdrawal, useGetTransactions, useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, Loader2, Banknote, CheckCircle, Clock, XCircle, AlertCircle, Building2, CreditCard, Hash } from 'lucide-react';

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

export function Withdraw() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: dashData } = useGetDashboard({ ...getAuthOptions() });
  const liveBalance: number = (dashData as any)?.totalBalance ?? 0;

  const schema = z.object({
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    bankName:          z.string().min(2, 'Bank name is required'),
    accountNumber:     z.string().min(6, 'Account number is required'),
    ifscCode:          z.string().min(4, 'IFSC code is required'),
    amount: z.coerce.number()
      .min(1000, 'Minimum withdrawal is ₹1,000')
      .max(liveBalance > 0 ? liveBalance : 1, `Cannot exceed your live balance of ₹${liveBalance.toLocaleString('en-IN')}`),
  });
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', amount: 1000 },
  });

  const { data: transactions, isLoading: txLoading, refetch } = useGetTransactions({ ...getAuthOptions() });
  const withdrawals = (transactions as any[])?.filter((t: any) => t.type === 'withdrawal') || [];

  const withdrawMutation = useSubmitWithdrawal({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        refetch();
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: 'Request Failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });
      },
    },
  });

  const onSubmit = (data: FormData) => {
    withdrawMutation.mutate({
      data: {
        amount: data.amount,
        currency: 'INR',
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode.toUpperCase(),
        accountHolderName: data.accountHolderName,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-[#848E9C] font-medium">Submit a bank transfer withdrawal request</p>
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
                Your request is under manual verification. Once approved, the funds will be transferred to your bank account within <span className="text-white font-semibold">24–48 hours</span>.
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
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00C274]" /> Bank Transfer Details
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Account Holder + Bank Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Account Holder Name</label>
                    <input
                      {...form.register('accountHolderName')}
                      placeholder="Full legal name"
                      className="input-stealth"
                    />
                    {form.formState.errors.accountHolderName && (
                      <p className="text-xs text-[#CF304A]">{form.formState.errors.accountHolderName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Bank Name</label>
                    <input
                      {...form.register('bankName')}
                      placeholder="e.g. HDFC Bank, SBI"
                      className="input-stealth"
                    />
                    {form.formState.errors.bankName && (
                      <p className="text-xs text-[#CF304A]">{form.formState.errors.bankName.message}</p>
                    )}
                  </div>
                </div>

                {/* Account Number + IFSC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Account Number</label>
                    <input
                      {...form.register('accountNumber')}
                      type="number"
                      placeholder="Enter account number"
                      className="input-stealth"
                    />
                    {form.formState.errors.accountNumber && (
                      <p className="text-xs text-[#CF304A]">{form.formState.errors.accountNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">IFSC Code</label>
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
                      <p className="text-xs text-[#CF304A]">{form.formState.errors.ifscCode.message}</p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C] flex items-center justify-between">
                    <span>Withdrawal Amount (INR)</span>
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
                  disabled={withdrawMutation.isPending || liveBalance < 1000}
                  className="w-full btn-gold text-base flex justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawMutation.isPending
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : 'Submit Withdrawal'}
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
                <Banknote className="w-5 h-5 text-[#00C274]" />
              </div>
              <h3 className="font-bold text-white">Processing Info</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Processing Time', value: '24–48 hours' },
                { label: 'Minimum Amount', value: '₹1,000' },
                { label: 'Currency', value: 'INR only' },
                { label: 'Method', value: 'Bank Transfer' },
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
                  {['Date', 'Amount', 'Bank', 'Account No.', 'IFSC', 'Status'].map((h) => (
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
                    <td className="py-4 pr-6 text-[#EAECEF]">{tx.bankName || '—'}</td>
                    <td className="py-4 pr-6 font-mono text-xs text-[#EAECEF]">{tx.accountNumber || '—'}</td>
                    <td className="py-4 pr-6 font-mono text-xs text-[#EAECEF] uppercase">{tx.ifscCode || '—'}</td>
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
