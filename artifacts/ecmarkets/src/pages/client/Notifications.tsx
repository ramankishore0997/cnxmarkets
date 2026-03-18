import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell, BellOff, CheckCheck, Info, AlertTriangle, CheckCircle,
  Loader2, Zap, Trash2, ArrowDownLeft, ArrowUpRight,
  Shield, Megaphone, User, RefreshCw,
} from 'lucide-react';

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type FilterTab = 'all' | 'account' | 'transactions' | 'security' | 'platform';

const MOCK: Notification[] = [
  { id: 1, title: 'Deposit Approved',      message: 'Your deposit of ₹5,000 has been approved and added to your trading account balance.',              type: 'success', isRead: false, createdAt: new Date(Date.now() - 1_800_000).toISOString() },
  { id: 2, title: 'Withdrawal Requested',  message: 'Your withdrawal of ₹10,000 to HDFC Bank is under manual review. Expected: 24–48 hours.',           type: 'info',    isRead: false, createdAt: new Date(Date.now() - 4_200_000).toISOString() },
  { id: 3, title: 'KYC Approved',          message: 'Your identity verification is complete. Full trading limits are now active on your account.',       type: 'success', isRead: false, createdAt: new Date(Date.now() - 7_200_000).toISOString() },
  { id: 4, title: 'Login from New Device', message: 'A new login was detected from Chrome on Windows. If this was not you, change your password now.',   type: 'warning', isRead: true,  createdAt: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 5, title: 'Auto Trading Active',   message: 'Your account is now live. Automated trades are executing. Check your dashboard to monitor daily growth.',  type: 'success', isRead: true,  createdAt: new Date(Date.now() - 172_800_000).toISOString() },
  { id: 6, title: 'Platform Maintenance',  message: 'Scheduled maintenance on Sunday 2am–4am IST. No trading downtime is expected during this window.',  type: 'info',    isRead: true,  createdAt: new Date(Date.now() - 259_200_000).toISOString() },
  { id: 7, title: 'Security Alert',        message: 'Password changed successfully. All active sessions have been refreshed for your security.',          type: 'warning', isRead: true,  createdAt: new Date(Date.now() - 345_600_000).toISOString() },
  { id: 8, title: 'Market Update',         message: 'EUR/USD volatility spike detected. Risk parameters adjusted automatically to protect your capital.', type: 'info',    isRead: true,  createdAt: new Date(Date.now() - 432_000_000).toISOString() },
];

function getCategory(n: Notification): FilterTab {
  const t = n.title.toLowerCase();
  if (t.includes('deposit') || t.includes('withdrawal') || t.includes('transaction')) return 'transactions';
  if (t.includes('kyc') || t.includes('trading') || t.includes('auto') || t.includes('profile')) return 'account';
  if (t.includes('login') || t.includes('password') || t.includes('security')) return 'security';
  if (t.includes('maintenance') || t.includes('market') || t.includes('platform') || t.includes('update')) return 'platform';
  return 'account';
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  success: { icon: CheckCircle,   color: '#02C076', label: 'Success' },
  warning: { icon: AlertTriangle, color: '#F0B90B', label: 'Warning' },
  error:   { icon: AlertTriangle, color: '#CF304A', label: 'Alert'   },
  info:    { icon: Info,          color: '#4B7CF3', label: 'Info'    },
};

