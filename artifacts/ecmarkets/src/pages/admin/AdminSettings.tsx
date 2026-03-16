import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { getAuthOptions } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2, RefreshCw, Copy, CheckCircle, Shield, Eye, EyeOff,
  Loader2, AlertTriangle, Lock, Info, RotateCcw, ExternalLink,
} from 'lucide-react';

function fetchJson(url: string, opts?: RequestInit) {
  const token = localStorage.getItem('ecm_token');
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts?.headers },
  }).then(r => r.json());
}

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  /* ── Fetch current magic link token ────────────── */
  const { data, isLoading } = useQuery({
    queryKey: ['admin-magic-link'],
    queryFn: () => fetchJson('/api/admin/settings/magic-link'),
    staleTime: Infinity,
    retry: false,
  });

  const magicToken: string = data?.token || '';
  const magicUrl   = magicToken
    ? `${window.location.origin}/admin/auto-login/${magicToken}`
    : '';

  /* ── Rotate token mutation ──────────────────────── */
  const rotateMutation = useMutation({
    mutationFn: () => fetchJson('/api/admin/settings/rotate-token', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-magic-link'] });
      setRevealed(false);
      setConfirmRotate(false);
      setRotating(false);
      toast({ title: 'Token Rotated', description: 'The previous magic link is now invalid. Copy your new link.' });
    },
    onError: () => {
      setRotating(false);
      toast({ title: 'Rotation Failed', description: 'Could not rotate token. Try again.', variant: 'destructive' });
    },
  });

  /* ── Copy to clipboard ──────────────────────────── */
  const handleCopy = async () => {
    if (!magicUrl) return;
    try {
      await navigator.clipboard.writeText(magicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: 'Link Copied', description: 'Magic link copied to clipboard.' });
    } catch {
      toast({ title: 'Copy Failed', description: 'Please copy manually.', variant: 'destructive' });
    }
  };

  /* ── Handle rotate confirm ──────────────────────── */
  const handleRotate = () => {
    setRotating(true);
    rotateMutation.mutate();
  };

  /* ── Masked URL display ─────────────────────────── */
  const maskedUrl = magicUrl
    ? magicUrl.replace(/auto-login\/.+$/, 'auto-login/••••••••••••••••••••••••••••••••••••••')
    : '';

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-4 border-[#F0B90B] rounded-full animate-spin" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
        <p className="text-[#848E9C] font-medium">Platform configuration and security settings</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* ── Magic Link Card ──────────────────────── */}
        <div className="card-stealth overflow-hidden">
          {/* Gold header bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FFB800, #F0B90B, #c8960c)' }} />

          <div className="p-7">
            {/* Title row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl icon-squircle-gold flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-[#FFB800]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Magic Login Link</h2>
                <p className="text-[#848E9C] text-sm">One-click admin access — no password required</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-lg bg-[#02C076]/15 text-[#02C076] text-xs font-bold border border-[#02C076]/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#02C076] animate-pulse inline-block" />
                Active
              </span>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 rounded-xl bg-[#FFB800]/06 border border-[#FFB800]/18 mb-6">
              <Info className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <div className="text-sm text-[#848E9C] leading-relaxed space-y-1">
                <p>This link logs you into the Admin Panel instantly without a password. Keep it <strong className="text-[#EAECEF]">strictly private</strong>.</p>
                <p>Visiting the link creates a new authenticated session and redirects to the dashboard.</p>
              </div>
            </div>

            {/* URL display */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-[0.1em] mb-2">
                Your Magic Link
              </label>
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#0B0E11] border border-white/[0.07] group">
                <Lock className="w-4 h-4 text-[#374151] shrink-0" />
                <code className="font-terminal text-xs text-[#848E9C] flex-1 truncate select-all leading-relaxed">
                  {revealed ? magicUrl : maskedUrl}
                </code>
                <button
                  onClick={() => setRevealed(v => !v)}
                  className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#FFB800] hover:bg-[#FFB800]/10 transition-all shrink-0"
                  title={revealed ? 'Hide' : 'Reveal'}
                >
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                disabled={!magicUrl}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  copied
                    ? 'bg-[#02C076] text-black shadow-lg shadow-[#02C076]/20'
                    : 'btn-gold'
                }`}
              >
                {copied
                  ? <><CheckCircle className="w-4 h-4" /> Copied!</>
                  : <><Copy className="w-4 h-4" /> Copy Link</>}
              </button>

              {revealed && magicUrl && (
                <a
                  href={magicUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#848E9C] hover:text-white hover:border-white/[0.15] font-semibold text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Test Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Rotate Token Card ────────────────────── */}
        <div className="card-stealth overflow-hidden">
          <div className="h-1 w-full bg-[#CF304A]/60" />

          <div className="p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl icon-squircle-red flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[#CF304A]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Rotate Token</h2>
                <p className="text-[#848E9C] text-sm">Invalidate current link and generate a new one</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#CF304A]/06 border border-[#CF304A]/18 mb-6">
              <AlertTriangle className="w-4 h-4 text-[#CF304A] shrink-0 mt-0.5" />
              <p className="text-sm text-[#848E9C] leading-relaxed">
                Rotating the token will <strong className="text-[#F8FAFC]">permanently invalidate</strong> the current magic link. You must copy the new link after rotating. Do this if you suspect the link has been compromised.
              </p>
            </div>

            {!confirmRotate ? (
              <button
                onClick={() => setConfirmRotate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25 font-bold text-sm hover:bg-[#CF304A]/25 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Rotate Token
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#CF304A]/08 border border-[#CF304A]/30">
                <p className="text-sm font-semibold text-[#F8FAFC] flex-1">
                  Are you sure? The current link will stop working immediately.
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmRotate(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#848E9C] hover:text-white text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRotate}
                    disabled={rotating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CF304A] text-white font-bold text-sm hover:bg-[#e03455] transition-all disabled:opacity-60"
                  >
                    {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Yes, Rotate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Security Note ────────────────────────── */}
        <div className="card-stealth p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <h3 className="font-bold text-white text-base">Security Notes</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              'This link is never indexed by search engines (noindex meta tag is set on that page).',
              'The token is cryptographically generated — 96 hex characters (384 bits of entropy).',
              'Store this link securely (e.g. in a password manager), never share it publicly.',
              'If you ever share your screen or suspect exposure, rotate the token immediately.',
              'Each token is unique per database — even the developer cannot guess it.',
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#848E9C]">
                <CheckCircle className="w-4 h-4 text-[#02C076] shrink-0 mt-0.5" />
                {note}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </AdminLayout>
  );
}
