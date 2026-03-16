import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStats } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { Users, FileCheck, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    ...getAuthOptions()
  });

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h1>
        <p className="text-gray-500 font-medium">Global statistics and pending actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
            <Users className="w-32 h-32 text-gray-900" />
          </div>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-2">Total Users</p>
          <p className="text-4xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-green-600 font-medium mt-2">{stats?.activeUsers || 0} active</p>
        </div>

        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
            <ArrowDownToLine className="w-32 h-32 text-gray-900" />
          </div>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-2">Total Deposits</p>
          <p className="text-4xl font-bold text-gray-900">${stats?.totalDeposits?.toLocaleString() || 0}</p>
          <p className="text-sm text-yellow-600 font-medium mt-2">{stats?.pendingDeposits || 0} pending</p>
        </div>

        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
            <ArrowUpFromLine className="w-32 h-32 text-gray-900" />
          </div>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-2">Total Withdrawals</p>
          <p className="text-4xl font-bold text-gray-900">${stats?.totalWithdrawals?.toLocaleString() || 0}</p>
          <p className="text-sm text-yellow-600 font-medium mt-2">{stats?.pendingWithdrawals || 0} pending</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-[0.05]">
            <FileCheck className="w-32 h-32 text-primary" />
          </div>
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">Pending KYC</p>
          <p className="text-4xl font-bold text-gray-900">{stats?.pendingKyc || 0}</p>
          <p className="text-sm text-gray-600 font-medium mt-2">Requires review</p>
        </div>
      </div>
    </AdminLayout>
  );
}
