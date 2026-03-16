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

  if (isLoading) return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Approvals</h1>
        <p className="text-gray-500 font-medium">Review and process client deposits and withdrawals</p>
      </div>

      <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{tx.userName}</p>
                    <p className="text-xs text-gray-500">{tx.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">
                    {tx.currency} {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 capitalize font-semibold text-gray-900">
                    {tx.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(tx.id, 'approved')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                        >
                          {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleAction(tx.id, 'rejected')}
                          disabled={processingId === tx.id}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">
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
