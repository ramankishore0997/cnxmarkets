import { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile, useChangePassword, getGetMeQueryKey } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useAuthState } from '@/hooks/use-auth-state';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  User, Mail, Phone, Globe, Hash, Shield, Key,
  CheckCircle, Loader2, Edit3, Lock, Bell,
  Smartphone, Monitor, MessageSquare, Camera,
  ChevronRight, Calendar, BadgeCheck, Clock,
  AlertCircle, Eye, EyeOff, Upload,
} from 'lucide-react';

/* ── schemas ──────────────────────────────────────── */
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  phone:     z.string().optional(),
  country:   z.string().optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword:     z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(8),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

/* ── Resize image client-side using canvas ────────── */
async function resizeImage(file: File, maxSide = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale  = Math.min(maxSide / img.width, maxSide / img.height, 1);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Small helpers ────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#1F77B4]' : 'bg-white/[0.08]'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SectionHeader({ icon: Icon, color, title, subtitle }: { icon: any; color: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#111827]">{title}</h3>
        <p className="text-[#4B5563] text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#1F77B4]/25 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#4B5563]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-[#111827] font-semibold text-sm truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

/* ── Avatar component (photo or initials) ─────────── */
function ProfileAvatar({
  photo, initials, size = 96,
  onClick,
}: { photo?: string | null; initials: string; size?: number; onClick?: () => void }) {
  return (
    <div
      className="relative inline-flex shrink-0 cursor-pointer group"
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'linear-gradient(135deg, #1F77B4 0%, #1F77B4 50%, #c8960c 100%)', padding: 3 }}>
        <div className="w-full h-full rounded-full bg-[#FFFFFF]" />
      </div>
      {/* Image or initials */}
      {photo ? (
        <img
          src={photo}
          alt="Profile"
          className="absolute inset-[3px] rounded-full object-cover"
          style={{ width: size - 6, height: size - 6 }}
        />
      ) : (
        <div
          className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#1F77B4] via-[#1F77B4] to-[#c8960c] flex items-center justify-center font-black text-black shadow-inner"
          style={{ width: size - 6, height: size - 6, fontSize: size / 3.5 }}
        >
          {initials}
        </div>
      )}
      {/* Camera overlay */}
      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Camera className="text-white" style={{ width: size / 4, height: size / 4 }} />
      </div>
      {/* Camera badge at bottom-right */}
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1F77B4] border-2 border-[#FFFFFF] flex items-center justify-center shadow-lg shadow-[#1F77B4]/25 z-10 group-hover:scale-110 transition-transform">
        <Camera className="w-3.5 h-3.5 text-black" />
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────── */
export function Profile() {
  const { user } = useAuthState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode]           = useState(false);
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifSms, setNotifSms]           = useState(false);
  const [notifPlatform, setNotifPlatform] = useState(true);

  /* photo upload state */
  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const kycStatus = (user as any)?.kycStatus || 'pending';
  const kycMeta: Record<string, { color: string; label: string; icon: any }> = {
    approved:  { color: '#16A34A', label: 'Verified',      icon: BadgeCheck },
    submitted: { color: '#1F77B4', label: 'Under Review',  icon: Clock },
    rejected:  { color: '#DC2626', label: 'Rejected',      icon: AlertCircle },
    pending:   { color: '#6B7280', label: 'Not Submitted', icon: AlertCircle },
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
        toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
        setEditMode(false);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: () => toast({ title: 'Update Failed', variant: 'destructive' }),
    },
  });
  const passwordMutation = useChangePassword({
    ...getAuthOptions(),
    mutation: {
      onSuccess: () => {
        toast({ title: 'Password Changed', description: 'Your password has been updated.' });
        passwordForm.reset();
      },
      onError: (err: any) => toast({ title: 'Failed', description: err?.message || 'Incorrect password.', variant: 'destructive' }),
    },
  });

  /* ── handle file selection → instant preview ──── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    try {
      const resized = await resizeImage(file, 256, 0.85);
      setPhotoPreview(resized);
    } catch {
      setPhotoPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  /* ── save photo to Supabase Storage ───────────── */
  const handlePhotoSave = async () => {
    if (!selectedFile && !photoPreview) return;
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem('ecm_token');
      let res: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('photo', selectedFile);
        res = await fetch('/api/users/upload-photo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch('/api/users/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profilePhoto: photoPreview }),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
      setPhotoPreview(null);
      setSelectedFile(null);
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: 'Photo Updated', description: 'Your profile photo has been saved successfully.' });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setPhotoUploading(false);
    }
  };

  const initials    = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const currentPhoto = photoPreview ?? (user as any)?.profilePhoto ?? null;
  const memberSince  = user?.createdAt
    ? new Date(user.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const accountId = `ECM-${String(user?.id || '').padStart(6, '0')}`;

  return (
    <DashboardLayout>
      {/* ── Profile Header ───────────────────────────── */}
      <div className="card-stealth overflow-hidden mb-7">
        {/* Banner */}
        <div className="h-28 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(31,119,180,0.18) 0%, rgba(15,23,42,0.9) 50%, rgba(22,163,74,0.08) 100%)' }}>
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(31,119,180,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 50%, rgba(22,163,74,0.08) 0%, transparent 55%)' }} />
        </div>

        <div className="px-7 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-12">

            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <ProfileAvatar
                photo={currentPhoto}
                initials={initials}
                size={96}
                onClick={() => fileInputRef.current?.click()}
              />

              <div className="pb-1">
                <h1 className="text-xl font-black text-[#111827]">{user?.firstName} {user?.lastName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[#4B5563] text-sm">{user?.email}</span>
                  <span className="text-white/[0.1]">•</span>
                  <span className="font-terminal text-[#4B5563] text-sm">{accountId}</span>
                </div>
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: `${kyc.color}15`, color: kyc.color, border: `1px solid ${kyc.color}30` }}>
                <kyc.icon className="w-3.5 h-3.5" /> KYC: {kyc.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16A34A]/12 text-[#16A34A] border border-[#16A34A]/25">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" /> Active
              </span>

              {/* Save Photo button — only shown when a new preview is pending */}
              {photoPreview && (
                <button
                  onClick={handlePhotoSave}
                  disabled={photoUploading}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#16A34A] text-black text-xs font-bold hover:bg-[#00a866] transition-all disabled:opacity-60 shadow-lg shadow-[#16A34A]/20"
                >
                  {photoUploading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Upload className="w-3.5 h-3.5" />}
                  {photoUploading ? 'Saving…' : 'Save Photo'}
                </button>
              )}
              {photoPreview && (
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-[#6B7280] hover:text-white transition-colors"
                >
                  Discard
                </button>
              )}

              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl btn-gold text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Upload hint */}
          {!photoPreview && (
            <p className="text-[11px] text-[#374151] mt-3 ml-1">
              Click the avatar to change your profile photo
            </p>
          )}
          {photoPreview && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1F77B4] animate-pulse" />
              <p className="text-[11px] text-[#1F77B4] font-medium">
                New photo previewed — click "Save Photo" to apply
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT COLUMN ─────────────────────────── */}
        <div className="space-y-5">

          {/* Account Details */}
          <div className="card-stealth p-6">
            <SectionHeader icon={Hash} color="#1F77B4" title="Account Details" subtitle="Your account information" />
            <div className="space-y-2.5">
              <InfoRow icon={Hash}     label="Account ID"   value={accountId} />
              <InfoRow icon={User}     label="Account Type" value="Client — Standard" />
              <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
              <InfoRow icon={Globe}    label="Country"      value={(user as any)?.country || '—'} />
            </div>
          </div>

          {/* KYC Status */}
          <div className="card-stealth p-6">
            <SectionHeader icon={kyc.icon} color={kyc.color} title="KYC Verification" subtitle="Identity verification status" />
            <div className="rounded-xl p-4 mb-4 border" style={{ background: `${kyc.color}0d`, borderColor: `${kyc.color}28` }}>
              <div className="flex items-center gap-3 mb-3">
                <kyc.icon className="w-7 h-7" style={{ color: kyc.color }} />
                <div>
                  <p className="font-bold text-[#111827] text-sm">{kyc.label}</p>
                  <p className="text-xs text-[#4B5563] mt-0.5">
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
                    <span key={doc} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#16A34A]/15 text-[#16A34A] text-xs font-bold border border-[#16A34A]/25">
                      <CheckCircle className="w-3 h-3" /> {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link href="/dashboard/kyc">
              <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#1F77B4]/30 transition-colors group text-sm">
                <span className="font-semibold text-[#374151] group-hover:text-white transition-colors">
                  {kycStatus === 'approved' ? 'View Documents' : 'Complete KYC'}
                </span>
                <ChevronRight className="w-4 h-4 text-[#4B5563] group-hover:text-[#1F77B4] transition-colors" />
              </button>
            </Link>
          </div>

          {/* Notifications */}
          <div className="card-stealth p-6">
            <SectionHeader icon={Bell} color="#6B7280" title="Notifications" subtitle="Manage alert preferences" />
            <div className="space-y-3">
              {[
                { icon: Mail,       label: 'Email Notifications',    sub: 'Deposits, withdrawals, updates', state: notifEmail,    set: setNotifEmail },
                { icon: Smartphone, label: 'SMS Alerts',             sub: 'Critical security alerts',       state: notifSms,      set: setNotifSms },
                { icon: Monitor,    label: 'Platform Notifications', sub: 'In-app activity alerts',         state: notifPlatform, set: setNotifPlatform },
              ].map(({ icon: Icon, label, sub, state, set }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#4B5563]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">{label}</p>
                      <p className="text-[11px] text-[#4B5563] truncate">{sub}</p>
                    </div>
                  </div>
                  <Toggle checked={state} onChange={set} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (span 2) ───────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Personal Information */}
          <div className="card-stealth p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl icon-squircle-gold flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1F77B4]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Personal Information</h3>
                  <p className="text-[#4B5563] text-sm">Update your profile details</p>
                </div>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  editMode
                    ? 'bg-white/[0.04] border-white/[0.08] text-[#6B7280] hover:text-white'
                    : 'bg-[#1F77B4]/12 border-[#1F77B4]/25 text-[#1F77B4] hover:bg-[#1F77B4]/20'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={User}         label="First Name"     value={user?.firstName} />
                <InfoRow icon={User}         label="Last Name"      value={user?.lastName} />
                <InfoRow icon={Mail}         label="Email Address"  value={user?.email} />
                <InfoRow icon={Phone}        label="Phone Number"   value={(user as any)?.phone || '—'} />
                <InfoRow icon={Globe}        label="Country"        value={(user as any)?.country || '—'} />
                <InfoRow icon={MessageSquare}label="Account Status" value="Active" />
              </div>
            ) : (
              <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate({ data: d }))} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">First Name</label>
                    <input {...profileForm.register('firstName')} className="input-stealth" placeholder="First name" />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-xs text-[#DC2626]">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Last Name</label>
                    <input {...profileForm.register('lastName')} className="input-stealth" placeholder="Last name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Email Address</label>
                    <input value={user?.email || ''} disabled className="input-stealth opacity-40 cursor-not-allowed" />
                    <p className="text-[11px] text-[#374151]">Email cannot be changed</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Phone Number</label>
                    <input {...profileForm.register('phone')} className="input-stealth" placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Country</label>
                    <select {...profileForm.register('country')} className="input-stealth appearance-none">
                      <option value="">Select country</option>
                      {['India', 'United States', 'United Kingdom', 'Singapore', 'UAE', 'Australia', 'Canada', 'Germany', 'France', 'Japan'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={profileMutation.isPending} className="btn-green flex items-center gap-2 text-sm disabled:opacity-50">
                    {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#6B7280] hover:text-white text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Settings */}
          <div className="card-stealth p-7">
            <SectionHeader icon={Shield} color="#DC2626" title="Security Settings" subtitle="Manage your account security" />

            {/* Change Password */}
            <div className="mb-5 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl icon-squircle-red flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#DC2626]" />
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm">Change Password</p>
                  <p className="text-[11px] text-[#4B5563]">Update your login password</p>
                </div>
              </div>
              <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate({ data: d }))} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input {...passwordForm.register('currentPassword')} type={showCurrent ? 'text' : 'password'} placeholder="••••••••" className="input-stealth pr-12" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input {...passwordForm.register('newPassword')} type={showNew ? 'text' : 'password'} placeholder="••••••••" className="input-stealth pr-12" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-[#DC2626]">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input {...passwordForm.register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="input-stealth pr-12" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-[#DC2626]">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1F77B4]/06 border border-[#1F77B4]/15">
                  <Key className="w-4 h-4 text-[#1F77B4] shrink-0" />
                  <p className="text-[11px] text-[#4B5563]">Use at least 8 characters with letters, numbers and symbols.</p>
                </div>
                <button type="submit" disabled={passwordMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626]/15 text-[#DC2626] hover:bg-[#DC2626]/25 border border-[#DC2626]/25 font-bold text-sm transition-all disabled:opacity-50">
                  {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>

            {/* 2FA + Last Login */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#1F77B4]/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#6B7280]" />
                    <p className="text-sm font-bold text-[#111827]">Two-Factor Auth</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DC2626]/12 text-[#DC2626] font-bold border border-[#DC2626]/25">
                    Off
                  </span>
                </div>
                <p className="text-[11px] text-[#4B5563] mb-3">Add an extra layer of security via authenticator app.</p>
                <button className="w-full py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-semibold text-[#6B7280] hover:text-white transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-[#6B7280]" />
                  <p className="text-sm font-bold text-[#111827]">Last Login</p>
                </div>
                <p className="font-terminal text-[#111827] text-sm font-bold">Today</p>
                <p className="text-[11px] text-[#4B5563] mt-1">Web Browser · India</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── API Key Section ─── */}
        <div className="card-stealth p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(31,119,180,0.1)', border: '1px solid rgba(31,119,180,0.25)' }}>
              <Key className="w-5 h-5 text-[#1F77B4]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Algo Trading API Key</h3>
              <p className="text-[11px] text-[#4B5563] mt-0.5">Connect your trading bot or external platform</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl mb-5"
            style={{ background: 'rgba(31,119,180,0.04)', border: '1px solid rgba(31,119,180,0.15)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(31,119,180,0.12)' }}>
                <Hash className="w-4 h-4 text-[#1F77B4]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-bold text-[#1F77B4] uppercase tracking-wider">Your API Key</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                    style={{ background: 'rgba(31,119,180,0.1)', color: '#1F77B4', borderColor: 'rgba(31,119,180,0.25)' }}>
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-terminal text-sm text-[#111827] tracking-widest truncate flex-1 select-all"
                    style={{ letterSpacing: '0.12em' }}>
                    ECM-{(user as any)?.id ? String((user as any).id).padStart(6, '0') : '000000'}-ALGO-XXXXXXXX
                  </p>
                  <button
                    onClick={() => {
                      const key = `ECM-${String((user as any)?.id || '000000').padStart(6, '0')}-ALGO-XXXXXXXX`;
                      navigator.clipboard?.writeText(key);
                    }}
                    className="shrink-0 p-2 rounded-lg transition-all text-[#4B5563] hover:text-[#1F77B4]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    title="Copy API Key">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">API Endpoint</p>
              <p className="font-terminal text-xs text-[#111827] truncate">api.ecmarketpro.in/v1</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">Rate Limit</p>
              <p className="font-terminal text-xs text-[#111827]">100 req/min</p>
            </div>
          </div>

          <div className="p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(31,119,180,0.05)', border: '1px solid rgba(31,119,180,0.15)' }}>
            <AlertCircle className="w-4 h-4 text-[#1F77B4] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1F77B4] mb-1">Coming Soon</p>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                Algo trading integration is launching soon. Your API key is ready — connect your trading algorithm to auto-execute orders directly on your ECMarket Pro account.
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
