import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useSendAdminNotification, useGetAdminUsers } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, Bell, Users, User, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type NotifType = 'info' | 'success' | 'warning' | 'error';

const typeOptions: { value: NotifType; label: string; icon: any; color: string }[] = [
  { value: 'info', label: 'Info', icon: Info, color: '#2a6df4' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: '#16A34A' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: '#1F77B4' },
  { value: 'error', label: 'Alert', icon: AlertTriangle, color: '#DC2626' },
];

export function AdminNotifications() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotifType>('info');
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [sent, setSent] = useState(false);

  const { data: users } = useGetAdminUsers({ ...getAuthOptions() });
  const allUsers = (users as any[]) || [];

  const sendMutation = useSendAdminNotification({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Notification Sent", description: target === 'all' ? "Broadcast sent to all clients." : "Notification sent to the selected client." });
        setSent(true);
        setTitle(''); setMessage(''); setType('info'); setTarget('all'); setTargetUserId('');
        setTimeout(() => setSent(false), 4000);
      },
      onError: () => toast({ title: "Failed to send", variant: "destructive" })
    }
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Title and message are required.", variant: "destructive" });
      return;
    }
    if (target === 'user' && !targetUserId) {
      toast({ title: "Please select a user.", variant: "destructive" });
      return;
    }
    sendMutation.mutate({
      data: {
        title,
        message,
        type,
        ...(target === 'user' ? { targetUserId: parseInt(targetUserId) } : {}),
      }
    });
  };

  const selectedType = typeOptions.find((t) => t.value === type) || typeOptions[0];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Send Notifications</h1>
        <p className="text-[#6B7280] font-medium">Broadcast platform updates or send targeted alerts to specific clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-stealth p-8">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#16A34A]/20 border border-[#16A34A]/40 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[#16A34A]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Notification Sent!</h3>
              <p className="text-[#6B7280]">{target === 'all' ? `Sent to all ${allUsers.length} clients.` : 'Sent to the selected client.'}</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#1F77B4]" /> Compose Notification
              </h3>

              <div className="space-y-5">
                {/* Target */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6B7280]">Recipient</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'all', label: 'All Clients', icon: Users, desc: `${allUsers.length} users` },
                      { value: 'user', label: 'Specific Client', icon: User, desc: 'Select one' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTarget(opt.value as 'all' | 'user')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${target === opt.value ? 'border-[#1F77B4] bg-[#1F77B4]/10' : 'border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#1F77B4]/40'}`}
                      >
                        <opt.icon className={`w-5 h-5 ${target === opt.value ? 'text-[#1F77B4]' : 'text-[#6B7280]'}`} />
                        <div>
                          <p className={`font-bold text-sm ${target === opt.value ? 'text-[#1F77B4]' : 'text-white'}`}>{opt.label}</p>
                          <p className="text-[#6B7280] text-xs">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {target === 'user' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#6B7280]">Select Client</label>
                    <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="input-stealth appearance-none">
                      <option value="">— Choose a client —</option>
                      {allUsers.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6B7280]">Notification Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {typeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setType(opt.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${type === opt.value ? 'border-opacity-80' : 'border-[#E5E7EB] bg-[#FFFFFF] hover:border-opacity-40'}`}
                        style={type === opt.value ? { borderColor: opt.color, background: `${opt.color}15` } : {}}
                      >
                        <opt.icon className="w-4 h-4" style={{ color: type === opt.value ? opt.color : '#6B7280' }} />
                        <span className="text-xs font-bold" style={{ color: type === opt.value ? opt.color : '#6B7280' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6B7280]">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Strategy Update Available" className="input-stealth" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6B7280]">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your notification message here..."
                    className="input-stealth resize-none"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !title.trim() || !message.trim()}
                  className="w-full btn-gold flex items-center justify-center gap-2 text-base"
                >
                  {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {target === 'all' ? `Send to All Clients (${allUsers.length})` : 'Send to Client'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-5">
          <div className="card-stealth p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Preview</h3>
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${selectedType.color}20` }}>
                  <selectedType.icon className="w-5 h-5" style={{ color: selectedType.color }} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{title || 'Notification Title'}</p>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{message || 'Your notification message will appear here...'}</p>
                  <p className="text-[#E5E7EB] text-xs mt-2 font-medium">Just now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-stealth p-6 border-l-4 border-l-[#1F77B4]">
            <h3 className="text-sm font-bold text-white mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {[
                { t: 'Deposit Approved', m: 'Your deposit has been approved and credited to your account.' },
                { t: 'Withdrawal Processed', m: 'Your withdrawal request has been processed successfully.' },
                { t: 'Strategy Update', m: 'A strategy you are subscribed to has been updated with new parameters.' },
                { t: 'Maintenance Notice', m: 'Scheduled maintenance is planned. Trading will continue uninterrupted.' },
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => { setTitle(tpl.t); setMessage(tpl.m); }}
                  className="w-full text-left p-3 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#1F77B4]/40 transition-all group"
                >
                  <p className="text-white text-xs font-bold group-hover:text-[#1F77B4] transition-colors">{tpl.t}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5 truncate">{tpl.m}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
