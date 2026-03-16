import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubmitDeposit } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { Building2, Copy, CheckCircle2, Loader2 } from 'lucide-react';

const schema = z.object({
  amount: z.coerce.number().min(100, "Minimum deposit is $100"),
  currency: z.string().min(1, "Currency is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionReference: z.string().optional(),
});

export function Deposit() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
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
        <p className="text-muted-foreground">Add capital to start allocating to strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Deposit Details</h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                  <input 
                    {...form.register('amount')}
                    type="number" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Currency</label>
                <select 
                  {...form.register('currency')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Payment Method</label>
              <select 
                {...form.register('paymentMethod')}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
              >
                <option value="bank_transfer">Wire / Bank Transfer</option>
                <option value="crypto">Cryptocurrency (USDT/USDC)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Transaction Reference (Optional)</label>
              <input 
                {...form.register('transactionReference')}
                type="text" 
                placeholder="Reference number after transfer"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={depositMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center"
            >
              {depositMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Wire Instructions</h3>
            <p className="text-sm text-muted-foreground mb-4">Please send funds to the following institutional account.</p>
            
            <div className="bg-black/50 p-4 rounded-xl relative group">
              <pre className="text-sm text-white font-mono whitespace-pre-wrap">
                Bank: ECM INTL CORP{'\n'}
                Account: 8934578923{'\n'}
                SWIFT: ECMBXXX{'\n'}
                Ref: Include your email
              </pre>
              <button 
                onClick={copyBankDetails}
                className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
