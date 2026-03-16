import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile, useChangePassword } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useAuthState } from '@/hooks/use-auth-state';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  User, Mail, Phone, Globe, Hash, Shield, Key,
  CheckCircle, Loader2, Edit3, Lock, Bell,
  Smartphone, Monitor, MessageSquare, Camera,
  ChevronRight, Calendar, BadgeCheck, Clock,
  AlertCircle, Eye, EyeOff,
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  phone:     z.string().optional(),
  country:   z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword:     z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#F0B90B]' : 'bg-[#2B3139]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SectionHeader({ icon: Icon, color, title, subtitle }: { icon: any; color: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-[#848E9C] text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] hover:border-[#F0B90B]/30 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center shrink-0 group-hover:border-[#F0B90B]/30 transition-colors">
        <Icon className="w-4 h-4 text-[#848E9C]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#848E9C] text-xs font-medium mb-0.5">{label}</p>
        <p className="text-white font-semibold text-sm truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export function Profile() {
  const { user } = useAuthState();
  const { toast } = useToast();
  const [editMode, setEditMode]           = useState(false);
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifSms, setNotifSms]           = useState(false);
  const [notifPlatform, setNotifPlatform] = useState(true);
  const [twoFa, setTwoFa]                 = useState(false);

  const kycStatus = (user as any)?.kycStatus || 'pending';
  const kycMeta: Record<string, { color: string; label: string; icon: any }> = {
    approved:  { color: '#02C076', label: 'Verified',       icon: BadgeCheck },
    submitted: { color: '#F0B90B', label: 'Under Review',   icon: Clock },
    rejected:  { color: '#CF304A', label: 'Rejected',       icon: AlertCircle },
    pending:   { color: '#848E9C', label: 'Not Submitted',  icon: AlertCircle },
  };
  const kyc = kycMeta[kycStatus] || kycMeta.pending;

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      phone:     (user as any)?.phone   || '',
      country:   (user as any)?.country || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const profileMutation = useUpdateProfile({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
        setEditMode(false);
      },
      onError: () => toast({ title: 'Update Failed', variant: 'destructive' }),
    },
  });

  const passwordMutation = useChangePassword({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
        passwordForm.reset();
      },
      onError: (err: any) => toast({ title: 'Failed', description: err?.message || 'Current password may be incorrect.', variant: 'destructive' }),
    },
  });

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const accountId = `ECM-${String(user?.id || '').padStart(6, '0')}`;

  return (
    <DashboardLayout>
      {/* ── Profile Header ─────────────────────────────────────────── */}
      <div className="card-stealth overflow-hidden mb-8">
        {/* Banner gradient */}
        <div className="h-28 bg-gradient-to-r from-[#F0B90B]/20 via-[#1E2329] to-[#02C076]/10 relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F0B90B22 0%, transparent 60%), radial-gradient(circle at 80% 50%, #02C07622 0%, transparent 60%)' }} />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            <div className="flex items-end gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#d4a017] flex items-center justify-center text-3xl font-black text-black shadow-[0_0_28px_rgba(240,185,11,0.45)] border-4 border-[#1E2329]">
                  {initials}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center hover:border-[#F0B90B]/50 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-[#848E9C]" />
                </button>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-white">{user?.firstName} {user?.lastName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-[#848E9C] text-sm">{user?.email}</span>
                  <span className="text-[#2B3139]">•</span>
                  <span className="text-[#848E9C] text-sm font-mono">{accountId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-1">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: `${kyc.color}18`, color: kyc.color, border: `1px solid ${kyc.color}35` }}>
                <kyc.icon className="w-4 h-4" /> KYC: {kyc.label}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/30">
                <span className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" /> Active
              </span>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F0B90B] text-black text-sm font-bold hover:bg-[#d4a017] transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Account Details */}
          <div className="card-stealth p-6">
            <SectionHeader icon={Hash} color="#F0B90B" title="Account Details" subtitle="Your account information" />
            <div className="space-y-3">
              <InfoRow icon={Hash}     label="Account ID"        value={accountId} />
              <InfoRow icon={User}     label="Account Type"      value="Client — Standard" />
              <InfoRow icon={Calendar} label="Member Since"      value={memberSince} />
              <InfoRow icon={Globe}    label="Country"           value={(user as any)?.country || '—'} />
            </div>
          </div>

          {/* KYC Status */}
          <div className="card-stealth p-6">
            <SectionHeader icon={kyc.icon} color={kyc.color} title="KYC Verification" subtitle="Identity verification status" />
            <div className="rounded-xl p-5 mb-4 border" style={{ background: `${kyc.color}10`, borderColor: `${kyc.color}30` }}>
              <div className="flex items-center gap-3 mb-3">
                <kyc.icon className="w-8 h-8" style={{ color: kyc.color }} />
                <div>
                  <p className="font-bold text-white">{kyc.label}</p>
                  <p className="text-xs text-[#848E9C] mt-0.5">
                    {kycStatus === 'approved'  && 'Your identity has been verified'}
                    {kycStatus === 'submitted' && 'Documents are being reviewed'}
                    {kycStatus === 'rejected'  && 'Verification was rejected'}
                    {kycStatus === 'pending'   && 'Documents not yet submitted'}
                  </p>
                </div>
              </div>
              {kycStatus === 'approved' && (
                <div className="flex flex-wrap gap-2">
                  {['PAN Card', 'Aadhaar Card'].map((doc) => (
                    <span key={doc} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#02C076]/20 text-[#02C076] text-xs font-bold">
                      <CheckCircle className="w-3 h-3" /> {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link href="/dashboard/kyc">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2B3139] hover:border-[#F0B90B]/40 transition-colors group">
                <span className="text-sm font-semibold text-[#EAECEF] group-hover:text-white transition-colors">
                  {kycStatus === 'approved' ? 'View Documents' : 'Complete KYC'}
                </span>
                <ChevronRight className="w-4 h-4 text-[#848E9C] group-hover:text-[#F0B90B] transition-colors" />
              </button>
            </Link>
          </div>

          {/* Notification Settings */}
          <div className="card-stealth p-6">
            <SectionHeader icon={Bell} color="#848E9C" title="Notifications" subtitle="Manage your alert preferences" />
            <div className="space-y-4">
              {[
                { icon: Mail,          label: 'Email Notifications',    sub: 'Deposits, withdrawals, updates', state: notifEmail,    set: setNotifEmail },
                { icon: Smartphone,    label: 'SMS Alerts',             sub: 'Critical security alerts',       state: notifSms,      set: setNotifSms },
                { icon: Monitor,       label: 'Platform Notifications', sub: 'In-app activity alerts',         state: notifPlatform, set: setNotifPlatform },
              ].map(({ icon: Icon, label, sub, state, set }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E11] border border-[#2B3139] hover:border-[#2B3139]/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#1E2329] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#848E9C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{label}</p>
                      <p className="text-xs text-[#848E9C] truncate">{sub}</p>
                    </div>
                  </div>
                  <Toggle checked={state} onChange={set} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (span 2) ────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Personal Information */}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  editMode
                    ? 'bg-[#2B3139] border-[#2B3139] text-[#848E9C] hover:text-white'
                    : 'bg-[#F0B90B]/15 border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/25'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={User}  label="First Name"    value={user?.firstName} />
                <InfoRow icon={User}  label="Last Name"     value={user?.lastName} />
                <InfoRow icon={Mail}  label="Email Address" value={user?.email} />
                <InfoRow icon={Phone} label="Phone Number"  value={(user as any)?.phone || '—'} />
                <InfoRow icon={Globe} label="Country"       value={(user as any)?.country || '—'} />
                <InfoRow icon={MessageSquare} label="Account Status" value="Active" />
              </div>
            ) : (
              <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate({ data: d }))} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">First Name</label>
                    <input {...profileForm.register('firstName')} className="input-stealth" placeholder="First name" />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-xs text-[#CF304A]">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Last Name</label>
                    <input {...profileForm.register('lastName')} className="input-stealth" placeholder="Last name" />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-xs text-[#CF304A]">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Email Address</label>
                    <input value={user?.email || ''} disabled className="input-stealth opacity-50 cursor-not-allowed" />
                    <p className="text-xs text-[#848E9C]">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Phone Number</label>
                    <input {...profileForm.register('phone')} className="input-stealth" placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Country</label>
                    <select {...profileForm.register('country')} className="input-stealth appearance-none">
                      <option value="">Select country</option>
                      {['India', 'United States', 'United Kingdom', 'Singapore', 'UAE', 'Australia', 'Canada', 'Germany', 'France', 'Japan'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={profileMutation.isPending} className="btn-gold flex items-center gap-2 px-8 disabled:opacity-50">
                    {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="px-6 py-2.5 rounded-xl bg-[#1E2329] border border-[#2B3139] text-[#848E9C] hover:text-white text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Settings */}
          <div className="card-stealth p-8">
            <SectionHeader icon={Shield} color="#CF304A" title="Security Settings" subtitle="Manage your account security" />

            {/* Change Password */}
            <div className="mb-6 p-5 rounded-xl bg-[#0B0E11] border border-[#2B3139]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#CF304A]/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#CF304A]" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Change Password</p>
                  <p className="text-xs text-[#848E9C]">Update your login password</p>
                </div>
              </div>
              <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate({ data: d }))} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Current Password</label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('currentPassword')}
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-stealth pr-12"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">New Password</label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('newPassword')}
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="input-stealth pr-12"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white transition-colors">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="input-stealth pr-12"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-[#CF304A]">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#1E2329] border border-[#2B3139] rounded-xl p-3">
                  <Key className="w-4 h-4 text-[#F0B90B] shrink-0" />
                  <p className="text-[#848E9C] text-xs">Use at least 8 characters with a mix of letters, numbers and symbols.</p>
                </div>
                <button type="submit" disabled={passwordMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CF304A]/20 text-[#CF304A] hover:bg-[#CF304A]/30 border border-[#CF304A]/30 font-bold text-sm transition-colors disabled:opacity-50">
                  {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>

            {/* 2FA + Last Login */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#0B0E11] border border-[#2B3139] hover:border-[#F0B90B]/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/20 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-[#F0B90B]" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Two-Factor Auth</p>
                      <p className="text-xs text-[#848E9C]">Extra login security</p>
                    </div>
                  </div>
                  <Toggle checked={twoFa} onChange={setTwoFa} />
                </div>
                <p className="text-xs text-[#848E9C] leading-relaxed">
                  {twoFa ? '2FA is enabled. Your account is protected.' : 'Enable 2FA to add an extra layer of security to your account.'}
                </p>
                {twoFa && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-[#02C076]/20 text-[#02C076] text-xs font-bold">
                    <CheckCircle className="w-3 h-3" /> Enabled
                  </span>
                )}
              </div>

              <div className="p-5 rounded-xl bg-[#0B0E11] border border-[#2B3139]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#848E9C]/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#848E9C]" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Last Login</p>
                    <p className="text-xs text-[#848E9C]">Session information</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#02C076]" />
                  <p className="text-xs text-[#848E9C]">Current session active</p>
                </div>
                <div className="mt-2 px-2.5 py-1 rounded-lg bg-[#1E2329] inline-flex items-center gap-1.5">
                  <Monitor className="w-3 h-3 text-[#848E9C]" />
                  <span className="text-xs text-[#848E9C]">Web Browser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
