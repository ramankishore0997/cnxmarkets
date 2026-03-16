import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Info, AlertTriangle, CheckCircle, Loader2, Zap } from 'lucide-react';

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const mockNotifications: Notification[] = [
  { id: 1, title: 'Deposit Approved', message: 'Your deposit of $5,000 has been approved and added to your account.', type: 'success', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, title: 'Strategy Update', message: 'RazrMarket strategy has been updated with improved volatility filters.', type: 'info', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, title: 'Market Alert', message: 'High volatility detected in EUR/USD. Risk parameters adjusted automatically.', type: 'warning', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, title: 'KYC Approved', message: 'Your identity verification is complete. Full trading limits are now active.', type: 'success', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, title: 'Platform Maintenance', message: 'Scheduled maintenance on Sunday 2am–4am UTC. No trading downtime expected.', type: 'info', isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

function typeConfig(type: string) {
  switch (type) {
    case 'success': return { icon: CheckCircle, color: '#02C076', bg: '#02C076' };
    case 'warning': return { icon: AlertTriangle, color: '#F0B90B', bg: '#F0B90B' };
    case 'error': return { icon: AlertTriangle, color: '#CF304A', bg: '#CF304A' };
    default: return { icon: Info, color: '#2a6df4', bg: '#2a6df4' };
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetNotifications({ ...getAuthOptions() });
  const markRead = useMarkNotificationRead({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    }
  });

  const notifications: Notification[] = (data as any[])?.length ? (data as Notification[]) : mockNotifications;
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-[#848E9C] font-medium">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => notifications.filter(n => !n.isRead).forEach(n => markRead.mutate({ id: n.id.toString() }))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/30 text-sm font-bold hover:bg-[#F0B90B]/30 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" /></div>
      ) : notifications.length === 0 ? (
        <div className="card-stealth p-16 text-center">
          <BellOff className="w-16 h-16 text-[#2B3139] mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
          <p className="text-[#848E9C]">Platform updates, alerts, and messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unread group */}
          {notifications.filter(n => !n.isRead).length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-3 px-1">Unread</p>
              {notifications.filter(n => !n.isRead).map((notif) => {
                const cfg = typeConfig(notif.type);
                return (
                  <div
                    key={notif.id}
                    className="card-stealth p-5 mb-3 border-l-4 flex gap-4 items-start cursor-pointer hover:bg-[#1E2329] transition-all group"
                    style={{ borderLeftColor: cfg.color }}
                    onClick={() => markRead.mutate({ id: notif.id.toString() })}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cfg.bg}20`, border: `1px solid ${cfg.bg}30` }}>
                      <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-white">{notif.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[#F0B90B] animate-pulse"></div>
                          <span className="text-[#848E9C] text-xs">{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-[#848E9C] text-sm leading-relaxed">{notif.message}</p>
                      <p className="text-[#F0B90B] text-xs font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to mark as read</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Read group */}
          {notifications.filter(n => n.isRead).length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#848E9C] uppercase tracking-wider mb-3 px-1 mt-6">Earlier</p>
              {notifications.filter(n => n.isRead).map((notif) => {
                const cfg = typeConfig(notif.type);
                return (
                  <div key={notif.id} className="card-stealth p-5 mb-3 flex gap-4 items-start opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cfg.bg}10` }}>
                      <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-[#EAECEF]">{notif.title}</p>
                        <span className="text-[#848E9C] text-xs shrink-0">{timeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-[#848E9C] text-sm leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { icon: Bell, label: 'Total', value: notifications.length, color: '#F0B90B' },
          { icon: Zap, label: 'Unread', value: unread, color: '#02C076' },
          { icon: CheckCheck, label: 'Read', value: notifications.length - unread, color: '#848E9C' },
        ].map((s, i) => (
          <div key={i} className="card-stealth p-5 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[#848E9C] text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
