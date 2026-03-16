import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc, useSubmitKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Upload, FileImage, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  idDocumentType: z.string().min(1, "Required"),
  idDocumentUrl: z.string().url("Must be a valid URL for demo purposes"),
  addressProofType: z.string().min(1, "Required"),
  addressProofUrl: z.string().url("Must be a valid URL"),
});

export function Kyc() {
  const { toast } = useToast();
  const { data: kycData, isLoading, refetch } = useGetKyc({ ...getAuthOptions() });
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { idDocumentType: 'passport', addressProofType: 'utility_bill' }
  });

  const submitMutation = useSubmitKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Submitted", description: "Documents under review." });
        refetch();
      }
    }
  });

  if (isLoading) return <DashboardLayout><div className="text-white">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-muted-foreground">Complete KYC to unlock full trading limits</p>
        </div>

        {kycData?.status && kycData.status !== 'rejected' ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <ShieldCheck className={`w-16 h-16 mx-auto mb-4 ${kycData.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`} />
            <h2 className="text-2xl font-bold text-white mb-2 capitalize">Status: {kycData.status}</h2>
            <p className="text-muted-foreground">
              {kycData.status === 'approved' ? 'Your account is fully verified.' : 'Your documents are currently under review by compliance.'}
            </p>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl">
            {kycData?.status === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                <strong>Review Failed:</strong> {kycData.rejectionReason}
              </div>
            )}
            
            <form onSubmit={form.handleSubmit((d) => submitMutation.mutate({ data: d }))} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2">Proof of Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select {...form.register('idDocumentType')} className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white">
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID / Aadhaar</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                  <input {...form.register('idDocumentUrl')} placeholder="Document Image URL" className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4 border-b border-white/10 pb-2">Proof of Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select {...form.register('addressProofType')} className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white">
                    <option value="utility_bill">Utility Bill</option>
                    <option value="bank_statement">Bank Statement</option>
                  </select>
                  <input {...form.register('addressProofUrl')} placeholder="Document Image URL" className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white" />
                </div>
              </div>

              <button type="submit" disabled={submitMutation.isPending} className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50">
                {submitMutation.isPending ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "Submit Documents"}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
