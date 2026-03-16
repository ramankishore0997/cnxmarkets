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

  if (isLoading) return <DashboardLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-[#848E9C] font-medium">Complete KYC to unlock full trading limits</p>
        </div>

        {kycData?.status && kycData.status !== 'rejected' ? (
          <div className="card-stealth p-12 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${kycData.status === 'approved' ? 'bg-[#02C076]/20' : 'bg-[#F0B90B]/20'}`}>
              <ShieldCheck className={`w-12 h-12 ${kycData.status === 'approved' ? 'text-[#02C076]' : 'text-[#F0B90B]'}`} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 capitalize">Status: {kycData.status}</h2>
            <p className="text-[#848E9C] max-w-sm mx-auto leading-relaxed">
              {kycData.status === 'approved' 
                ? 'Your account is fully verified. You have access to all platform features.' 
                : 'Your documents are currently under review by our compliance team. This usually takes 1-2 business days.'}
            </p>
          </div>
        ) : (
          <div className="card-stealth p-8 md:p-10">
            {kycData?.status === 'rejected' && (
              <div className="bg-[#CF304A]/20 border border-[#CF304A]/40 text-[#CF304A] p-4 rounded-xl mb-8 flex items-start gap-3">
                <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-[#CF304A]" /></div>
                <div>
                  <strong className="block mb-1">Verification Failed</strong>
                  <p className="text-sm">{kycData.rejectionReason}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={form.handleSubmit((d) => submitMutation.mutate({ data: d }))} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] flex items-center justify-center text-sm border border-[#F0B90B]/40">1</span> 
                  Proof of Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Document Type</label>
                    <select {...form.register('idDocumentType')} className="input-stealth appearance-none">
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID / Aadhaar</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Document URL</label>
                    <input {...form.register('idDocumentUrl')} placeholder="https://..." className="input-stealth" />
                    {form.formState.errors.idDocumentUrl && <p className="text-xs text-[#CF304A]">{form.formState.errors.idDocumentUrl.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#2B3139]">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] flex items-center justify-center text-sm border border-[#F0B90B]/40">2</span> 
                  Proof of Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Document Type</label>
                    <select {...form.register('addressProofType')} className="input-stealth appearance-none">
                      <option value="utility_bill">Utility Bill</option>
                      <option value="bank_statement">Bank Statement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Document URL</label>
                    <input {...form.register('addressProofUrl')} placeholder="https://..." className="input-stealth" />
                    {form.formState.errors.addressProofUrl && <p className="text-xs text-[#CF304A]">{form.formState.errors.addressProofUrl.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={submitMutation.isPending} className="btn-gold w-full flex justify-center text-lg">
                  {submitMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Documents"}
                </button>
                <p className="text-center text-xs text-[#848E9C] mt-4">Your data is encrypted and stored securely.</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}