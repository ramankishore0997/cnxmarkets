import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminTransactions, useUpdateAdminTransaction } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Check, X, Loader2, Clock,
  ArrowDownLeft, ArrowUpRight,
  CheckCircle, XCircle,
  Smartphone, Bitcoin, Building2,
} from 'lucide-react';

type Tab = 'all' | 'deposits' | 'withdrawals';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    approved:  { icon: CheckCircle, color: '#02C076' },
    pending:   { icon: Clock,       color: '#00C274' },
    rejected:  { icon: XCircle,     color: '#CF304A' },
    completed: { icon: CheckCircle, color: '#02C076' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${s.color}20`, color: s.color }}>
      <s.icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function MethodBadge({ method, type }: { method: string; type: string }) {
  if (type === 'withdrawal') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#00C274]/20 text-[#00C274]">
        <Building2 className="w-3 h-3" /> Bank
      </span>
    );
  }
  if (method === 'upi') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#02C076]/20 text-[#02C076]">
        <Smartphone className="w-3 h-3" /> UPI
      </span>
    );
  }
  if (method === 'crypto_usdt') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#00C274]/20 text-[#00C274]">
        <Bitcoin className="w-3 h-3" /> USDT
      </span>
    );
  }
  return <span className="text-xs text-[#848E9C] capitalize">{(method || '').replace('_', ' ')}</span>;
}

function fmtAmount(tx: any) {
  const n = Number(tx.amount).toLocaleString('en-IN');
  if (tx.currency === 'INR' || !tx.currency) return `₹${n}`;
  return `${n} ${tx.currency}`;
}

export function AdminTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('all');

  const { data: transactions, isLoading } = useGetAdminTransactions({ ...getAuthOptions() });

  const updateMutation = useUpdateAdminTransaction({
    ...getAuthOptions(),
    mutation: {
      onSuccess: (_: any, vars: any) => {
        const approved = vars.data.status === 'approved';
        toast({
          title: approved ? 'Transaction Approved' : 'Transaction Rejected',
          description: approved
            ? (vars.type === 'withdrawal' ? 'Balance deducted successfully.' : 'Balance has been updated successfully.')
            : 'Request has been rejected.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
        setProcessingId(null);
      },
      onError: () => {
        toast({ title: 'Action failed', description: 'Please try again.' });
        setProcessingId(null);
      },
    },
  });

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    updateMutation.mutate({ id, data: { status } });
  };

  const allTx       = (transactions as any[]) || [];
  const deposits    = allTx.filter((t) => t.type === 'deposit');
  const withdrawals = allTx.filter((t) => t.type === 'withdrawal');
  const pending     = allTx.filter((t) => t.status === 'pending');

  const tabData: Record<Tab, any[]> = { all: allTx, deposits, withdrawals };
  const displayed = tabData[tab];
  const displayedPending = displayed.filter((t) => t.status === 'pending');

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#00C274]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Transaction Approvals</h1>
        <p className="text-[#848E9C] font-medium">Manually verify and approve client deposit &amp; withdrawal requests</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending',      value: pending.length,                                       color: '#00C274' },
          { label: 'Deposits',     value: deposits.length,                                      color: '#02C076' },
          { label: 'Withdrawals',  value: withdrawals.length,                                   color: '#848E9C' },
          { label: 'Approved',     value: allTx.filter((t) => t.status === 'approved').length,  color: '#02C076' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-stealth p-4">
            <p className="text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-6 p-1 bg-[#1E2329] rounded-xl w-fit border border-[#181B23]">
        {([
          { key: 'all',         label: 'All Transactions',  count: allTx.length },
          { key: 'deposits',    label: 'Deposits',           count: deposits.length },
          { key: 'withdrawals', label: 'Withdrawals',        count: withdrawals.length },
        ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
              tab === key
                ? 'bg-[#00C274] text-black'
                : 'text-[#848E9C] hover:text-white'
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${tab === key ? 'bg-black/20 text-black' : 'bg-[#181B23] text-[#848E9C]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Pending queue */}
      {displayedPending.length > 0 && (
        <div className="card-stealth overflow-hidden mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#181B23]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00C274]/20 border border-[#00C274]/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#00C274]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Pending Verification Queue</h2>
                <p className="text-xs text-[#848E9C]">Check your bank / wallet, then approve or reject</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00C274] text-black text-xs font-black">
              {displayedPending.length} pending
            </span>
          </div>

          <div className="divide-y divide-[#181B23]">
            {displayedPending.map((tx: any) => (
              <div key={tx.id} className="px-6 py-5 hover:bg-[#181B23]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      tx.type === 'deposit'
                        ? 'bg-[#02C076]/20 border-[#02C076]/30'
                        : 'bg-[#00C274]/20 border-[#00C274]/30'
                    }`}>
                      {tx.type === 'deposit'
                        ? <ArrowDownLeft className="w-5 h-5 text-[#02C076]" />
                        : <ArrowUpRight  className="w-5 h-5 text-[#00C274]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm">{tx.userName}</p>
                      <p className="text-xs text-[#848E9C] mb-2">{tx.userEmail}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-black text-white">{fmtAmount(tx)}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                          tx.type === 'deposit' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#00C274]/20 text-[#00C274]'
                        }`}>
                          {tx.type}
                        </span>
                        <MethodBadge method={tx.paymentMethod} type={tx.type} />
                      </div>

                      {/* Deposit: UPI ID */}
                      {tx.type === 'deposit' && tx.transactionReference && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#060709] border border-[#181B23]">
                          <Smartphone className="w-3.5 h-3.5 text-[#848E9C]" />
                          <span className="text-xs text-[#848E9C] font-medium">UPI ID:</span>
                          <span className="text-xs font-bold text-[#EAECEF] font-mono">{tx.transactionReference}</span>
                        </div>
                      )}

                      {/* Withdrawal: Bank Details */}
                      {tx.type === 'withdrawal' && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="px-3 py-2 rounded-lg bg-[#060709] border border-[#181B23]">
                            <p className="text-[10px] text-[#848E9C] font-medium mb-0.5">Bank</p>
                            <p className="text-xs font-bold text-[#EAECEF]">{tx.bankName || '—'}</p>
                          </div>
                          <div className="px-3 py-2 rounded-lg bg-[#060709] border border-[#181B23]">
                            <p className="text-[10px] text-[#848E9C] font-medium mb-0.5">Account No.</p>
                            <p className="text-xs font-bold text-[#EAECEF] font-mono">{tx.accountNumber || '—'}</p>
                          </div>
                          <div className="px-3 py-2 rounded-lg bg-[#060709] border border-[#181B23]">
                            <p className="text-[10px] text-[#848E9C] font-medium mb-0.5">IFSC</p>
                            <p className="text-xs font-bold text-[#EAECEF] font-mono uppercase">{tx.ifscCode || '—'}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-[#848E9C] mt-2">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(tx.id, 'approved')}
                      disabled={processingId === tx.id}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#02C076]/20 text-[#02C076] hover:bg-[#02C076]/30 border border-[#02C076]/30 font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {processingId === tx.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(tx.id, 'rejected')}
                      disabled={processingId === tx.id}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CF304A]/20 text-[#CF304A] hover:bg-[#CF304A]/30 border border-[#CF304A]/30 font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full history table */}
      <div className="card-stealth overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181B23]">
          <h2 className="text-base font-bold text-white">
            {tab === 'all' ? 'All Transaction History' : tab === 'deposits' ? 'Deposit History' : 'Withdrawal History'}
          </h2>
          <span className="text-xs text-[#848E9C]">{displayed.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181B23]/60">
              <tr>
                {['User', 'Type', 'Amount', 'Method / Bank', 'Details', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-[#848E9C] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181B23]">
              {displayed.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-[#181B23]/40 transition-colors text-[#EAECEF]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-white text-sm whitespace-nowrap">{tx.userName}</p>
                    <p className="text-xs text-[#848E9C]">{tx.userEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      tx.type === 'deposit' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#00C274]/20 text-[#00C274]'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-white whitespace-nowrap">{fmtAmount(tx)}</td>
                  <td className="px-5 py-4">
                    {tx.type === 'withdrawal'
                      ? <span className="text-xs text-[#EAECEF] font-medium">{tx.bankName || '—'}</span>
                      : <MethodBadge method={tx.paymentMethod} type={tx.type} />
                    }
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#848E9C]">
                    {tx.type === 'deposit'
                      ? (tx.transactionReference || '—')
                      : tx.accountNumber
                        ? <span>{tx.accountNumber}<span className="ml-1 text-[#00C274]">· {tx.ifscCode}</span></span>
                        : '—'
                    }
                  </td>
                  <td className="px-5 py-4 text-xs text-[#848E9C] whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={tx.status} /></td>
                  <td className="px-5 py-4">
                    {tx.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAction(tx.id, 'approved')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-[#02C076]/20 text-[#02C076] hover:bg-[#02C076]/40 border border-[#02C076]/30 transition-colors disabled:opacity-50"
                        >
                          {processingId === tx.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, 'rejected')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-[#CF304A]/20 text-[#CF304A] hover:bg-[#CF304A]/40 border border-[#CF304A]/30 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#848E9C] font-medium">
                    No {tab === 'all' ? 'transactions' : tab} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
