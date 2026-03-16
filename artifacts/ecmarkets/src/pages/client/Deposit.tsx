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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fund Account</h1>
        <p className="text-gray-500 font-medium">Add capital to start allocating to strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Deposit Details</h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-medium">$</span>
                  <input 
                    {...form.register('amount')}
                    type="number" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Currency</label>
                <select 
                  {...form.register('currency')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all appearance-none shadow-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Payment Method</label>
              <select 
                {...form.register('paymentMethod')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all appearance-none shadow-sm"
              >
                <option value="bank_transfer">Wire / Bank Transfer</option>
                <option value="crypto">Cryptocurrency (USDT/USDC)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Transaction Reference (Optional)</label>
              <input 
                {...form.register('transactionReference')}
                type="text" 
                placeholder="Reference number after transfer"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={depositMutation.isPending}
              className="w-full py-3.5 rounded-xl font-bold btn-primary text-lg flex justify-center mt-2 shadow-md"
            >
              {depositMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Wire Instructions</h3>
            <p className="text-sm text-gray-600 mb-6">Please send funds to the following institutional account.</p>
            
            <div className="bg-white border border-gray-200 p-5 rounded-2xl relative group shadow-sm">
              <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-loose">
                <span className="text-gray-500 font-sans font-semibold text-xs uppercase tracking-wider">Bank</span><br />ECM INTL CORP{'\n'}
                <span className="text-gray-500 font-sans font-semibold text-xs uppercase tracking-wider">Account</span><br />8934578923{'\n'}
                <span className="text-gray-500 font-sans font-semibold text-xs uppercase tracking-wider">SWIFT</span><br />ECMBXXX{'\n'}
                <span className="text-gray-500 font-sans font-semibold text-xs uppercase tracking-wider">Ref</span><br />Include your email
              </pre>
              <button 
                onClick={copyBankDetails}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm"
                title="Copy details"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
