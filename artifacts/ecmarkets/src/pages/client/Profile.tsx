import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile, useChangePassword } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useAuthState } from '@/hooks/use-auth-state';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Globe, Hash, Shield, Key, CheckCircle, Loader2, Edit3, Lock } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  country: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function Profile() {
  const { user } = useAuthState();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: (user as any)?.phone || '',
      country: (user as any)?.country || '',
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const profileMutation = useUpdateProfile({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
        setEditMode(false);
      },
      onError: () => toast({ title: "Update Failed", variant: "destructive" })
    }
  });

  const passwordMutation = useChangePassword({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Password Changed", description: "Your password has been updated successfully." });
        passwordForm.reset();
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.message || "Current password may be incorrect.", variant: "destructive" })
    }
  });

  const kycStatusColor = (status: string) => {
    if (status === 'approved') return { color: '#02C076', bg: '#02C076', label: 'Verified' };
    if (status === 'submitted') return { color: '#F0B90B', bg: '#F0B90B', label: 'Under Review' };
    if (status === 'rejected') return { color: '#CF304A', bg: '#CF304A', label: 'Rejected' };
    return { color: '#848E9C', bg: '#848E9C', label: 'Not Submitted' };
  };
  const kyc = kycStatusColor((user as any)?.kycStatus || 'pending');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-[#848E9C] font-medium">Manage your personal information and account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar + Quick Info */}
        <div className="space-y-5">
          <div className="card-stealth p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#d4a017] flex items-center justify-center text-3xl font-black text-black mx-auto mb-5 shadow-[0_0_24px_rgba(240,185,11,0.4)]">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.firstName} {user?.lastName}</h2>
            <p className="text-[#848E9C] text-sm mb-4">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: `${kyc.bg}20`, color: kyc.color, border: `1px solid ${kyc.bg}40` }}>
              <Shield className="w-3.5 h-3.5" /> KYC: {kyc.label}
            </span>
          </div>

          <div className="card-stealth p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Info</h3>
            {[
              { icon: Hash, label: 'Account ID', value: `ECM-${String(user?.id || '').padStart(6, '0')}` },
              { icon: Globe, label: 'Role', value: (user?.role as string)?.charAt(0).toUpperCase() + ((user?.role as string)?.slice(1) || '') || 'Client' },
              { icon: User, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#848E9C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[#848E9C] text-xs font-medium">{item.label}</p>
                  <p className="text-white text-sm font-semibold truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Edit */}
          <div className="card-stealth p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#F0B90B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Information</h3>
                  <p className="text-[#848E9C] text-sm">Update your profile details</p>
                </div>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editMode ? 'bg-[#2B3139] text-[#848E9C]' : 'bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/30 hover:bg-[#F0B90B]/30'}`}
              >
                <Edit3 className="w-4 h-4" /> {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: User, label: 'First Name', value: user?.firstName },
                  { icon: User, label: 'Last Name', value: user?.lastName },
                  { icon: Mail, label: 'Email Address', value: user?.email },
                  { icon: Phone, label: 'Phone', value: (user as any)?.phone || '—' },
                  { icon: Globe, label: 'Country', value: (user as any)?.country || '—' },
                ].map((field, i) => (
                  <div key={i} className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <field.icon className="w-4 h-4 text-[#848E9C]" />
                      <p className="text-[#848E9C] text-xs font-semibold uppercase tracking-wider">{field.label}</p>
                    </div>
                    <p className="text-white font-semibold">{field.value || '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate({ data: d }))} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">First Name</label>
                    <input {...profileForm.register('firstName')} className="input-stealth" />
                    {profileForm.formState.errors.firstName && <p className="text-xs text-[#CF304A]">{profileForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Last Name</label>
                    <input {...profileForm.register('lastName')} className="input-stealth" />
                    {profileForm.formState.errors.lastName && <p className="text-xs text-[#CF304A]">{profileForm.formState.errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Phone Number</label>
                    <input {...profileForm.register('phone')} placeholder="+1 234 567 8900" className="input-stealth" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Country</label>
                    <select {...profileForm.register('country')} className="input-stealth appearance-none">
                      <option value="">Select country</option>
                      {['India','United States','United Kingdom','Singapore','UAE','Australia','Canada','Germany','France','Japan'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={profileMutation.isPending} className="btn-gold flex items-center gap-2 px-8">
                  {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="card-stealth p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#CF304A]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#CF304A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-[#848E9C] text-sm">Keep your account secure</p>
              </div>
            </div>
            <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate({ data: d }))} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#848E9C]">Current Password</label>
                <input {...passwordForm.register('currentPassword')} type="password" placeholder="••••••••" className="input-stealth" />
                {passwordForm.formState.errors.currentPassword && <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">New Password</label>
                  <input {...passwordForm.register('newPassword')} type="password" placeholder="••••••••" className="input-stealth" />
                  {passwordForm.formState.errors.newPassword && <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Confirm New Password</label>
                  <input {...passwordForm.register('confirmPassword')} type="password" placeholder="••••••••" className="input-stealth" />
                  {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4">
                <Key className="w-4 h-4 text-[#F0B90B] shrink-0" />
                <p className="text-[#848E9C] text-xs">Use at least 8 characters with a mix of letters and numbers.</p>
              </div>
              <button type="submit" disabled={passwordMutation.isPending} className="btn-ghost flex items-center gap-2 px-8">
                {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
