import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck, Loader2, CreditCard, AlertTriangle,
  CheckCircle2, Hash, Upload, Eye, X, FileImage, RefreshCw,
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
  label, fieldKey, file, onSet, onPreview, required, allUploaded,
}: {
  label: string;
  fieldKey: keyof DocFiles;
  file: File | null;
  onSet: (k: keyof DocFiles, f: File | null) => void;
  onPreview: (url: string | null) => void;
  required?: boolean;
  allUploaded?: boolean;
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

  const missing = !file && required && allUploaded === false;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[#374151] flex items-center gap-1.5">
        {label}
        {!file && <span className="text-[#DC2626] text-[10px]">required</span>}
        {file  && <CheckCircle2 className="w-3 h-3 text-[#1F77B4]" />}
      </p>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${file
            ? 'border-[#1F77B4]/60 bg-[#1F77B4]/5'
            : missing
              ? 'border-[#DC2626]/50 bg-[#DC2626]/5'
              : 'border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#1F77B4]/40 hover:bg-[#1F77B4]/5'
          }`}
        style={{ minHeight: 90 }}
      >
        {file ? (
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-lg bg-[#1F77B4]/20 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-[#1F77B4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{file.name}</p>
              <p className="text-[10px] text-[#6B7280]">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onPreview(URL.createObjectURL(file)); }}
                className="w-7 h-7 rounded-lg bg-[#F7F9FC] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onSet(fieldKey, null); }}
                className="w-7 h-7 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#DC2626]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-3 text-center">
            <Upload className={`w-5 h-5 ${missing ? 'text-[#DC2626]/60' : 'text-[#6B7280]'}`} />
            <p className={`text-xs ${missing ? 'text-[#DC2626]/80' : 'text-[#6B7280]'}`}>Click or drag & drop</p>
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

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [files, setFiles] = useState<DocFiles>({ aadhaarFront: null, aadhaarBack: null, panFront: null, panBack: null });
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const setFile = (k: keyof DocFiles, f: File | null) => setFiles(prev => ({ ...prev, [k]: f }));

  const panValue    = watch('panNumber', '');
  const aadharValue = watch('aadharNumber', '');

  const uploadedCount = [files.aadhaarFront, files.aadhaarBack, files.panFront, files.panBack].filter(Boolean).length;
  const allFilesUploaded = uploadedCount === 4;
  const allFieldsValid   = panValue.length === 10 && aadharValue.length === 12;
  const canSubmit = allFilesUploaded && allFieldsValid;

  const onSubmit = async (data: FormData) => {
    setAttemptedSubmit(true);
    if (!allFilesUploaded) {
      toast({ title: 'Photos required', description: `Please upload all 4 document photos (${uploadedCount}/4 uploaded).`, variant: 'destructive' });
      return;
    }
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
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#1F77B4]" /></div>
    </DashboardLayout>
  );

  const kycDoc = kycData as any;

  const isApprovedOrUnderReview = kycDoc?.status === 'submitted' || kycDoc?.status === 'approved';
  const wasResetToPending = kycDoc && kycDoc.status === 'pending' && kycDoc.panNumber;
  const isRejected = kycDoc?.status === 'rejected';

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
              className="absolute -top-10 right-0 text-white hover:text-[#DC2626] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewUrl} alt="Document preview" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Identity Verification</h1>
          <p className="text-[#6B7280] font-medium">Submit your PAN & Aadhaar details + photos to unlock full trading access</p>
        </div>

        {isApprovedOrUnderReview ? (
          <div className="card-stealth p-12 text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${kycDoc.status === 'approved' ? 'bg-[#16A34A]/20' : 'bg-[#1F77B4]/20'}`}>
              <ShieldCheck className={`w-10 h-10 ${kycDoc.status === 'approved' ? 'text-[#16A34A]' : 'text-[#1F77B4]'}`} />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-3">
              {kycDoc.status === 'approved' ? 'Verification Complete' : 'Under Review'}
            </h2>
            <p className="text-[#6B7280] max-w-sm mx-auto leading-relaxed mb-6">
              {kycDoc.status === 'approved'
                ? 'Your identity has been verified. You now have full access to all platform features.'
                : 'Our compliance team is reviewing your details. This usually takes 1–2 business days.'}
            </p>
            <div className="flex flex-col gap-3 items-center">
              {kycDoc.panNumber && (
                <div className="inline-flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-5 py-3">
                  <CreditCard className="w-4 h-4 text-[#1F77B4]" />
                  <span className="text-sm text-[#6B7280]">PAN:</span>
                  <span className="text-sm font-mono font-bold text-[#111827]">{kycDoc.panNumber}</span>
                </div>
              )}
              {kycDoc.aadharNumber && (
                <div className="inline-flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-5 py-3">
                  <Hash className="w-4 h-4 text-[#2a6df4]" />
                  <span className="text-sm text-[#6B7280]">Aadhaar:</span>
                  <span className="text-sm font-mono font-bold text-[#111827]">XXXX XXXX {String(kycDoc.aadharNumber).slice(-4)}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-5 py-3">
                <FileImage className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm text-[#6B7280]">
                  {[kycDoc.aadharCardFrontUrl, kycDoc.aadharCardBackUrl, kycDoc.panCardFrontUrl, kycDoc.panCardBackUrl].filter(Boolean).length}/4 documents uploaded
                </span>
              </div>
            </div>
            {kycDoc.status === 'approved' && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[#16A34A] text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Verified & Active
              </div>
            )}
          </div>
        ) : (
          <div className="card-stealth p-8">

            {/* Rejected banner */}
            {isRejected && (
              <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] p-4 rounded-xl mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <strong className="block mb-1">Verification Failed — Please Resubmit</strong>
                  <p className="text-sm opacity-90">{kycDoc.rejectionReason || 'Your documents did not pass verification. Please upload clear, valid photos and resubmit.'}</p>
                </div>
              </div>
            )}

            {/* Reset-to-pending banner */}
            {wasResetToPending && !isRejected && (
              <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] p-4 rounded-xl mb-6 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <strong className="block mb-1">KYC Reset — Resubmission Required</strong>
                  <p className="text-sm opacity-90">Our team has requested you to resubmit your KYC documents. Please fill in your details and upload all 4 photos again.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* PAN Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
                  <CreditCard className="w-4 h-4 text-[#1F77B4]" />
                  PAN Number <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  {...register('panNumber')}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="input-stealth font-mono uppercase tracking-widest text-lg"
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="text-xs text-[#6B7280]">10-character alphanumeric PAN as printed on your card</p>
                {errors.panNumber && (
                  <p className="text-xs text-[#DC2626] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.panNumber.message}
                  </p>
                )}
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
                  <Hash className="w-4 h-4 text-[#2a6df4]" />
                  Aadhaar Number <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  {...register('aadharNumber')}
                  placeholder="123456789012"
                  maxLength={12}
                  className="input-stealth font-mono tracking-widest text-lg"
                  inputMode="numeric"
                />
                <p className="text-xs text-[#6B7280]">12-digit Aadhaar number (no spaces)</p>
                {errors.aadharNumber && (
                  <p className="text-xs text-[#DC2626] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.aadharNumber.message}
                  </p>
                )}
              </div>

              {/* Document Photos */}
              <div className="border-t border-[#E5E7EB] pt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-[#6B7280]" />
                    Document Photos <span className="text-[#DC2626]">*</span>
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    allFilesUploaded
                      ? 'bg-[#1F77B4]/20 text-[#1F77B4]'
                      : 'bg-[#F7F9FC] text-[#6B7280]'
                  }`}>
                    {uploadedCount}/4 uploaded
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-4">All 4 photos are required. Upload clear, readable photos for faster approval.</p>

                {/* Aadhaar photos */}
                <p className="text-xs font-semibold text-[#1F77B4] uppercase tracking-widest mb-2">Aadhaar Card</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <FileUploadBox label="Front Side" fieldKey="aadhaarFront" file={files.aadhaarFront} onSet={setFile} onPreview={setPreviewUrl} required allUploaded={allFilesUploaded || !attemptedSubmit ? undefined : false} />
                  <FileUploadBox label="Back Side"  fieldKey="aadhaarBack"  file={files.aadhaarBack}  onSet={setFile} onPreview={setPreviewUrl} required allUploaded={allFilesUploaded || !attemptedSubmit ? undefined : false} />
                </div>

                {/* PAN photos */}
                <p className="text-xs font-semibold text-[#2a6df4] uppercase tracking-widest mb-2">PAN Card</p>
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBox label="Front Side" fieldKey="panFront" file={files.panFront} onSet={setFile} onPreview={setPreviewUrl} required allUploaded={allFilesUploaded || !attemptedSubmit ? undefined : false} />
                  <FileUploadBox label="Back Side"  fieldKey="panBack"  file={files.panBack}  onSet={setFile} onPreview={setPreviewUrl} required allUploaded={allFilesUploaded || !attemptedSubmit ? undefined : false} />
                </div>

                {/* Missing photos warning */}
                {attemptedSubmit && !allFilesUploaded && (
                  <p className="mt-3 text-xs text-[#DC2626] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please upload all 4 photos before submitting ({4 - uploadedCount} remaining)
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={() => setAttemptedSubmit(true)}
                  className={`w-full flex justify-center items-center gap-2 text-base py-3 rounded-xl font-bold transition-all
                    ${canSubmit
                      ? 'btn-gold cursor-pointer'
                      : 'bg-[#E5E7EB] text-[#4B5563] border border-[#E5E7EB] cursor-not-allowed'
                    }`}
                >
                  {submitting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                    : <><ShieldCheck className="w-5 h-5" /> Submit for Verification</>
                  }
                </button>

                {/* Checklist */}
                {!canSubmit && (
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] text-[#3D4450] font-semibold uppercase tracking-wider">Complete to enable submit:</p>
                    <div className="flex items-center gap-1.5 text-xs">
                      {panValue.length === 10
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F77B4] shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-[#3D4450] shrink-0" />}
                      <span className={panValue.length === 10 ? 'text-[#1F77B4]' : 'text-[#6B7280]'}>PAN number (10 characters)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {aadharValue.length === 12
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F77B4] shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-[#3D4450] shrink-0" />}
                      <span className={aadharValue.length === 12 ? 'text-[#1F77B4]' : 'text-[#6B7280]'}>Aadhaar number (12 digits)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {allFilesUploaded
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F77B4] shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-[#3D4450] shrink-0" />}
                      <span className={allFilesUploaded ? 'text-[#1F77B4]' : 'text-[#6B7280]'}>All 4 document photos ({uploadedCount}/4)</span>
                    </div>
                  </div>
                )}

                <p className="text-center text-xs text-[#6B7280] mt-4 flex items-center justify-center gap-1.5">
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
