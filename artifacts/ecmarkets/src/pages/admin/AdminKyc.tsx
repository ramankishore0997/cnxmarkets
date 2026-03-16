import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminKyc, useUpdateAdminKyc, useDeleteAdminKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Check, X, Loader2, ShieldCheck, User, Calendar,
  CreditCard, Hash, ImageIcon, Trash2, Eye, EyeOff
} from 'lucide-react';

function ImagePreview({ url, label }: { url?: string | null; label: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return (
    <div className="bg-[#0B0E11] border border-dashed border-[#2B3139] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-[#848E9C] text-xs text-center min-h-[80px]">
      <ImageIcon className="w-6 h-6" />
      <span>{label}</span>
      <span className="text-[#2B3139]">Not uploaded</span>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-[#848E9C] font-semibold">{label}</p>
      {open ? (
        <div className="relative">
          <img src={url} alt={label} className="w-full rounded-xl border border-[#2B3139] max-h-48 object-cover" />
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3 text-[#F0B90B] text-xs font-medium hover:border-[#F0B90B]/40 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View Image
        </button>
      )}
    </div>
  );
}

export function AdminKyc() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: docs, isLoading } = useGetAdminKyc({ ...getAuthOptions() });

  const updateMutation = useUpdateAdminKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Status Updated", description: "The client has been notified." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
        setProcessingId(null);
        setRejectingId(null);
        setRejectReason('');
      },
      onError: () => toast({ title: "Failed", description: "Could not update KYC status.", variant: "destructive" })
    }
  });

  const deleteMutation = useDeleteAdminKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Deleted", description: "Record removed and user status reset to pending." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
        setDeletingId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" })
    }
  });

  const handleApprove = (id: number) => {
    setProcessingId(id);
    updateMutation.mutate({ id, data: { status: 'approved' } });
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) {
      toast({ title: "Rejection reason required", variant: "destructive" });
      return;
    }
    setProcessingId(id);
    updateMutation.mutate({ id, data: { status: 'rejected', rejectionReason: rejectReason } });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this KYC record? The user\'s status will be reset to pending.')) return;
    setDeletingId(id);
    deleteMutation.mutate({ id });
  };

  const statusColors: Record<string, { color: string }> = {
    submitted: { color: '#F0B90B' },
    approved: { color: '#02C076' },
    rejected: { color: '#CF304A' },
    pending: { color: '#848E9C' },
  };

  const allDocs = (docs as any[]) || [];
  const pending = allDocs.filter((d: any) => d.status === 'submitted');
  const reviewed = allDocs.filter((d: any) => d.status !== 'submitted');

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">KYC Approvals</h1>
        <p className="text-[#848E9C] font-medium">Review PAN & Aadhar identity documents</p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Pending Review', value: pending.length, color: '#F0B90B' },
          { label: 'Approved', value: allDocs.filter((d: any) => d.status === 'approved').length, color: '#02C076' },
          { label: 'Rejected', value: allDocs.filter((d: any) => d.status === 'rejected').length, color: '#CF304A' },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5 text-center">
            <p className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#848E9C] text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F0B90B] animate-pulse inline-block"></span> Pending Review
          </h2>
          <div className="space-y-4">
            {pending.map((doc: any) => {
              const isRejecting = rejectingId === doc.id;
              return (
                <div key={doc.id} className="card-stealth-gold p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-[#F0B90B]" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{doc.userName}</p>
                          <p className="text-[#848E9C] text-sm">{doc.userEmail}</p>
                          <div className="flex items-center gap-1.5 text-xs text-[#848E9C] mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN') : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#CF304A]/10 text-[#CF304A] border border-[#CF304A]/20 hover:bg-[#CF304A]/20 text-xs font-bold transition-all"
                      >
                        {deletingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-[#F0B90B]" />
                          <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-wider">PAN Card</p>
                        </div>
                        {doc.panNumber && (
                          <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-[#848E9C]" />
                            <span className="text-white font-mono text-sm font-bold">{doc.panNumber}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <ImagePreview url={doc.panCardFrontUrl} label="Front" />
                          <ImagePreview url={doc.panCardBackUrl} label="Back" />
                        </div>
                      </div>

                      <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-[#2a6df4]" />
                          <p className="text-[#2a6df4] text-xs font-bold uppercase tracking-wider">Aadhar Card</p>
                        </div>
                        {doc.aadharNumber && (
                          <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-[#848E9C]" />
                            <span className="text-white font-mono text-sm font-bold">{doc.aadharNumber}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <ImagePreview url={doc.aadharCardFrontUrl} label="Front" />
                          <ImagePreview url={doc.aadharCardBackUrl} label="Back" />
                        </div>
                      </div>
                    </div>

                    {isRejecting && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#CF304A]">Rejection Reason (required)</label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why the documents were rejected..."
                          className="input-stealth resize-none"
                          rows={2}
                        />
                      </div>
                    )}

                    <div className="flex flex-row gap-3 justify-end">
                      <button
                        onClick={() => handleApprove(doc.id)}
                        disabled={processingId === doc.id}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold transition-all"
                      >
                        {processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>

                      {isRejecting ? (
                        <>
                          <button
                            onClick={() => handleReject(doc.id)}
                            disabled={processingId === doc.id}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#CF304A] text-white font-bold hover:bg-[#CF304A]/80 transition-all"
                          >
                            {processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            Confirm Reject
                          </button>
                          <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-5 py-2.5 rounded-xl bg-[#2B3139] text-[#848E9C] hover:text-white font-bold transition-all text-sm">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setRejectingId(doc.id)}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/40 hover:bg-[#CF304A]/30 font-bold transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Previously Reviewed</h2>
          <div className="card-stealth overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  {['Client', 'PAN Number', 'Aadhar Number', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {reviewed.map((doc: any) => {
                  const sc = statusColors[doc.status] || statusColors.pending;
                  return (
                    <tr key={doc.id} className="hover:bg-[#2B3139]/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{doc.userName}</p>
                        <p className="text-xs text-[#848E9C]">{doc.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#EAECEF] text-sm">{doc.panNumber || '—'}</td>
                      <td className="px-6 py-4 font-mono text-[#EAECEF] text-sm">{doc.aadharNumber ? `XXXX XXXX ${doc.aadharNumber.slice(-4)}` : '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: `${sc.color}20`, color: sc.color }}>
                          <ShieldCheck className="w-3 h-3" /> {doc.status}
                        </span>
                        {doc.rejectionReason && <p className="text-xs text-[#848E9C] mt-1 max-w-xs truncate">{doc.rejectionReason}</p>}
                      </td>
                      <td className="px-6 py-4 text-[#848E9C] text-xs">{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#CF304A]/10 text-[#CF304A] border border-[#CF304A]/20 hover:bg-[#CF304A]/20 text-xs font-bold transition-all"
                        >
                          {deletingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allDocs.length === 0 && (
        <div className="card-stealth p-16 text-center">
          <ShieldCheck className="w-16 h-16 text-[#2B3139] mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">No KYC submissions yet</h3>
          <p className="text-[#848E9C]">Client documents will appear here when submitted.</p>
        </div>
      )}
    </AdminLayout>
  );
}