const TAB_META: Record<FilterTab, { label: string; icon: any; color: string }> = {
  all:          { label: 'All',              icon: Bell,        color: '#00C274' },
  account:      { label: 'Account',          icon: User,        color: '#02C076' },
  transactions: { label: 'Transactions',     icon: ArrowDownLeft, color: '#4B7CF3' },
  security:     { label: 'Security',         icon: Shield,      color: '#CF304A' },
  platform:     { label: 'Platform Updates', icon: Megaphone,   color: '#848E9C' },
};

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000)      return 'Just now';
  if (d < 3_600_000)   return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000)  return `${Math.floor(d / 3_600_000)}h ago`;
  if (d < 604_800_000) return `${Math.floor(d / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function NotifCard({ notif, onRead }: { notif: Notification; onRead: () => void }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => !notif.isRead && onRead()}
      className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200
        ${notif.isRead
          ? 'bg-[#1E2329]/60 border-[#2B3139] hover:border-[#2B3139]/80 hover:bg-[#1E2329]'
          : 'bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/25 cursor-pointer shadow-[0_2px_16px_rgba(0,0,0,0.3)]'
        }`}
    >
      {/* Unread left accent */}
      {!notif.isRead && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" style={{ background: cfg.color }} />
      )}

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`font-bold truncate ${notif.isRead ? 'text-[#EAECEF]' : 'text-white'}`}>
              {notif.title}
            </p>
            {!notif.isRead && (
              <span className="inline-flex shrink-0 w-2 h-2 rounded-full bg-[#F0B90B] animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#848E9C] text-xs whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
          </div>
        </div>
        <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-[#848E9C]' : 'text-[#EAECEF]'}`}>
          {notif.message}
        </p>
        {!notif.isRead && (
          <p className="text-xs font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cfg.color }}>
            Click to mark as read →
          </p>
        )}
      </div>

      {/* Read indicator */}
      {notif.isRead && (
        <div className="shrink-0 mt-0.5">
          <CheckCircle className="w-4 h-4 text-[#2B3139]" />
        </div>
      )}
    </div>
  );
}

export function Notifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cleared, setCleared] = useState<Set<number>>(new Set());

  const { data, isLoading, refetch } = useGetNotifications({ ...getAuthOptions() });
  const markReadMutation = useMarkNotificationRead({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    },
  });

  const rawList: Notification[] = ((data as any[])?.length ? (data as Notification[]) : MOCK)
    .filter((n) => !cleared.has(n.id));

  const filtered = activeTab === 'all' ? rawList : rawList.filter((n) => getCategory(n) === activeTab);
  const unread   = rawList.filter((n) => !n.isRead).length;

  const tabCount = (tab: FilterTab) =>
    tab === 'all' ? rawList.length : rawList.filter((n) => getCategory(n) === tab).length;

  const tabUnread = (tab: FilterTab) =>
    tab === 'all'
      ? unread
      : rawList.filter((n) => getCategory(n) === tab && !n.isRead).length;

  const handleMarkAll = () => {
    rawList.filter((n) => !n.isRead).forEach((n) => markReadMutation.mutate({ id: n.id.toString() }));
  };

  const handleClear = () => {
    setCleared(new Set(rawList.map((n) => n.id)));
  };

  return (
    <DashboardLayout>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-3xl font-bold text-white">Notifications</h1>
            {unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0B90B] text-black text-xs font-black">
                {unread} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-[#1E2329] border border-[#2B3139] text-[#848E9C] hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markReadMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/25 text-xs font-bold transition-all disabled:opacity-50"
              >
                {markReadMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
            {rawList.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-[#CF304A]/15 border border-[#CF304A]/30 text-[#CF304A] hover:bg-[#CF304A]/25 transition-all"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[#848E9C] text-sm font-medium mb-4">
          {unread > 0
            ? `You have ${unread} unread notification${unread !== 1 ? 's' : ''}`
            : 'All caught up — no unread notifications'}
        </p>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Total',   value: rawList.length,          color: '#F0B90B', icon: Bell },
            { label: 'Unread',  value: unread,                  color: '#02C076', icon: Zap },
            { label: 'Read',    value: rawList.length - unread, color: '#848E9C', icon: CheckCheck },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E2329] border border-[#2B3139]">
              <Icon className="w-3 h-3" style={{ color }} />
              <span className="text-sm font-bold text-white">{value}</span>
              <span className="text-xs text-[#848E9C] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-1 mb-5 -mx-4 px-4 md:-mx-1 md:px-1">
        <div className="flex gap-1.5 md:gap-2 min-w-max">
          {(Object.entries(TAB_META) as [FilterTab, typeof TAB_META[FilterTab]][]).map(([key, meta]) => {
            const count  = tabCount(key);
            const badge  = tabUnread(key);
            const active = activeTab === key;
            const Icon   = meta.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                  active
                    ? 'text-black border-transparent'
                    : 'bg-[#1E2329] border-[#2B3139] text-[#848E9C] hover:text-white hover:border-[#2B3139]/60'
                }`}
                style={active ? { background: meta.color, borderColor: meta.color } : {}}
              >
                <Icon className="w-4 h-4" />
                {meta.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-black ${
                  active ? 'bg-black/20 text-black' : 'bg-[#2B3139] text-[#848E9C]'
                }`}>
                  {count}
                </span>
                {badge > 0 && !active && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CF304A] text-white text-[10px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B] mb-3" />
          <p className="text-[#848E9C] text-sm font-medium">Loading notifications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#1E2329] border border-[#2B3139] flex items-center justify-center mb-6">
            <BellOff className="w-10 h-10 text-[#2B3139]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
          <p className="text-[#848E9C] max-w-xs leading-relaxed">
            {activeTab === 'all'
              ? 'Platform updates, alerts, and account messages will appear here.'
              : `No ${TAB_META[activeTab].label.toLowerCase()} notifications found.`}
          </p>
          {activeTab !== 'all' && (
            <button onClick={() => setActiveTab('all')} className="mt-5 px-5 py-2 rounded-xl bg-[#1E2329] border border-[#2B3139] text-[#848E9C] hover:text-white text-sm font-semibold transition-colors">
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unread group */}
          {filtered.filter((n) => !n.isRead).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-[#F0B90B] uppercase tracking-widest">
                  Unread · {filtered.filter((n) => !n.isRead).length}
                </p>
                <div className="flex-1 h-px bg-[#2B3139]" />
              </div>
              {filtered.filter((n) => !n.isRead).map((n) => (
                <NotifCard
                  key={n.id}
                  notif={n}
                  onRead={() => markReadMutation.mutate({ id: n.id.toString() })}
                />
              ))}
            </div>
          )}

          {/* Read group */}
          {filtered.filter((n) => n.isRead).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs font-bold text-[#848E9C] uppercase tracking-widest">
                  Earlier · {filtered.filter((n) => n.isRead).length}
                </p>
                <div className="flex-1 h-px bg-[#2B3139]" />
              </div>
              {filtered.filter((n) => n.isRead).map((n) => (
                <NotifCard
                  key={n.id}
                  notif={n}
                  onRead={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
