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

  if (isLoading) return <DashboardLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
          <p className="text-gray-500 font-medium">Complete KYC to unlock full trading limits</p>
        </div>

        {kycData?.status && kycData.status !== 'rejected' ? (
          <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-3xl text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${kycData.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <ShieldCheck className={`w-12 h-12 ${kycData.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 capitalize">Status: {kycData.status}</h2>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              {kycData.status === 'approved' 
                ? 'Your account is fully verified. You have access to all platform features.' 
                : 'Your documents are currently under review by our compliance team. This usually takes 1-2 business days.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 shadow-sm p-8 md:p-10 rounded-3xl">
            {kycData?.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-start gap-3">
                <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-red-500" /></div>
                <div>
                  <strong className="block mb-1">Verification Failed</strong>
                  <p className="text-sm">{kycData.rejectionReason}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={form.handleSubmit((d) => submitMutation.mutate({ data: d }))} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span> 
                  Proof of Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Document Type</label>
                    <select {...form.register('idDocumentType')} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm">
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID / Aadhaar</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Document URL</label>
                    <input {...form.register('idDocumentUrl')} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm" />
                    {form.formState.errors.idDocumentUrl && <p className="text-xs text-red-500">{form.formState.errors.idDocumentUrl.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span> 
                  Proof of Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Document Type</label>
                    <select {...form.register('addressProofType')} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm">
                      <option value="utility_bill">Utility Bill</option>
                      <option value="bank_statement">Bank Statement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Document URL</label>
                    <input {...form.register('addressProofUrl')} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm" />
                    {form.formState.errors.addressProofUrl && <p className="text-xs text-red-500">{form.formState.errors.addressProofUrl.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={submitMutation.isPending} className="w-full py-4 rounded-xl font-bold btn-primary text-lg flex justify-center shadow-md">
                  {submitMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Documents"}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">Your data is encrypted and stored securely.</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
