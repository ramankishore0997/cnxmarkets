import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useUpdateAdminUser } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Users, ShieldCheck, ShieldOff, Search, UserCheck, UserX, Loader2 } from 'lucide-react';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: users, isLoading } = useGetAdminUsers({ ...getAuthOptions() });

  const updateMutation = useUpdateAdminUser({
    ...getAuthOptions(),
    mutation: {
      onSuccess: (_, vars) => {
        toast({ title: "User Updated", description: "Changes saved successfully." });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        setProcessingId(null);
      },
      onError: () => toast({ title: "Failed", variant: "destructive" })
    }
  });

  const toggleActive = (id: number, current: boolean) => {
    setProcessingId(id);
    updateMutation.mutate({ id, data: { isActive: !current } });
  };

  const allUsers = (users as any[]) || [];
  const filtered = allUsers.filter((u: any) =>
    search === '' ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const kycColor = (status: string) => {
    if (status === 'approved') return { color: '#02C076', label: 'Verified' };
    if (status === 'submitted') return { color: '#F0B90B', label: 'Pending' };
    if (status === 'rejected') return { color: '#CF304A', label: 'Rejected' };
    return { color: '#848E9C', label: 'Not Submitted' };
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-[#848E9C] font-medium">{allUsers.length} registered client{allUsers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#848E9C]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-stealth pl-10 w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: allUsers.length, color: '#F0B90B' },
          { label: 'Active', value: allUsers.filter((u: any) => u.isActive).length, color: '#02C076' },
          { label: 'KYC Verified', value: allUsers.filter((u: any) => u.kycStatus === 'approved').length, color: '#2a6df4' },
          { label: 'Inactive', value: allUsers.filter((u: any) => !u.isActive).length, color: '#CF304A' },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5">
            <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#848E9C] text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-stealth overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 text-[#2B3139] mx-auto mb-6" />
            <p className="text-[#848E9C] font-medium">{search ? 'No users match your search.' : 'No users yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  {['Client', 'Balance', 'KYC Status', 'Account Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {filtered.map((user: any) => {
                  const kyc = kycColor(user.kycStatus);
                  return (
                    <tr key={user.id} className="hover:bg-[#2B3139]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F0B90B] flex items-center justify-center font-bold text-black text-sm shrink-0">
                            {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-[#848E9C]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">${Number(user.totalBalance || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: kyc.color }}>
                          <ShieldCheck className="w-3.5 h-3.5" /> {kyc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${user.isActive ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                          {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#848E9C] text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(user.id, user.isActive)}
                          disabled={processingId === user.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${user.isActive ? 'bg-[#CF304A]/20 text-[#CF304A] border border-[#CF304A]/30 hover:bg-[#CF304A]/30' : 'bg-[#02C076]/20 text-[#02C076] border border-[#02C076]/30 hover:bg-[#02C076]/30'}`}
                        >
                          {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (user.isActive ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />)}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
