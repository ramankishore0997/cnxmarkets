import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStats } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { Users, FileCheck, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    ...getAuthOptions()
  });

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-[#848E9C] font-medium">Global statistics and pending actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-stealth p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Users className="w-32 h-32 text-white" />
          </div>
          <p className="text-[#848E9C] font-semibold uppercase tracking-wider text-sm mb-2">Total Users</p>
          <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-[#02C076] font-medium mt-2">{stats?.activeUsers || 0} active</p>
        </div>

        <div className="card-stealth p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ArrowDownToLine className="w-32 h-32 text-white" />
          </div>
          <p className="text-[#848E9C] font-semibold uppercase tracking-wider text-sm mb-2">Total Deposits</p>
          <p className="text-4xl font-bold text-white">${stats?.totalDeposits?.toLocaleString() || 0}</p>
          <p className="text-sm text-[#F0B90B] font-medium mt-2">{stats?.pendingDeposits || 0} pending</p>
        </div>

        <div className="card-stealth p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ArrowUpFromLine className="w-32 h-32 text-white" />
          </div>
          <p className="text-[#848E9C] font-semibold uppercase tracking-wider text-sm mb-2">Total Withdrawals</p>
          <p className="text-4xl font-bold text-white">${stats?.totalWithdrawals?.toLocaleString() || 0}</p>
          <p className="text-sm text-[#F0B90B] font-medium mt-2">{stats?.pendingWithdrawals || 0} pending</p>
        </div>

        <div className="card-stealth-gold p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <FileCheck className="w-32 h-32 text-[#F0B90B]" />
          </div>
          <p className="text-[#F0B90B] font-semibold uppercase tracking-wider text-sm mb-2">Pending KYC</p>
          <p className="text-4xl font-bold text-white">{stats?.pendingKyc || 0}</p>
          <p className="text-sm text-[#848E9C] font-medium mt-2">Requires review</p>
        </div>
      </div>
    </AdminLayout>
  );
}