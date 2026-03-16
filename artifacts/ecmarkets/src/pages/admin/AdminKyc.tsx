import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminKyc, useUpdateAdminKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, ShieldCheck, ExternalLink, FileImage, User, Calendar } from 'lucide-react';

export function AdminKyc() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

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

  const statusColors: Record<string, { color: string; bg: string }> = {
    submitted: { color: '#F0B90B', bg: '#F0B90B' },
    approved: { color: '#02C076', bg: '#02C076' },
    rejected: { color: '#CF304A', bg: '#CF304A' },
    pending: { color: '#848E9C', bg: '#848E9C' },
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
        <p className="text-[#848E9C] font-medium">Review and verify client identity documents</p>
      </div>

      {/* Stats Row */}
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

      {/* Pending */}
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
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-[#F0B90B]" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{doc.userName}</p>
                          <p className="text-[#848E9C] text-sm">{doc.userEmail}</p>
                          <div className="flex items-center gap-1.5 text-xs text-[#848E9C] mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileImage className="w-4 h-4 text-[#848E9C]" />
                            <p className="text-[#848E9C] text-xs font-semibold uppercase tracking-wider">ID Document</p>
                          </div>
                          <p className="text-white font-semibold capitalize mb-2">{(doc.idDocumentType || '').replace('_', ' ')}</p>
                          {doc.idDocumentUrl && (
                            <a href={doc.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#F0B90B] text-sm font-medium hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> View Document
                            </a>
                          )}
                        </div>
                        <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileImage className="w-4 h-4 text-[#848E9C]" />
                            <p className="text-[#848E9C] text-xs font-semibold uppercase tracking-wider">Address Proof</p>
                          </div>
                          <p className="text-white font-semibold capitalize mb-2">{(doc.addressProofType || '').replace('_', ' ')}</p>
                          {doc.addressProofUrl && (
                            <a href={doc.addressProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#F0B90B] text-sm font-medium hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> View Document
                            </a>
                          )}
                        </div>
                      </div>

                      {isRejecting && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-[#CF304A]">Rejection Reason (required)</label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explain why the document was rejected..."
                            className="input-stealth resize-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col gap-3 lg:w-44 shrink-0 justify-end">
                      <button
                        onClick={() => handleApprove(doc.id)}
                        disabled={processingId === doc.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/40 hover:bg-[#02C076]/30 font-bold transition-all"
                      >
                        {processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>

                      {isRejecting ? (
                        <>
                          <button
                            onClick={() => handleReject(doc.id)}
                            disabled={processingId === doc.id}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#CF304A] text-white font-bold hover:bg-[#CF304A]/80 transition-all"
                          >
                            {processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            Confirm
                          </button>
                          <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="flex-1 lg:flex-none px-4 py-3 rounded-xl bg-[#2B3139] text-[#848E9C] hover:text-white font-bold transition-all text-sm">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setRejectingId(doc.id)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/40 hover:bg-[#CF304A]/30 font-bold transition-all"
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

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Previously Reviewed</h2>
          <div className="card-stealth overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  {['Client', 'ID Type', 'Address Proof', 'Status', 'Date'].map((h) => (
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
                      <td className="px-6 py-4 text-[#EAECEF] capitalize">{(doc.idDocumentType || '').replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-[#EAECEF] capitalize">{(doc.addressProofType || '').replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: `${sc.bg}20`, color: sc.color }}>
                          <ShieldCheck className="w-3 h-3" /> {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#848E9C] text-xs">{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}</td>
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
