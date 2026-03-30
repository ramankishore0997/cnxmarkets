import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck, Loader2, CreditCard, AlertTriangle,
  CheckCircle2, Hash, Upload, Eye, X, FileImage, RefreshCw,
  Lock, Zap, Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  panNumber:    z.string().min(10, 'Enter valid PAN (e.g. ABCDE1234F)').max(10),
  aadharNumber: z.string().min(12, 'Enter valid 12-digit Aadhaar').max(12),
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

function FileUploadBox({ label, fieldKey, file, onSet, onPreview, required, attempted }: {
  label: string; fieldKey: keyof DocFiles; file: File | null;
  onSet: (k: keyof DocFiles, f: File | null) => void;
  onPreview: (url: string | null) => void;
  required?: boolean; attempted?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const missing = !file && required && attempted;

  const handleFile = (f: File) => {
    onSet(fieldKey, f);
  };

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        {file
          ? <CheckCircle2 size={12} style={{ color: '#16A34A' }} />
          : <span style={{ color: '#DC2626', fontSize: 10 }}>required</span>}
      </p>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          borderRadius: 14,
          border: `2px dashed ${file ? '#16A34A' : missing ? '#DC2626' : '#D1D5DB'}`,
          background: file ? 'rgba(22,163,74,0.04)' : missing ? 'rgba(220,38,38,0.04)' : '#FAFAFA',
          minHeight: 88,
          height: 88,
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileImage size={14} style={{ color: '#16A34A' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{file.name}</p>
              <p style={{ fontSize: 9, color: '#6B7280', margin: 0 }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`}</p>
            </div>
            <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
              <button type="button" onClick={e => { e.stopPropagation(); onPreview(URL.createObjectURL(file)); }}
                style={{ width: 26, height: 26, borderRadius: 7, background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Eye size={12} style={{ color: '#6B7280' }} />
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onSet(fieldKey, null); }}
                style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(220,38,38,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={12} style={{ color: '#DC2626' }} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 8px' }}>
            <Upload size={17} style={{ color: missing ? '#DC2626' : '#9CA3AF', marginBottom: 3 }} />
            <p style={{ fontSize: 11, color: missing ? '#DC2626' : '#6B7280', margin: 0, fontWeight: 600 }}>Click or drag</p>
            <p style={{ fontSize: 9, color: '#9CA3AF', margin: 0 }}>JPG · PNG · WEBP · PDF</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}

/* ── Step indicator ── */
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Personal Details' },
    { n: 2, label: 'Upload Documents' },
    { n: 3, label: 'Verification' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#16A34A' : active ? '#1F77B4' : '#E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 0 0 4px rgba(31,119,180,0.15)' : done ? '0 0 0 4px rgba(22,163,74,0.12)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done
                  ? <CheckCircle2 size={15} style={{ color: '#fff' }} />
                  : <span style={{ fontSize: 13, fontWeight: 800, color: active ? '#fff' : '#9CA3AF' }}>{s.n}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#1F77B4' : done ? '#16A34A' : '#9CA3AF', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#16A34A' : '#E5E7EB', margin: '0 8px', marginBottom: 18, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
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
  const [attempted, setAttempted] = useState(false);

  const setFile = (k: keyof DocFiles, f: File | null) => setFiles(prev => ({ ...prev, [k]: f }));

  const panValue    = watch('panNumber', '');
  const aadharValue = watch('aadharNumber', '');

  const uploadedCount   = [files.aadhaarFront, files.aadhaarBack, files.panFront, files.panBack].filter(Boolean).length;
  const allFilesUp      = uploadedCount === 4;
  const allFieldsValid  = panValue.length === 10 && aadharValue.length === 12;
  const canSubmit       = allFilesUp && allFieldsValid;

  const currentStep: 1 | 2 | 3 = !allFieldsValid ? 1 : !allFilesUp ? 2 : 3;

  const onSubmit = async (data: FormData) => {
    setAttempted(true);
    if (!allFilesUp) {
      toast({ title: 'Photos required', description: `Upload all 4 document photos (${uploadedCount}/4).`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await submitKycWithFiles(data, files);
      toast({ title: 'KYC Submitted ✓', description: 'Under review — usually 1–2 business days.' });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
        <Loader2 size={32} style={{ color: '#1F77B4', animation: 'spin 1s linear infinite' }} />
      </div>
    </DashboardLayout>
  );

  const kycDoc = kycData as any;
  const isApproved     = kycDoc?.status === 'approved';
  const isUnderReview  = kycDoc?.status === 'submitted';
  const isRejected     = kycDoc?.status === 'rejected';
  const wasReset       = kycDoc && kycDoc.status === 'pending' && kycDoc.panNumber;

  return (
    <DashboardLayout>
      {/* ── Fullscreen Image Preview ── */}
      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setPreviewUrl(null)}>
          <div style={{ position: 'relative', maxWidth: 640, width: '100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)}
              style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <img src={previewUrl} alt="Document" style={{ width: '100%', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 4px' }}>

        {/* ── Dark Hero Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0B1929 0%, #0d2035 60%, #0B1929 100%)',
          borderRadius: 22,
          padding: '28px 28px 24px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* bg glow blobs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,119,180,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(31,119,180,0.2)', border: '1px solid rgba(31,119,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} style={{ color: '#1F77B4' }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, margin: 0 }}>KYC & Security</p>
                  <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>Identity Verification</h1>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6, maxWidth: 360 }}>
                Submit your PAN & Aadhaar details to unlock full trading access, deposits and withdrawals.
              </p>
            </div>

            {/* Status badge */}
            <div style={{
              flexShrink: 0,
              background: isApproved ? 'rgba(22,163,74,0.15)' : isUnderReview ? 'rgba(31,119,180,0.15)' : isRejected ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isApproved ? 'rgba(22,163,74,0.3)' : isUnderReview ? 'rgba(31,119,180,0.3)' : isRejected ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              padding: '8px 14px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: isApproved ? '#16A34A' : isUnderReview ? '#1F77B4' : isRejected ? '#DC2626' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 2px' }}>Status</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: isApproved ? '#16A34A' : isUnderReview ? '#60AADC' : isRejected ? '#F87171' : 'rgba(255,255,255,0.7)', margin: 0 }}>
                {isApproved ? 'Verified' : isUnderReview ? 'In Review' : isRejected ? 'Rejected' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Trust row */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { icon: Lock, label: '256-bit SSL' },
              { icon: ShieldCheck, label: 'DPDP Compliant' },
              { icon: Clock, label: '1–2 Day Review' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <t.icon size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── APPROVED STATE ── */}
        {isApproved && (
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            {/* Green top bar */}
            <div style={{ background: 'linear-gradient(90deg, #15803d, #16A34A)', height: 5 }} />
            <div style={{ padding: 36, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ShieldCheck size={34} style={{ color: '#16A34A' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Verification Complete</h2>
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
                Your identity has been verified. You now have full access to all platform features including deposits, withdrawals, and trading.
              </p>

              {/* Info cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', maxWidth: 320, margin: '0 auto' }}>
                {kycDoc.panNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9FAFB', borderRadius: 14, padding: '12px 18px', border: '1px solid #E5E7EB' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CreditCard size={16} style={{ color: '#1F77B4' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>PAN Card</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'monospace', letterSpacing: 1 }}>{kycDoc.panNumber}</p>
                    </div>
                  </div>
                )}
                {kycDoc.aadharNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9FAFB', borderRadius: 14, padding: '12px 18px', border: '1px solid #E5E7EB' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Hash size={16} style={{ color: '#1F77B4' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aadhaar</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'monospace', letterSpacing: 1 }}>XXXX XXXX {String(kycDoc.aadharNumber).slice(-4)}</p>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9FAFB', borderRadius: 14, padding: '12px 18px', border: '1px solid #E5E7EB' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileImage size={16} style={{ color: '#16A34A' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Documents</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>
                      {[kycDoc.aadharCardFrontUrl, kycDoc.aadharCardBackUrl, kycDoc.panCardFrontUrl, kycDoc.panCardBackUrl].filter(Boolean).length}/4 uploaded
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 999, padding: '8px 20px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,0.25)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>Verified & Active</span>
              </div>
            </div>
          </div>
        )}

        {/* ── UNDER REVIEW STATE ── */}
        {isUnderReview && (
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <div style={{ background: 'linear-gradient(90deg, #1a65a0, #1F77B4)', height: 5 }} />
            <div style={{ padding: 36, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(31,119,180,0.1)', border: '2px solid rgba(31,119,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Clock size={34} style={{ color: '#1F77B4' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Under Review</h2>
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
                Our compliance team is reviewing your documents. This typically takes <strong style={{ color: '#1F77B4' }}>1–2 business days</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: Zap, label: 'Quick Review', sub: '1–2 business days' },
                  { icon: ShieldCheck, label: 'Secure Process', sub: 'Bank-grade encryption' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F9FAFB', borderRadius: 14, padding: '12px 18px', border: '1px solid #E5E7EB' }}>
                    <c.icon size={16} style={{ color: '#1F77B4' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 10.5, color: '#6B7280', margin: 0 }}>{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── KYC FORM STATE ── */}
        {!isApproved && !isUnderReview && (
          <div>
            {/* Step bar */}
            <StepBar step={currentStep} />

            {/* Rejected banner */}
            {isRejected && (
              <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 16, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={18} style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', margin: '0 0 4px' }}>Verification Failed — Please Resubmit</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{kycDoc.rejectionReason || 'Your documents did not pass verification. Upload clear, valid photos and resubmit.'}</p>
                </div>
              </div>
            )}

            {/* Reset banner */}
            {wasReset && !isRejected && (
              <div style={{ background: 'rgba(247,147,26,0.06)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 16, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(247,147,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RefreshCw size={18} style={{ color: '#F7931A' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#F7931A', margin: '0 0 4px' }}>Resubmission Required</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>Our team has requested you to resubmit your KYC documents.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* ── Section 1: Personal Details ── */}
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={15} style={{ color: '#1F77B4' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Personal Details</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Enter your government ID numbers</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* PAN */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <CreditCard size={13} style={{ color: '#1F77B4' }} />
                      PAN Number <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      {...register('panNumber')}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="input-stealth"
                      style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 16, fontWeight: 700 }}
                    />
                    {errors.panNumber
                      ? <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} />{errors.panNumber.message}</p>
                      : <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>10-character alphanumeric as on your PAN card</p>
                    }
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Hash size={13} style={{ color: '#1F77B4' }} />
                      Aadhaar Number <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      {...register('aadharNumber')}
                      placeholder="123456789012"
                      maxLength={12}
                      className="input-stealth"
                      inputMode="numeric"
                      style={{ fontFamily: 'monospace', letterSpacing: '0.12em', fontSize: 16, fontWeight: 700 }}
                    />
                    {errors.aadharNumber
                      ? <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} />{errors.aadharNumber.message}</p>
                      : <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>12-digit Aadhaar number (no spaces)</p>
                    }
                  </div>
                </div>
              </div>

              {/* ── Section 2: Document Photos ── */}
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileImage size={15} style={{ color: '#16A34A' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Document Photos</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Upload clear, readable photos</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                    background: allFilesUp ? 'rgba(22,163,74,0.1)' : 'rgba(31,119,180,0.08)',
                    color: allFilesUp ? '#16A34A' : '#1F77B4',
                    border: `1px solid ${allFilesUp ? 'rgba(22,163,74,0.2)' : 'rgba(31,119,180,0.15)'}`,
                  }}>
                    {uploadedCount}/4 uploaded
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: '#F3F4F6', borderRadius: 999, marginBottom: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(uploadedCount / 4) * 100}%`, background: allFilesUp ? 'linear-gradient(90deg,#16A34A,#22c55e)' : 'linear-gradient(90deg,#1F77B4,#2e8fd1)', borderRadius: 999, transition: 'width 0.4s ease' }} />
                </div>

                {/* Aadhaar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ height: 1, flex: 1, background: '#F3F4F6' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#1F77B4', textTransform: 'uppercase', letterSpacing: 1.2, padding: '3px 10px', background: 'rgba(31,119,180,0.08)', borderRadius: 999 }}>Aadhaar Card</span>
                    <div style={{ height: 1, flex: 1, background: '#F3F4F6' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FileUploadBox label="Front Side" fieldKey="aadhaarFront" file={files.aadhaarFront} onSet={setFile} onPreview={setPreviewUrl} required attempted={attempted} />
                    <FileUploadBox label="Back Side"  fieldKey="aadhaarBack"  file={files.aadhaarBack}  onSet={setFile} onPreview={setPreviewUrl} required attempted={attempted} />
                  </div>
                </div>

                {/* PAN */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ height: 1, flex: 1, background: '#F3F4F6' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 1.2, padding: '3px 10px', background: 'rgba(124,58,237,0.08)', borderRadius: 999 }}>PAN Card</span>
                    <div style={{ height: 1, flex: 1, background: '#F3F4F6' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FileUploadBox label="Front Side" fieldKey="panFront" file={files.panFront} onSet={setFile} onPreview={setPreviewUrl} required attempted={attempted} />
                    <FileUploadBox label="Back Side"  fieldKey="panBack"  file={files.panBack}  onSet={setFile} onPreview={setPreviewUrl} required attempted={attempted} />
                  </div>
                </div>

                {attempted && !allFilesUp && (
                  <p style={{ marginTop: 12, fontSize: 11.5, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={13} />{4 - uploadedCount} photo{4 - uploadedCount !== 1 ? 's' : ''} still missing
                  </p>
                )}
              </div>

              {/* ── Section 3: Submit ── */}
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                {/* Checklist */}
                {!canSubmit && (
                  <div style={{ marginBottom: 20, background: '#F9FAFB', borderRadius: 16, padding: '14px 18px', border: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Complete to submit:</p>
                    {[
                      { done: panValue.length === 10,   label: 'PAN number (10 chars)' },
                      { done: aadharValue.length === 12, label: 'Aadhaar number (12 digits)' },
                      { done: allFilesUp,                label: `All 4 photos (${uploadedCount}/4)` },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {c.done
                          ? <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                          : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #D1D5DB', flexShrink: 0 }} />}
                        <span style={{ fontSize: 12, color: c.done ? '#16A34A' : '#6B7280', fontWeight: c.done ? 600 : 400 }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  onClick={() => setAttempted(true)}
                  style={{
                    width: '100%', padding: '15px 24px', borderRadius: 16,
                    background: canSubmit
                      ? 'linear-gradient(135deg, #0B1929 0%, #1F77B4 100%)'
                      : '#E5E7EB',
                    color: canSubmit ? '#fff' : '#9CA3AF',
                    border: 'none',
                    fontWeight: 800, fontSize: 15, cursor: canSubmit ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: canSubmit ? '0 6px 24px rgba(11,25,41,0.25)' : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  {submitting
                    ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading & Verifying...</>
                    : <><ShieldCheck size={18} /> Submit for Verification</>}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={11} />
                  All data is encrypted and stored securely. DPDP Act 2023 compliant.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
