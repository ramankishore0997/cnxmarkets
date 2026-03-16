import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubmitWithdrawal, useGetTransactions } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, Loader2, Banknote, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const schema = z.object({
  amount: z.coerce.number().min(100, "Minimum withdrawal is $100"),
  currency: z.string().min(1),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(6, "Account number is required"),
  ifscCode: z.string().min(4, "SWIFT / IFSC code is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; color: string; bg: string }> = {
    approved: { icon: CheckCircle, color: '#02C076', bg: '#02C076' },
    pending: { icon: Clock, color: '#F0B90B', bg: '#F0B90B' },
    rejected: { icon: XCircle, color: '#CF304A', bg: '#CF304A' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${s.bg}20`, color: s.color }}>
      <s.icon className="w-3 h-3" /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Withdraw() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 500, currency: 'USD', bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '' }
  });

  const { data: transactions, isLoading: txLoading } = useGetTransactions({ ...getAuthOptions() });
  const withdrawals = (transactions as any[])?.filter((t: any) => t.type === 'withdrawal') || [];

  const withdrawMutation = useSubmitWithdrawal({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal Requested", description: "Your withdrawal request is pending review." });
        form.reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      },
      onError: (err: any) => {
        toast({ title: "Request Failed", description: err?.message || "Please try again.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: FormData) => {
    withdrawMutation.mutate({ data });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-[#848E9C] font-medium">Submit a withdrawal request to your registered bank account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Form */}
        <div className="lg:col-span-2 card-stealth p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#02C076]/20 border border-[#02C076]/40 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[#02C076]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted</h3>
              <p className="text-[#848E9C] max-w-sm">Your withdrawal request is under review. Processing typically takes 24–48 hours.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#F0B90B]" /> Withdrawal Details
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-[#848E9C] font-medium">$</span>
                      <input {...form.register('amount')} type="number" className="input-stealth pl-8" />
                    </div>
                    {form.formState.errors.amount && <p className="text-xs text-[#CF304A]">{form.formState.errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Currency</label>
                    <select {...form.register('currency')} className="input-stealth appearance-none">
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-[#2B3139] pt-5">
                  <p className="text-sm font-bold text-white mb-4">Bank Account Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#848E9C]">Account Holder Name</label>
                      <input {...form.register('accountHolderName')} placeholder="Full legal name" className="input-stealth" />
                      {form.formState.errors.accountHolderName && <p className="text-xs text-[#CF304A]">{form.formState.errors.accountHolderName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#848E9C]">Bank Name</label>
                      <input {...form.register('bankName')} placeholder="e.g. HDFC Bank" className="input-stealth" />
                      {form.formState.errors.bankName && <p className="text-xs text-[#CF304A]">{form.formState.errors.bankName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#848E9C]">Account Number</label>
                      <input {...form.register('accountNumber')} placeholder="Account number" className="input-stealth" />
                      {form.formState.errors.accountNumber && <p className="text-xs text-[#CF304A]">{form.formState.errors.accountNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#848E9C]">SWIFT / IFSC Code</label>
                      <input {...form.register('ifscCode')} placeholder="e.g. HDFC0001234" className="input-stealth" />
                      {form.formState.errors.ifscCode && <p className="text-xs text-[#CF304A]">{form.formState.errors.ifscCode.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Notes (Optional)</label>
                  <input {...form.register('notes')} placeholder="Any additional information" className="input-stealth" />
                </div>

                <button type="submit" disabled={withdrawMutation.isPending} className="w-full btn-gold text-base flex justify-center mt-2">
                  {withdrawMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Withdrawal Request'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-5">
          <div className="card-stealth p-6 border-l-4 border-l-[#F0B90B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#F0B90B]" />
              </div>
              <h3 className="font-bold text-white">Processing Times</h3>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { tier: 'Starter', time: '24 hours' },
                { tier: 'Professional', time: '4 hours' },
                { tier: 'Institutional', time: 'Instant' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[#848E9C]">{item.tier}</span>
                  <span className="text-white font-semibold">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-stealth p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-sm mb-2">Important</p>
                <ul className="text-[#848E9C] text-xs space-y-1.5 leading-relaxed">
                  <li>• Withdrawals are only processed to verified accounts in your name</li>
                  <li>• Minimum withdrawal amount is $100</li>
                  <li>• Requests are reviewed before processing</li>
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
          <h3 className="text-lg font-bold text-white">Withdrawal History</h3>
          <span className="text-[#848E9C] text-sm">{withdrawals.length} request{withdrawals.length !== 1 ? 's' : ''}</span>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#F0B90B]" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <ArrowUpRight className="w-12 h-12 text-[#2B3139] mx-auto mb-4" />
            <p className="text-[#848E9C] font-medium">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  {['Date', 'Amount', 'Currency', 'Status', 'Reference'].map((h) => (
                    <th key={h} className="pb-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {withdrawals.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#0B0E11]/40 transition-colors">
                    <td className="py-4 pr-6 text-[#848E9C] text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 pr-6 font-bold text-white">${Number(tx.amount).toLocaleString()}</td>
                    <td className="py-4 pr-6 text-[#EAECEF]">{tx.currency || 'USD'}</td>
                    <td className="py-4 pr-6"><StatusBadge status={tx.status} /></td>
                    <td className="py-4 text-[#848E9C] font-mono text-xs">{tx.transactionReference || '—'}</td>
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
