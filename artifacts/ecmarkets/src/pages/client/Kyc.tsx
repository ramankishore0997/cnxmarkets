import { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc, useSubmitKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck, Loader2, CreditCard, Upload, X, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAR_REGEX = /^\d{12}$/;

const schema = z.object({
  panNumber: z.string().regex(PAN_REGEX, 'Invalid PAN format (e.g. ABCDE1234F)'),
  aadharNumber: z.string().regex(AADHAR_REGEX, 'Aadhar must be 12 digits'),
  panCardFrontUrl: z.string().min(1, 'PAN card front image required'),
  panCardBackUrl: z.string().min(1, 'PAN card back image required'),
  aadharCardFrontUrl: z.string().min(1, 'Aadhar card front image required'),
  aadharCardBackUrl: z.string().min(1, 'Aadhar card back image required'),
});

type FormData = z.infer<typeof schema>;

function FileUploadBox({
  label, value, onChange, error
}: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#848E9C]">{label}</label>
        <div className="relative bg-[#0B0E11] border border-[#02C076]/40 rounded-xl overflow-hidden">
          {value.startsWith('data:image') ? (
            <img src={value} alt={label} className="w-full h-28 object-cover" />
          ) : (
            <div className="h-28 flex items-center justify-center bg-[#02C076]/10">
              <CheckCircle2 className="w-8 h-8 text-[#02C076]" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-[#02C076]/20 px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#02C076]" />
            <span className="text-xs text-[#02C076] font-semibold">Uploaded</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-[#848E9C]">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center gap-2 text-center min-h-[100px] justify-center
          ${error ? 'border-[#CF304A]/50 bg-[#CF304A]/5 hover:border-[#CF304A]' : 'border-[#2B3139] bg-[#0B0E11] hover:border-[#F0B90B]/50 hover:bg-[#F0B90B]/5'}`}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[#F0B90B]" />
        ) : (
          <>
            <Upload className={`w-6 h-6 ${error ? 'text-[#CF304A]' : 'text-[#848E9C]'}`} />
            <p className="text-xs text-[#848E9C]">Click or drag & drop</p>
            <p className="text-xs text-[#2B3139]">JPG, PNG, PDF</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {error && <p className="text-xs text-[#CF304A] flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export function Kyc() {
  const { toast } = useToast();
  const { data: kycData, isLoading, refetch } = useGetKyc({ ...getAuthOptions() });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const panFront = watch('panCardFrontUrl') || '';
  const panBack = watch('panCardBackUrl') || '';
  const aadharFront = watch('aadharCardFrontUrl') || '';
  const aadharBack = watch('aadharCardBackUrl') || '';

  const submitMutation = useSubmitKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Submitted", description: "Your documents are under review. This usually takes 1-2 business days." });
        refetch();
      },
      onError: () => toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" })
    }
  });

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
    </DashboardLayout>
  );

  const isSubmitted = kycData && (kycData as any).status && (kycData as any).status !== 'rejected';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-[#848E9C] font-medium">Submit PAN & Aadhar to unlock full trading access</p>
        </div>

        {isSubmitted ? (
          <div className="card-stealth p-12 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${(kycData as any).status === 'approved' ? 'bg-[#02C076]/20' : 'bg-[#F0B90B]/20'}`}>
              <ShieldCheck className={`w-12 h-12 ${(kycData as any).status === 'approved' ? 'text-[#02C076]' : 'text-[#F0B90B]'}`} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 capitalize">
              {(kycData as any).status === 'approved' ? 'Verification Complete' : 'Under Review'}
            </h2>
            <p className="text-[#848E9C] max-w-sm mx-auto leading-relaxed">
              {(kycData as any).status === 'approved'
                ? 'Your identity has been verified. You now have full access to all platform features.'
                : 'Our compliance team is reviewing your documents. This usually takes 1–2 business days.'}
            </p>
            {(kycData as any).panNumber && (
              <div className="mt-6 inline-flex items-center gap-2 bg-[#1E2329] border border-[#2B3139] rounded-xl px-5 py-3">
                <CreditCard className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-sm font-mono text-white">{(kycData as any).panNumber}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="card-stealth p-8">
            {(kycData as any)?.status === 'rejected' && (
              <div className="bg-[#CF304A]/10 border border-[#CF304A]/30 text-[#CF304A] p-4 rounded-xl mb-8 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <strong className="block mb-1">Verification Failed</strong>
                  <p className="text-sm">{(kycData as any).rejectionReason || 'Documents did not meet our requirements. Please resubmit.'}</p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(d => submitMutation.mutate({ data: d as any }))}
              className="space-y-8"
            >
              {/* PAN Card Section */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center border border-[#F0B90B]/30">
                    <CreditCard className="w-4 h-4 text-[#F0B90B]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">PAN Card</h3>
                    <p className="text-xs text-[#848E9C]">Permanent Account Number</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">PAN Number <span className="text-[#CF304A]">*</span></label>
                    <input
                      {...register('panNumber')}
                      placeholder="ABCDE1234F"
                      className="input-stealth font-mono uppercase"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.panNumber && <p className="text-xs text-[#CF304A] flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.panNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FileUploadBox
                      label="Front Side *"
                      value={panFront}
                      onChange={v => setValue('panCardFrontUrl', v, { shouldValidate: true })}
                      error={errors.panCardFrontUrl?.message}
                    />
                    <FileUploadBox
                      label="Back Side *"
                      value={panBack}
                      onChange={v => setValue('panCardBackUrl', v, { shouldValidate: true })}
                      error={errors.panCardBackUrl?.message}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2B3139]"></div>

              {/* Aadhar Card Section */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#2a6df4]/20 flex items-center justify-center border border-[#2a6df4]/30">
                    <CreditCard className="w-4 h-4 text-[#2a6df4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Aadhar Card</h3>
                    <p className="text-xs text-[#848E9C]">Unique Identification Authority of India</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Aadhar Number <span className="text-[#CF304A]">*</span></label>
                    <input
                      {...register('aadharNumber')}
                      placeholder="123456789012"
                      className="input-stealth font-mono"
                      maxLength={12}
                    />
                    {errors.aadharNumber && <p className="text-xs text-[#CF304A] flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.aadharNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FileUploadBox
                      label="Front Side *"
                      value={aadharFront}
                      onChange={v => setValue('aadharCardFrontUrl', v, { shouldValidate: true })}
                      error={errors.aadharCardFrontUrl?.message}
                    />
                    <FileUploadBox
                      label="Back Side *"
                      value={aadharBack}
                      onChange={v => setValue('aadharCardBackUrl', v, { shouldValidate: true })}
                      error={errors.aadharCardBackUrl?.message}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn-gold w-full flex justify-center items-center gap-2 text-lg"
                >
                  {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Submit for Verification
                </button>
                <p className="text-center text-xs text-[#848E9C] mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your documents are encrypted and stored securely. We comply with DPDP Act 2023.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
