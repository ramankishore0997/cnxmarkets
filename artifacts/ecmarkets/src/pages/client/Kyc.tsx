import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc, useSubmitKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Loader2, CreditCard, AlertTriangle, CheckCircle2, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  panNumber: z.string().min(10, 'Enter valid PAN number (e.g. ABCDE1234F)').max(10, 'PAN is exactly 10 characters'),
  aadharNumber: z.string().min(12, 'Enter valid 12-digit Aadhaar number').max(12, 'Aadhaar is exactly 12 digits'),
});

type FormData = z.infer<typeof schema>;

export function Kyc() {
  const { toast } = useToast();
  const { data: kycData, isLoading, refetch } = useGetKyc({ ...getAuthOptions() });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitMutation = useSubmitKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Submitted", description: "Your details are under review. This usually takes 1–2 business days." });
        refetch();
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message || 'Please try again.';
        toast({ title: "Submission failed", description: msg, variant: "destructive" });
      }
    }
  });

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#00C274]" /></div>
    </DashboardLayout>
  );

  const kycDoc = kycData as any;
  const isSubmitted = kycDoc?.status && kycDoc.status !== 'rejected';

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-[#848E9C] font-medium">Submit your PAN & Aadhaar details to unlock full trading access</p>
        </div>

        {isSubmitted ? (
          <div className="card-stealth p-12 text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${kycDoc.status === 'approved' ? 'bg-[#02C076]/20' : 'bg-[#00C274]/20'}`}>
              <ShieldCheck className={`w-10 h-10 ${kycDoc.status === 'approved' ? 'text-[#02C076]' : 'text-[#00C274]'}`} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {kycDoc.status === 'approved' ? 'Verification Complete' : 'Under Review'}
            </h2>
            <p className="text-[#848E9C] max-w-sm mx-auto leading-relaxed mb-6">
              {kycDoc.status === 'approved'
                ? 'Your identity has been verified. You now have full access to all platform features.'
                : 'Our compliance team is reviewing your details. This usually takes 1–2 business days.'}
            </p>
            <div className="flex flex-col gap-3 items-center">
              {kycDoc.panNumber && (
                <div className="inline-flex items-center gap-2 bg-[#1E2329] border border-[#181B23] rounded-xl px-5 py-3">
                  <CreditCard className="w-4 h-4 text-[#00C274]" />
                  <span className="text-sm text-[#848E9C]">PAN:</span>
                  <span className="text-sm font-mono font-bold text-white">{kycDoc.panNumber}</span>
                </div>
              )}
              {kycDoc.aadharNumber && (
                <div className="inline-flex items-center gap-2 bg-[#1E2329] border border-[#181B23] rounded-xl px-5 py-3">
                  <Hash className="w-4 h-4 text-[#2a6df4]" />
                  <span className="text-sm text-[#848E9C]">Aadhaar:</span>
                  <span className="text-sm font-mono font-bold text-white">XXXX XXXX {String(kycDoc.aadharNumber).slice(-4)}</span>
                </div>
              )}
            </div>
            {kycDoc.status === 'approved' && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[#02C076] text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Verified & Active
              </div>
            )}
          </div>
        ) : (
          <div className="card-stealth p-8">
            {kycDoc?.status === 'rejected' && (
              <div className="bg-[#CF304A]/10 border border-[#CF304A]/30 text-[#CF304A] p-4 rounded-xl mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <strong className="block mb-1">Verification Failed</strong>
                  <p className="text-sm">{kycDoc.rejectionReason || 'Your details did not match our records. Please resubmit.'}</p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(d => submitMutation.mutate({ data: d as any }))}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#EAECEF]">
                  <CreditCard className="w-4 h-4 text-[#00C274]" />
                  PAN Number <span className="text-[#CF304A]">*</span>
                </label>
                <input
                  {...register('panNumber')}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="input-stealth font-mono uppercase tracking-widest text-lg"
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="text-xs text-[#848E9C]">10-character alphanumeric PAN as printed on your card</p>
                {errors.panNumber && (
                  <p className="text-xs text-[#CF304A] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.panNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#EAECEF]">
                  <Hash className="w-4 h-4 text-[#2a6df4]" />
                  Aadhaar Number <span className="text-[#CF304A]">*</span>
                </label>
                <input
                  {...register('aadharNumber')}
                  placeholder="123456789012"
                  maxLength={12}
                  className="input-stealth font-mono tracking-widest text-lg"
                  inputMode="numeric"
                />
                <p className="text-xs text-[#848E9C]">12-digit Aadhaar number (no spaces)</p>
                {errors.aadharNumber && (
                  <p className="text-xs text-[#CF304A] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.aadharNumber.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn-gold w-full flex justify-center items-center gap-2 text-base py-3"
                >
                  {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Submit for Verification
                </button>
                <p className="text-center text-xs text-[#848E9C] mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your details are encrypted and stored securely. We comply with DPDP Act 2023.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
