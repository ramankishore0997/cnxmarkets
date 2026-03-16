import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubmitDeposit, useGetTransactions } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { Building2, Copy, CheckCircle2, Loader2, CheckCircle, Clock, XCircle, ArrowDownLeft } from 'lucide-react';

const schema = z.object({
  amount: z.coerce.number().min(100, "Minimum deposit is $100"),
  currency: z.string().min(1, "Currency is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionReference: z.string().optional(),
});

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

export function Deposit() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data: transactions, isLoading: txLoading } = useGetTransactions({ ...getAuthOptions() });
  const deposits = (transactions as any[])?.filter((t: any) => t.type === 'deposit') || [];
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 1000, currency: 'USD', paymentMethod: 'bank_transfer' }
  });

  const depositMutation = useSubmitDeposit({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Request Submitted", description: "Your deposit request is pending approval." });
        form.reset();
      }
    }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    depositMutation.mutate({ data });
  };

  const copyBankDetails = () => {
    navigator.clipboard.writeText("ECM INTL CORP\nACC: 8934578923\nSWIFT: ECMBXXX");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fund Account</h1>
        <p className="text-[#848E9C] font-medium">Add capital to start allocating to strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-stealth p-8">
          <h3 className="text-xl font-bold text-white mb-6">Deposit Details</h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#848E9C]">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[#848E9C] font-medium">$</span>
                  <input 
                    {...form.register('amount')}
                    type="number" 
                    className="input-stealth pl-8"
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-[#CF304A]">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#848E9C]">Currency</label>
                <select 
                  {...form.register('currency')}
                  className="input-stealth appearance-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#848E9C]">Payment Method</label>
              <select 
                {...form.register('paymentMethod')}
                className="input-stealth appearance-none"
              >
                <option value="bank_transfer">Wire / Bank Transfer</option>
                <option value="crypto">Cryptocurrency (USDT/USDC)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#848E9C]">Transaction Reference (Optional)</label>
              <input 
                {...form.register('transactionReference')}
                type="text" 
                placeholder="Reference number after transfer"
                className="input-stealth"
              />
            </div>

            <button 
              type="submit" 
              disabled={depositMutation.isPending}
              className="w-full btn-gold text-lg flex justify-center mt-2"
            >
              {depositMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E2329] border border-[#F0B90B]/30 p-8 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="w-12 h-12 rounded-xl bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6 text-[#F0B90B]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Wire Instructions</h3>
            <p className="text-sm text-[#848E9C] mb-6">Please send funds to the following institutional account.</p>
            
            <div className="bg-[#0B0E11] border border-[#2B3139] p-5 rounded-lg relative group">
              <pre className="text-sm text-[#EAECEF] font-mono whitespace-pre-wrap leading-loose">
                <span className="text-[#848E9C] font-sans font-semibold text-xs uppercase tracking-wider">Bank</span><br />ECM INTL CORP{'\n'}
                <span className="text-[#848E9C] font-sans font-semibold text-xs uppercase tracking-wider">Account</span><br />8934578923{'\n'}
                <span className="text-[#848E9C] font-sans font-semibold text-xs uppercase tracking-wider">SWIFT</span><br />ECMBXXX{'\n'}
                <span className="text-[#848E9C] font-sans font-semibold text-xs uppercase tracking-wider">Ref</span><br />Include your email
              </pre>
              <button 
                onClick={copyBankDetails}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#1E2329] hover:bg-[#2B3139] text-[#EAECEF] transition-colors border border-[#2B3139]"
                title="Copy details"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-[#02C076]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      <div className="card-stealth p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Deposit History</h3>
          <span className="text-[#848E9C] text-sm">{deposits.length} request{deposits.length !== 1 ? 's' : ''}</span>
        </div>
        {txLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#F0B90B]" /></div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownLeft className="w-12 h-12 text-[#2B3139] mx-auto mb-4" />
            <p className="text-[#848E9C] font-medium">No deposits yet. Submit your first request above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  {['Date', 'Amount', 'Currency', 'Method', 'Status', 'Reference'].map((h) => (
                    <th key={h} className="pb-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {deposits.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#0B0E11]/40 transition-colors">
                    <td className="py-4 pr-6 text-[#848E9C] text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 pr-6 font-bold text-white">${Number(tx.amount).toLocaleString()}</td>
                    <td className="py-4 pr-6 text-[#EAECEF]">{tx.currency || 'USD'}</td>
                    <td className="py-4 pr-6 text-[#848E9C] capitalize">{(tx.paymentMethod || '').replace('_', ' ')}</td>
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