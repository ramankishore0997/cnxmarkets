import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminKyc, useUpdateAdminKyc, useDeleteAdminKyc } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Check, X, Loader2, ShieldCheck, User, Calendar,
  CreditCard, Hash, ImageIcon, Trash2, AlertTriangle, ExternalLink,
  FileText, CheckCircle2, RefreshCw
} from 'lucide-react';

function DocThumbnail({ url, label }: { url?: string | null; label: string }) {
  const openFull = () => {
    if (!url) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>${label}</title><style>body{margin:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head><body><img src="${url}" alt="${label}" /></body></html>`);
      win.document.close();
    }
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-full h-16 bg-[#FFFFFF] border border-dashed border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center gap-1">
          <ImageIcon className="w-4 h-4 text-[#E5E7EB]" />
          <span className="text-[9px] text-[#E5E7EB]">Not uploaded</span>
        </div>
        <span className="text-[10px] text-[#6B7280] font-medium text-center">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={openFull}
        className="group relative w-full h-16 rounded-lg overflow-hidden border border-[#E5E7EB] hover:border-[#1F77B4]/60 transition-all"
        title={`Click to open ${label} in full screen`}
      >
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-full h-full bg-[#F7F9FC] flex flex-col items-center justify-center gap-1"><span style="font-size:18px">🖼</span><span style="font-size:9px;color:#6B7280">Click to open</span></div>';
            }
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ExternalLink className="w-4 h-4 text-white drop-shadow" />
        </div>
      </button>
      <span className="text-[10px] text-[#6B7280] font-medium text-center">{label}</span>
    </div>
  );
}

function DocCount({ doc }: { doc: any }) {
  const fields = [doc.panCardFrontUrl, doc.panCardBackUrl, doc.aadharCardFrontUrl, doc.aadharCardBackUrl];
  const count = fields.filter(f => f && f.length > 5).length;
  const color = count === 4 ? '#16A34A' : count > 0 ? '#1F77B4' : '#DC2626';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: `${color}20`, color }}>
      <FileText className="w-3 h-3" />
      {count}/4 docs
    </span>
  );
}

export function AdminKyc() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: docs, isLoading, isFetching, isError, refetch } = useGetAdminKyc({
    ...getAuthOptions(),
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchInterval: 120_000,
      staleTime: 60_000,
      retry: 1,
    }
  });

  const updateMutation = useUpdateAdminKyc({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC Status Updated", description: "The client's verification status has been updated." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
      toast({ title: "Rejection reason required", description: "Please enter a reason before rejecting.", variant: "destructive" });
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

  const allDocs = (docs as any[]) || [];
  const pending = allDocs.filter((d: any) => d.status === 'submitted');
  const reviewed = allDocs.filter((d: any) => d.status !== 'submitted');

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#1F77B4]" /></div>
    </AdminLayout>
  );

  if (isError) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-10 h-10 text-[#DC2626]" />
        <p className="text-[#111827] font-semibold">Failed to load KYC records</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F77B4]/20 text-[#1F77B4] font-bold hover:bg-[#1F77B4]/30 transition-all">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">KYC Approvals</h1>
          <p className="text-[#6B7280] font-medium">Review PAN & Aadhar identity documents submitted by clients</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] hover:text-white hover:border-[#1F77B4]/40 transition-all font-semibold text-sm shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#1F77B4]' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Pending Review', value: pending.length, color: '#1F77B4' },
          { label: 'Approved', value: allDocs.filter((d: any) => d.status === 'approved').length, color: '#16A34A' },
          { label: 'Rejected', value: allDocs.filter((d: any) => d.status === 'rejected').length, color: '#DC2626' },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5 text-center">
            <p className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#6B7280] text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Review */}
      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F77B4] animate-pulse inline-block" />
            Pending Review
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#1F77B4]/20 text-[#1F77B4] text-xs font-bold">{pending.length}</span>
          </h2>
          <div className="space-y-5">
            {pending.map((doc: any) => {
              const isRejecting = rejectingId === doc.id;
              const isGhost = doc.noDocuments === true;
              const isProcessing = processingId === doc.id;

              return (
                <div key={doc.id} className="rounded-2xl border border-[#1F77B4]/30 bg-[#F7F9FC] overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 p-5 border-b border-[#E5E7EB]">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#1F77B4]/20 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-[#1F77B4]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#111827] text-base">{doc.userName}</p>
                          {!isGhost && <DocCount doc={doc} />}
                        </div>
                        <p className="text-[#6B7280] text-sm">{doc.userEmail}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Submitted: {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    {!isGhost && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 hover:bg-[#DC2626]/20 text-xs font-bold transition-all"
                      >
                        {deletingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-5">
                    {isGhost ? (
                      <div className="flex items-start gap-3 bg-[#1F77B4]/10 border border-[#1F77B4]/30 rounded-xl p-4">
                        <AlertTriangle className="w-5 h-5 text-[#1F77B4] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-[#1F77B4] mb-1">No documents uploaded via portal</p>
                          <p className="text-xs text-[#6B7280]">
                            This client's KYC was marked as pending manually but no documents were uploaded through the dashboard.
                            Ask the client to submit their PAN & Aadhar via their dashboard KYC page, or manually approve if documents were received offline.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Document thumbnails — always visible, no click required */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* PAN Card */}
                          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <CreditCard className="w-4 h-4 text-[#1F77B4]" />
                              <p className="text-[#1F77B4] text-xs font-bold uppercase tracking-wider">PAN Card</p>
                              {doc.panNumber && (
                                <div className="ml-auto flex items-center gap-1.5 bg-[#1F77B4]/10 px-2 py-0.5 rounded-lg">
                                  <Hash className="w-3 h-3 text-[#1F77B4]" />
                                  <span className="text-[#111827] font-mono text-xs font-bold">{doc.panNumber}</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <DocThumbnail url={doc.panCardFrontUrl} label="Front Side" />
                              <DocThumbnail url={doc.panCardBackUrl} label="Back Side" />
                            </div>
                          </div>

                          {/* Aadhar Card */}
                          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <CreditCard className="w-4 h-4 text-[#2a6df4]" />
                              <p className="text-[#2a6df4] text-xs font-bold uppercase tracking-wider">Aadhar Card</p>
                              {doc.aadharNumber && (
                                <div className="ml-auto flex items-center gap-1.5 bg-[#2a6df4]/10 px-2 py-0.5 rounded-lg">
                                  <Hash className="w-3 h-3 text-[#2a6df4]" />
                                  <span className="text-[#111827] font-mono text-xs font-bold">XXXX XXXX {String(doc.aadharNumber).replace(/\s/g,'').slice(-4)}</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <DocThumbnail url={doc.aadharCardFrontUrl} label="Front Side" />
                              <DocThumbnail url={doc.aadharCardBackUrl} label="Back Side" />
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#6B7280] text-center">
                          Click on any thumbnail to view the full document in a new tab
                        </p>
                      </>
                    )}

                    {/* Rejection reason input */}
                    {isRejecting && !isGhost && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#DC2626] flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" /> Rejection Reason <span className="text-[#6B7280] font-normal text-xs">(required)</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why the documents were rejected (e.g. blurry image, name mismatch)..."
                          className="input-stealth resize-none text-sm"
                          rows={3}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Action buttons — BIG and prominent */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#E5E7EB]">
                      <button
                        onClick={() => handleApprove(doc.id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#16A34A] text-black font-bold text-base hover:bg-[#16A34A]/80 transition-all disabled:opacity-50"
                      >
                        {isProcessing && !isRejecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        ✓ Approve KYC
                      </button>

                      {!isGhost && (
                        isRejecting ? (
                          <div className="flex-1 flex gap-2">
                            <button
                              onClick={() => handleReject(doc.id)}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#DC2626] text-white font-bold text-base hover:bg-[#DC2626]/80 transition-all disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(''); }}
                              className="px-5 py-3 rounded-xl bg-[#E5E7EB] text-[#6B7280] hover:text-white font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(doc.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border-2 border-[#DC2626]/40 hover:bg-[#DC2626]/20 font-bold text-base transition-all"
                          >
                            <X className="w-5 h-5" /> ✗ Reject KYC
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Previously Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#111827] mb-4">Previously Reviewed</h2>
          <div className="card-stealth overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Client', 'PAN Number', 'Aadhar', 'Docs', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[#6B7280] font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {reviewed.map((doc: any) => {
                  const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
                    approved: { color: '#16A34A', bg: '#16A34A20', label: 'Approved' },
                    rejected: { color: '#DC2626', bg: '#DC262620', label: 'Rejected' },
                    pending: { color: '#6B7280', bg: '#6B728020', label: 'Pending' },
                  };
                  const sc = statusStyles[doc.status] || statusStyles.pending;
                  const docCount = [doc.panCardFrontUrl, doc.panCardBackUrl, doc.aadharCardFrontUrl, doc.aadharCardBackUrl].filter(f => f && f.length > 5).length;

                  return (
                    <tr key={doc.id} className="hover:bg-[#E5E7EB]/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#111827]">{doc.userName}</p>
                        <p className="text-xs text-[#6B7280]">{doc.userEmail}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-[#374151] text-sm">{doc.panNumber || <span className="text-[#E5E7EB]">—</span>}</td>
                      <td className="px-5 py-4 font-mono text-[#374151] text-sm">
                        {doc.aadharNumber ? `XXXX ${String(doc.aadharNumber).replace(/\s/g,'').slice(-4)}` : <span className="text-[#E5E7EB]">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {doc.noDocuments ? (
                          <span className="text-xs text-[#6B7280]">Manual</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            {[doc.panCardFrontUrl, doc.panCardBackUrl, doc.aadharCardFrontUrl, doc.aadharCardBackUrl].map((url, i) => (
                              url && url.length > 5 ? (
                                <button
                                  key={i}
                                  onClick={() => {
                                    const win = window.open('', '_blank');
                                    if (win) { win.document.write(`<!DOCTYPE html><html><body style="margin:0;background:#000"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`); win.document.close(); }
                                  }}
                                  className="w-7 h-7 rounded bg-[#16A34A]/20 border border-[#16A34A]/40 flex items-center justify-center hover:bg-[#16A34A]/30 transition-colors"
                                  title={`View doc ${i + 1}`}
                                >
                                  <ExternalLink className="w-3 h-3 text-[#16A34A]" />
                                </button>
                              ) : (
                                <div key={i} className="w-7 h-7 rounded bg-[#E5E7EB] flex items-center justify-center">
                                  <ImageIcon className="w-3 h-3 text-[#6B7280]" />
                                </div>
                              )
                            ))}
                            <span className="text-xs text-[#6B7280] ml-1">{docCount}/4</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>
                          <ShieldCheck className="w-3 h-3" /> {sc.label}
                        </span>
                        {doc.rejectionReason && <p className="text-xs text-[#6B7280] mt-1 max-w-[160px] truncate">{doc.rejectionReason}</p>}
                      </td>
                      <td className="px-5 py-4 text-[#6B7280] text-xs whitespace-nowrap">
                        {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {doc.status !== 'approved' && (
                            <button
                              onClick={() => { setProcessingId(doc.id); updateMutation.mutate({ id: doc.id, data: { status: 'approved' } }); }}
                              disabled={processingId === doc.id}
                              className="px-2.5 py-1 rounded-lg bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 hover:bg-[#16A34A]/30 text-xs font-bold transition-all"
                            >
                              {processingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
                            </button>
                          )}
                          {!doc.noDocuments && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deletingId === doc.id}
                              className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 hover:bg-[#DC2626]/20 transition-all"
                              title="Delete record"
                            >
                              {deletingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
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
          {isFetching ? (
            <>
              <Loader2 className="w-10 h-10 text-[#1F77B4] animate-spin mx-auto mb-4" />
              <p className="text-[#6B7280]">Loading KYC records...</p>
            </>
          ) : (
            <>
              <ShieldCheck className="w-16 h-16 text-[#E5E7EB] mx-auto mb-6" />
              <h3 className="text-xl font-bold text-[#111827] mb-2">No KYC submissions yet</h3>
              <p className="text-[#6B7280]">Client documents will appear here as soon as they submit their PAN & Aadhar through the dashboard.</p>
              <button onClick={() => refetch()} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F77B4] hover:border-[#1F77B4]/30 mx-auto transition-all text-sm font-semibold">
                <RefreshCw className="w-3.5 h-3.5" /> Check for new submissions
              </button>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
