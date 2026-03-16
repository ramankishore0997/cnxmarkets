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

  if (isLoading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Transaction Approvals</h1>
        <p className="text-muted-foreground">Review and process client deposits and withdrawals</p>
      </div>

      <div className="bg-card/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-white/5 text-white font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{tx.userName}</p>
                    <p className="text-xs">{tx.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-white">
                    {tx.currency} {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 capitalize text-white">
                    {tx.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(tx.id, 'approved')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                          {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleAction(tx.id, 'rejected')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
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
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
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
