import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStats } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { Users, FileCheck, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    ...getAuthOptions()
  });

  if (isLoading) {
    return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Global statistics and pending actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Users className="w-32 h-32" />
          </div>
          <p className="text-muted-foreground font-medium mb-2">Total Users</p>
          <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-green-400 mt-2">{stats?.activeUsers || 0} active</p>
        </div>

        <div className="bg-card/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <ArrowDownToLine className="w-32 h-32" />
          </div>
          <p className="text-muted-foreground font-medium mb-2">Total Deposits</p>
          <p className="text-4xl font-bold text-white">${stats?.totalDeposits?.toLocaleString() || 0}</p>
          <p className="text-sm text-yellow-400 mt-2">{stats?.pendingDeposits || 0} pending</p>
        </div>

        <div className="bg-card/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <ArrowUpFromLine className="w-32 h-32" />
          </div>
          <p className="text-muted-foreground font-medium mb-2">Total Withdrawals</p>
          <p className="text-4xl font-bold text-white">${stats?.totalWithdrawals?.toLocaleString() || 0}</p>
          <p className="text-sm text-yellow-400 mt-2">{stats?.pendingWithdrawals || 0} pending</p>
        </div>

        <div className="bg-card/50 border border-accent/30 p-6 rounded-2xl relative overflow-hidden bg-accent/5">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <FileCheck className="w-32 h-32 text-accent" />
          </div>
          <p className="text-accent font-medium mb-2">Pending KYC</p>
          <p className="text-4xl font-bold text-white">{stats?.pendingKyc || 0}</p>
          <p className="text-sm text-muted-foreground mt-2">Requires review</p>
        </div>
      </div>
    </AdminLayout>
  );
}
