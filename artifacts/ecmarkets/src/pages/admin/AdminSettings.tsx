import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2, RefreshCw, Copy, CheckCircle, Shield, Eye, EyeOff,
  Loader2, AlertTriangle, Lock, Info, RotateCcw, ExternalLink,
  Wallet, Save,
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

  /* ── USDT address state ─────────────────────────── */
  const [usdtInput, setUsdtInput] = useState('');
  const [usdtEditing, setUsdtEditing] = useState(false);

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

  /* ── Fetch USDT address ─────────────────────────── */
  const { data: usdtData } = useQuery({
    queryKey: ['admin-usdt-address'],
    queryFn: () => fetchJson('/api/admin/settings/usdt-address'),
    staleTime: Infinity,
    retry: false,
  });
  const savedUsdtAddress: string = usdtData?.address || '';

  /* ── Save USDT address mutation ─────────────────── */
  const usdtMutation = useMutation({
    mutationFn: (address: string) => fetchJson('/api/admin/settings/usdt-address', { method: 'PUT', body: JSON.stringify({ address }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usdt-address'] });
      setUsdtEditing(false);
      toast({ title: 'USDT Address Updated', description: 'The platform USDT TRC20 withdrawal address has been saved.' });
    },
    onError: () => {
      toast({ title: 'Update Failed', description: 'Could not save USDT address. Try again.', variant: 'destructive' });
    },
  });

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
            <div className="absolute inset-0 border-t-4 border-[#1F77B4] rounded-full animate-spin" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Admin Settings</h1>
        <p className="text-[#6B7280] font-medium">Platform configuration and security settings</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* ── Magic Link Card ──────────────────────── */}
        <div className="card-stealth overflow-hidden">
          {/* Gold header bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1F77B4, #1F77B4, #c8960c)' }} />

          <div className="p-7">
            {/* Title row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl icon-squircle-gold flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-[#1F77B4]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Magic Login Link</h2>
                <p className="text-[#6B7280] text-sm">One-click admin access — no password required</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-lg bg-[#16A34A]/15 text-[#16A34A] text-xs font-bold border border-[#16A34A]/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse inline-block" />
                Active
              </span>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 rounded-xl bg-[#1F77B4]/06 border border-[#1F77B4]/18 mb-6">
              <Info className="w-4 h-4 text-[#1F77B4] shrink-0 mt-0.5" />
              <div className="text-sm text-[#6B7280] leading-relaxed space-y-1">
                <p>This link logs you into the Admin Panel instantly without a password. Keep it <strong className="text-[#374151]">strictly private</strong>.</p>
                <p>Visiting the link creates a new authenticated session and redirects to the dashboard.</p>
              </div>
            </div>

            {/* URL display */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-[0.1em] mb-2">
                Your Magic Link
              </label>
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#FFFFFF] border border-white/[0.07] group">
                <Lock className="w-4 h-4 text-[#374151] shrink-0" />
                <code className="font-terminal text-xs text-[#6B7280] flex-1 truncate select-all leading-relaxed">
                  {revealed ? magicUrl : maskedUrl}
                </code>
                <button
                  onClick={() => setRevealed(v => !v)}
                  className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#1F77B4] hover:bg-[#1F77B4]/10 transition-all shrink-0"
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
                    ? 'bg-[#16A34A] text-black shadow-lg shadow-[#16A34A]/20'
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#6B7280] hover:text-white hover:border-white/[0.15] font-semibold text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Test Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Rotate Token Card ────────────────────── */}
        <div className="card-stealth overflow-hidden">
          <div className="h-1 w-full bg-[#DC2626]/60" />

          <div className="p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl icon-squircle-red flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Rotate Token</h2>
                <p className="text-[#6B7280] text-sm">Invalidate current link and generate a new one</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#DC2626]/06 border border-[#DC2626]/18 mb-6">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Rotating the token will <strong className="text-[#111827]">permanently invalidate</strong> the current magic link. You must copy the new link after rotating. Do this if you suspect the link has been compromised.
              </p>
            </div>

            {!confirmRotate ? (
              <button
                onClick={() => setConfirmRotate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/25 font-bold text-sm hover:bg-[#DC2626]/25 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Rotate Token
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#DC2626]/08 border border-[#DC2626]/30">
                <p className="text-sm font-semibold text-[#111827] flex-1">
                  Are you sure? The current link will stop working immediately.
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmRotate(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#6B7280] hover:text-white text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRotate}
                    disabled={rotating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DC2626] text-white font-bold text-sm hover:bg-[#e03455] transition-all disabled:opacity-60"
                  >
                    {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Yes, Rotate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── USDT TRC20 Address ───────────────────── */}
        <div className="card-stealth overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1F77B4, #26a17b)' }} />
          <div className="p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(31,119,180,0.12)', border: '1px solid rgba(31,119,180,0.2)' }}>
                <Wallet className="w-5 h-5 text-[#1F77B4]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#111827]">USDT TRC20 Withdrawal Address</h2>
                <p className="text-[#6B7280] text-sm">Platform address shown to users during withdrawal</p>
              </div>
            </div>

            {!usdtEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-[0.1em] mb-2">Current Address</label>
                  <div className="flex items-center gap-2 p-3.5 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <code className="font-mono text-xs text-[#9CA3AF] flex-1 break-all leading-relaxed">
                      {savedUsdtAddress || <span className="text-[#4B5563] italic">No address set yet</span>}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => { setUsdtInput(savedUsdtAddress); setUsdtEditing(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all btn-gold"
                >
                  <Wallet className="w-4 h-4" />
                  {savedUsdtAddress ? 'Update Address' : 'Set Address'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#9CA3AF] mb-2">New USDT TRC20 Address</label>
                  <textarea
                    value={usdtInput}
                    onChange={(e) => setUsdtInput(e.target.value)}
                    placeholder="Enter USDT TRC20 wallet address (starts with T...)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-[#1F77B4]/50 text-white placeholder-[#374151]"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUsdtEditing(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => usdtMutation.mutate(usdtInput.trim())}
                    disabled={usdtMutation.isPending || usdtInput.trim().length < 5}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {usdtMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Address
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
            <h3 className="font-bold text-[#111827] text-base">Security Notes</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              'This link is never indexed by search engines (noindex meta tag is set on that page).',
              'The token is cryptographically generated — 96 hex characters (384 bits of entropy).',
              'Store this link securely (e.g. in a password manager), never share it publicly.',
              'If you ever share your screen or suspect exposure, rotate the token immediately.',
              'Each token is unique per database — even the developer cannot guess it.',
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                {note}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </AdminLayout>
  );
}
