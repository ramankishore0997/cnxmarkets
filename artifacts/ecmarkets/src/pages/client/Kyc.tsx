import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck, Loader2, CreditCard, AlertTriangle,
  CheckCircle2, Hash, Upload, Eye, X, FileImage,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  panNumber:    z.string().min(10, 'Enter valid PAN number (e.g. ABCDE1234F)').max(10, 'PAN is exactly 10 characters'),
  aadharNumber: z.string().min(12, 'Enter valid 12-digit Aadhaar number').max(12, 'Aadhaar is exactly 12 digits'),
});

type FormData = z.infer<typeof schema>;

type DocFiles = {
  aadhaarFront: File | null;
  aadhaarBack:  File | null;
  panFront:     File | null;
  panBack:      File | null;
};

const API_BASE = '/api';

function getToken() { return localStorage.getItem('ecm_token') || ''; }

async function submitKycWithFiles(data: FormData, files: DocFiles) {
  const fd = new FormData();
  fd.append('panNumber',    data.panNumber);
  fd.append('aadharNumber', data.aadharNumber);
  if (files.aadhaarFront) fd.append('aadhaarFront', files.aadhaarFront);
  if (files.aadhaarBack)  fd.append('aadhaarBack',  files.aadhaarBack);
  if (files.panFront)     fd.append('panFront',     files.panFront);
  if (files.panBack)      fd.append('panBack',      files.panBack);

  const resp = await fetch(`${API_BASE}/kyc`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return resp.json();
}

function FileUploadBox({
  label, fieldKey, file, onSet, preview, onPreview,
}: {
  label: string;
  fieldKey: keyof DocFiles;
  file: File | null;
  onSet: (k: keyof DocFiles, f: File | null) => void;
  preview: string | null;
  onPreview: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      alert('File size must be under 10 MB');
      return;
    }
    onSet(fieldKey, f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[#EAECEF]">{label}</p>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${file
            ? 'border-[#00C274]/60 bg-[#00C274]/5'
            : 'border-[#2A2D3A] bg-[#0C0E15] hover:border-[#00C274]/40 hover:bg-[#00C274]/5'
          }`}
        style={{ minHeight: 90 }}
      >
        {file ? (
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-lg bg-[#00C274]/20 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-[#00C274]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{file.name}</p>
              <p className="text-[10px] text-[#848E9C]">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onPreview(URL.createObjectURL(file)); }}
                className="w-7 h-7 rounded-lg bg-[#1E2329] hover:bg-[#2A2D3A] flex items-center justify-center transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#848E9C]" />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onSet(fieldKey, null); }}
                className="w-7 h-7 rounded-lg bg-[#CF304A]/10 hover:bg-[#CF304A]/20 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#CF304A]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-3 text-center">
            <Upload className="w-5 h-5 text-[#848E9C]" />
            <p className="text-xs text-[#848E9C]">Click or drag & drop</p>
            <p className="text-[10px] text-[#3D4450]">JPG, PNG, WEBP · Max 10 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );
}

export function Kyc() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: kycData, isLoading } = useGetKyc({ ...getAuthOptions() });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [files, setFiles] = useState<DocFiles>({ aadhaarFront: null, aadhaarBack: null, panFront: null, panBack: null });
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setFile = (k: keyof DocFiles, f: File | null) => setFiles(prev => ({ ...prev, [k]: f }));

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await submitKycWithFiles(data, files);
      toast({ title: 'KYC Submitted', description: 'Your details are under review. This usually takes 1–2 business days.' });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#00C274]" /></div>
    </DashboardLayout>
  );

  const kycDoc = kycData as any;
  const isSubmitted = kycDoc?.status && kycDoc.status !== 'rejected';

  return (
    <DashboardLayout>
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#CF304A] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewUrl} alt="Document preview" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-[#848E9C] font-medium">Submit your PAN & Aadhaar details + photos to unlock full trading access</p>
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
              <div className="inline-flex items-center gap-2 bg-[#1E2329] border border-[#181B23] rounded-xl px-5 py-3">
                <FileImage className="w-4 h-4 text-[#848E9C]" />
                <span className="text-sm text-[#848E9C]">
                  {[kycDoc.aadharCardFrontUrl, kycDoc.aadharCardBackUrl, kycDoc.panCardFrontUrl, kycDoc.panCardBackUrl].filter(Boolean).length}/4 documents uploaded
                </span>
              </div>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* PAN Number */}
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

              {/* Aadhaar Number */}
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

              {/* Divider */}
              <div className="border-t border-[#1A1D27] pt-2">
                <p className="text-sm font-semibold text-[#EAECEF] mb-1 flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-[#848E9C]" />
                  Document Photos <span className="text-[#848E9C] font-normal text-xs">(JPG/PNG · Max 10 MB each)</span>
                </p>
                <p className="text-xs text-[#848E9C] mb-4">Upload clear, readable photos of all 4 documents for faster approval.</p>

                {/* Aadhaar photos */}
                <p className="text-xs font-semibold text-[#00C274] uppercase tracking-widest mb-2">Aadhaar Card</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <FileUploadBox
                    label="Front Side"
                    fieldKey="aadhaarFront"
                    file={files.aadhaarFront}
                    onSet={setFile}
                    preview={null}
                    onPreview={setPreviewUrl}
                  />
                  <FileUploadBox
                    label="Back Side"
                    fieldKey="aadhaarBack"
                    file={files.aadhaarBack}
                    onSet={setFile}
                    preview={null}
                    onPreview={setPreviewUrl}
                  />
                </div>

                {/* PAN photos */}
                <p className="text-xs font-semibold text-[#00C274] uppercase tracking-widest mb-2">PAN Card</p>
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBox
                    label="Front Side"
                    fieldKey="panFront"
                    file={files.panFront}
                    onSet={setFile}
                    preview={null}
                    onPreview={setPreviewUrl}
                  />
                  <FileUploadBox
                    label="Back Side"
                    fieldKey="panBack"
                    file={files.panBack}
                    onSet={setFile}
                    preview={null}
                    onPreview={setPreviewUrl}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full flex justify-center items-center gap-2 text-base py-3"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
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
