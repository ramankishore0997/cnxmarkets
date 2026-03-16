import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminTransactions, useUpdateAdminTransaction } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2 } from 'lucide-react';

export function AdminTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: transactions, isLoading } = useGetAdminTransactions({
    ...getAuthOptions()
  });

  const updateMutation = useUpdateAdminTransaction({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Transaction updated" });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
        setProcessingId(null);
      }
    }
  });

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    updateMutation.mutate({ id, data: { status } });
  };

  if (isLoading) return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Transaction Approvals</h1>
        <p className="text-[#848E9C] font-medium">Review and process client deposits and withdrawals</p>
      </div>

      <div className="card-stealth overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#EAECEF]">
            <thead className="bg-[#2B3139] text-[#EAECEF] font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#2B3139]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{tx.userName}</p>
                    <p className="text-xs text-[#848E9C]">{tx.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tx.type === 'deposit' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#F0B90B]/20 text-[#F0B90B]'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {tx.currency} {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-[#848E9C]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 capitalize font-semibold text-white">
                    {tx.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(tx.id, 'approved')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-[#02C076]/20 text-[#02C076] hover:bg-[#02C076]/40 transition-colors border border-[#02C076]/30"
                        >
                          {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleAction(tx.id, 'rejected')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-[#CF304A]/20 text-[#CF304A] hover:bg-[#CF304A]/40 transition-colors border border-[#CF304A]/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!transactions?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#848E9C] font-medium">
                    No transactions found
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