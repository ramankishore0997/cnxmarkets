import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSubmitDeposit, useGetTransactions } from '@workspace/api-client-react';
import { getAuthOptions, getApiBase } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, Clock, XCircle, ArrowDownLeft,
  Loader2, Copy, CheckCircle2, Smartphone, Bitcoin, CreditCard,
  Lock, ShieldCheck, AlertCircle
} from 'lucide-react';

const USDT_ADDRESS = 'TCnevWTfAeo6SmaJoNF5k5kbZzDxsuR1eo';

function StatusBadge({ status, method }: { status: string; method?: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    approved: { icon: CheckCircle, color: '#16A34A' },
    pending:  { icon: Clock,       color: '#1F77B4' },
    rejected: { icon: XCircle,     color: '#DC2626' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ background: `${s.color}20`, color: s.color }}>
      <s.icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Card type detector ─────────────────────────── */
function detectCard(num: string): { type: string; color: string } {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))              return { type: 'VISA',       color: '#1A1F71' };
  if (/^5[1-5]/.test(n))        return { type: 'MASTERCARD', color: '#EB001B' };
  if (/^6[0-9]/.test(n))        return { type: 'RUPAY',      color: '#FF6B00' };
  if (/^3[47]/.test(n))         return { type: 'AMEX',       color: '#007DC4' };
  return { type: '', color: '#6B7280' };
}

/* ─── Format card number 4 4 4 4 ────────────────── */
function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

/* ─── Format expiry MM/YY ───────────────────────── */
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

/* ─── OTP Modal ─────────────────────────────────── */
function OtpModal({
  open, maskedCard, amount, onSubmit, onClose, submitting, error,
}: {
  open: boolean;
  maskedCard: string;
  amount: string;
  onSubmit: (otp: string) => void;
  onClose: () => void;
  submitting: boolean;
  error: string;
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [expired, setExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    setDigits(['', '', '', '', '', '']);
    setTimeLeft(15 * 60);
    setExpired(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [open, timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const progress = (timeLeft / (15 * 60)) * 100;

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const otp = digits.join('');
  const canSubmit = otp.length === 6 && !expired && !submitting;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#ffffff' }}>
        {/* Top accent */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #0B3C5D, #1F77B4, #60C0F0)' }} />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #F7F9FC, #EFF6FF)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #0B3C5D, #1F77B4)' }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-[#111827] mb-1">Verify Your Payment</h2>
          <p className="text-sm text-[#6B7280]">OTP Verification Required</p>
        </div>

        <div className="px-8 py-6">
          {/* Card + Amount info */}
          <div className="rounded-xl border border-[#E5E7EB] p-4 mb-6" style={{ background: '#F7F9FC' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#1F77B4]" />
                <div>
                  <p className="text-xs text-[#6B7280] font-medium">Card</p>
                  <p className="text-sm font-bold text-[#111827] font-mono">{maskedCard}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7280] font-medium">Amount</p>
                <p className="text-base font-black text-[#111827]">₹{Number(amount).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* OTP wait message */}
          <div className="rounded-xl border border-[#1F77B4]/30 p-4 mb-6" style={{ background: '#EFF6FF' }}>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-[#1F77B4] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#0B3C5D] mb-1">OTP on its way</p>
                <p className="text-xs text-[#374151] leading-relaxed">
                  An OTP has been sent to your registered mobile number linked to this card.
                  <span className="font-bold text-[#1F77B4]"> OTP aane mein 1 se 2 minute lag sakte hain.</span>
                  Please wait and do not close this window.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B7280]">Time remaining to enter OTP</span>
              <span className={`text-sm font-black tabular-nums ${timeLeft < 60 ? 'text-[#DC2626]' : 'text-[#1F77B4]'}`}>
                {minutes}:{seconds}
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: timeLeft < 60
                    ? 'linear-gradient(90deg, #DC2626, #F87171)'
                    : 'linear-gradient(90deg, #1F77B4, #60C0F0)',
                }}
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">Session valid for 15 minutes</p>
          </div>

          {/* OTP Boxes */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-[#374151] mb-3 text-center">
              Enter 6-Digit OTP
            </label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={expired || submitting}
                  className="w-12 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all"
                  style={{
                    borderColor: d ? '#1F77B4' : '#E5E7EB',
                    color: '#111827',
                    background: expired ? '#F3F4F6' : '#ffffff',
                    fontSize: '1.5rem',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#1F77B4')}
                  onBlur={e => (e.target.style.borderColor = d ? '#1F77B4' : '#E5E7EB')}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <p className="text-sm text-[#DC2626] font-medium">{error}</p>
            </div>
          )}

          {/* Expired message */}
          {expired && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
              <p className="text-sm text-[#EA580C] font-medium">Session expired. Please start a new payment request.</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={() => canSubmit && onSubmit(otp)}
            disabled={!canSubmit}
            className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: canSubmit ? 'linear-gradient(135deg, #0B3C5D, #1F77B4)' : '#E5E7EB',
              color: canSubmit ? '#ffffff' : '#9CA3AF',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying OTP...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Submit OTP & Confirm Payment</>
            )}
          </button>

          {/* Cancel */}
          {!expired && (
            <button onClick={onClose} className="w-full mt-3 text-sm text-[#6B7280] hover:text-[#111827] transition-colors py-2 font-medium">
              Cancel Payment
            </button>
          )}
          {expired && (
            <button onClick={onClose} className="w-full mt-3 text-sm font-bold text-[#1F77B4] hover:underline py-2">
              ← Start New Payment
            </button>
          )}

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[#E5E7EB]">
            <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-xs text-[#9CA3AF]">256-bit SSL Encrypted · Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = 'upi' | 'usdt' | 'card';

export function Deposit() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('upi');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<Tab | null>(null);

  /* UPI state */
  const [upiAmount, setUpiAmount] = useState('');
  const [upiId, setUpiId]         = useState('');
  const [upiError, setUpiError]   = useState('');

  /* USDT state */
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtError, setUsdtError]   = useState('');

  /* Card state */
  const [cardNumber, setCardNumber]   = useState('');
  const [cardHolder, setCardHolder]   = useState('');
  const [expiry, setExpiry]           = useState('');
  const [cvv, setCvv]                 = useState('');
  const [cardAmount, setCardAmount]   = useState('');
  const [cardError, setCardError]     = useState('');
  const [cardLoading, setCardLoading] = useState(false);

  /* OTP Modal state */
  const [otpOpen, setOtpOpen]         = useState(false);
  const [otpTxId, setOtpTxId]         = useState<number | null>(null);
  const [otpMasked, setOtpMasked]     = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError]       = useState('');

  const { data: transactions, isLoading: txLoading } = useGetTransactions({ ...getAuthOptions() });
  const deposits = (transactions as any[])?.filter((t: any) => t.type === 'deposit') || [];

  const depositMutation = useSubmitDeposit({
    ...getAuthOptions(),
    mutation: {
      onSuccess: (_data: any, vars: any) => {
        const method = vars.data.paymentMethod;
        setSuccess(method === 'upi' ? 'upi' : 'usdt');
        setUpiAmount(''); setUpiId('');
        setUsdtAmount('');
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      },
      onError: () => {
        setUpiError('Submission failed. Please try again.');
        setUsdtError('Submission failed. Please try again.');
      },
    },
  });

  const upiAmtNum  = parseFloat(upiAmount)  || 0;
  const usdtAmtNum = parseFloat(usdtAmount) || 0;
  const cardAmtNum = parseFloat(cardAmount) || 0;
  const upiValid   = upiAmtNum >= 5000 && upiId.trim().length > 0;
  const usdtValid  = usdtAmtNum >= 100;
  const cardInfo   = detectCard(cardNumber);

  const cardValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardHolder.trim().length >= 2 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvv.length >= 3 &&
    cardAmtNum >= 5000;

  const submitUPI = () => {
    setUpiError('');
    if (upiAmtNum < 5000)  { setUpiError('Minimum deposit is ₹5,000'); return; }
    if (!upiId.trim())      { setUpiError('Please enter your UPI ID'); return; }
    setSuccess(null);
    depositMutation.mutate({ data: { amount: upiAmtNum, currency: 'INR', paymentMethod: 'upi', transactionReference: upiId.trim() } });
  };

  const submitUSDT = () => {
    setUsdtError('');
    if (usdtAmtNum < 100) { setUsdtError('Minimum deposit is 100 USDT'); return; }
    setSuccess(null);
    depositMutation.mutate({ data: { amount: usdtAmtNum, currency: 'USDT', paymentMethod: 'crypto_usdt' } });
  };

  /* ── Card Submit → open OTP modal ──────────────────── */
  const submitCard = useCallback(async () => {
    setCardError('');
    if (!cardValid) { setCardError('Please fill all card details correctly.'); return; }
    setCardLoading(true);
    try {
      const token = localStorage.getItem('ecm_token');
      const res = await fetch(`${getApiBase()}/api/transactions/card-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: cardAmtNum,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolder: cardHolder.trim(),
          expiry,
          cvv,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCardError(data.message || 'Failed to initiate payment.'); return; }
      setOtpTxId(data.txId);
      setOtpMasked(data.maskedCard);
      setOtpError('');
      setOtpOpen(true);
    } catch {
      setCardError('Network error. Please try again.');
    } finally {
      setCardLoading(false);
    }
  }, [cardValid, cardAmtNum, cardNumber, cardHolder, expiry, cvv]);

  /* ── OTP Submit ────────────────────────────────────── */
  const submitOtp = useCallback(async (otp: string) => {
    setOtpSubmitting(true);
    setOtpError('');
    try {
      const token = localStorage.getItem('ecm_token');
      const res = await fetch(`${getApiBase()}/api/transactions/card-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txId: otpTxId, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.message || 'OTP verification failed.'); return; }
      setOtpOpen(false);
      setSuccess('card');
      setCardNumber(''); setCardHolder(''); setExpiry(''); setCvv(''); setCardAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpSubmitting(false);
    }
  }, [otpTxId, queryClient]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-5 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-1.5">Fund Account</h1>
        <p className="text-[#6B7280] font-medium text-sm md:text-base">Add capital to start allocating to strategies</p>
      </div>

      {/* OTP Modal */}
      <OtpModal
        open={otpOpen}
        maskedCard={otpMasked}
        amount={cardAmount}
        onSubmit={submitOtp}
        onClose={() => setOtpOpen(false)}
        submitting={otpSubmitting}
        error={otpError}
      />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 md:mb-6 flex-wrap">
        {([
          { key: 'upi',  label: 'UPI India',    icon: Smartphone },
          { key: 'card', label: 'Debit / Credit Card', icon: CreditCard },
          { key: 'usdt', label: 'Crypto (USDT)', icon: Bitcoin    },
        ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSuccess(null); }}
            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-all border flex-1 md:flex-none justify-center md:justify-start ${
              tab === key
                ? 'bg-[#1F77B4] text-white border-[#1F77B4]'
                : 'bg-transparent text-[#6B7280] border-[#E5E7EB] hover:border-[#1F77B4]/50 hover:text-[#111827]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-8 mb-5 md:mb-8">

        {/* ── FORM PANEL ── */}
        <div className="lg:col-span-3 card-stealth p-5 md:p-8">

          {/* ─── UPI TAB ─────────────────────────────────────── */}
          {tab === 'upi' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#16A34A]/20 border border-[#16A34A]/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">UPI Deposit (India)</h3>
                  <p className="text-xs text-[#6B7280]">Instant transfer · No fees · INR only</p>
                </div>
              </div>

              {success === 'upi' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-full border-4 border-[#1F77B4]/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#1F77B4] animate-spin absolute" />
                      <Smartphone className="w-8 h-8 text-[#1F77B4]" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1F77B4] flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F77B4]/20 border border-[#1F77B4]/40 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#1F77B4] animate-pulse" />
                    <span className="text-xs font-bold text-[#1F77B4] uppercase tracking-wider">Waiting for Payment</span>
                  </div>
                  <h4 className="text-xl font-black text-[#111827] mb-3">Payment Request Sent!</h4>
                  <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 text-left max-w-sm mb-5">
                    <p className="text-[#374151] text-sm leading-relaxed">
                      Please check your UPI app <span className="text-[#1F77B4] font-semibold">(PhonePe, Google Pay, etc.)</span>.
                      Complete the payment within your app.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                    Request logged · Status: <span className="font-bold text-[#1F77B4]">Pending</span>
                  </div>
                  <button onClick={() => setSuccess(null)} className="mt-5 text-sm font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
                    ← Submit another request
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Deposit Amount <span className="text-[#DC2626]">*</span></label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#1F77B4] font-black text-lg bg-[#1F77B4]/10 border-r border-[#E5E7EB] select-none shrink-0">₹</span>
                      <input type="number" value={upiAmount} onChange={e => { setUpiAmount(e.target.value); setUpiError(''); }}
                        className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="Enter amount (Min ₹5,000)" min={5000} />
                      <span className="flex items-center px-3 text-xs font-bold text-[#6B7280] select-none shrink-0">INR</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />Minimum: ₹5,000 · Maximum: ₹2,00,000/day
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Your UPI ID <span className="text-[#DC2626]">*</span></label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#16A34A] font-black text-base bg-[#16A34A]/10 border-r border-[#E5E7EB] select-none shrink-0">@</span>
                      <input type="text" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                        className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="Enter your UPI ID (e.g., user@upi)" />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5">e.g. name@okicici, 9876543210@paytm, user@ybl</p>
                  </div>
                  {upiError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30">
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <p className="text-sm text-[#DC2626] font-medium">{upiError}</p>
                    </div>
                  )}
                  <button onClick={submitUPI} disabled={!upiValid || depositMutation.isPending}
                    className="w-full btn-gold flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                    {depositMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Request Deposit
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── CARD TAB ─────────────────────────────────────── */}
          {tab === 'card' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0B3C5D20, #1F77B420)', border: '1px solid #1F77B430' }}>
                  <CreditCard className="w-5 h-5 text-[#1F77B4]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Debit / Credit Card</h3>
                  <p className="text-xs text-[#6B7280]">Visa · Mastercard · RuPay · All Indian cards accepted</p>
                </div>
                {/* Card logos */}
                <div className="ml-auto flex items-center gap-2">
                  {[
                    { label: 'VISA', bg: '#1A1F71', text: '#ffffff' },
                    { label: 'MC',   bg: '#EB001B', text: '#ffffff' },
                    { label: 'RP',   bg: '#FF6B00', text: '#ffffff' },
                  ].map(c => (
                    <span key={c.label} className="px-2 py-0.5 rounded text-xs font-black"
                      style={{ background: c.bg, color: c.text }}>{c.label}</span>
                  ))}
                </div>
              </div>

              {success === 'card' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', border: '2px solid #16A34A40' }}>
                    <CheckCircle className="w-10 h-10 text-[#16A34A]" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: '#DCFCE7', border: '1px solid #16A34A40' }}>
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">OTP Verified</span>
                  </div>
                  <h4 className="text-xl font-black text-[#111827] mb-2">Payment Submitted!</h4>
                  <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed mb-6">
                    Your payment is under review. Funds will be credited to your account once verified by our team.
                  </p>
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-left w-full max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#6B7280]">Status</span>
                      <span className="font-bold text-[#1F77B4]">Pending Verification</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">Est. Credit Time</span>
                      <span className="font-bold text-[#16A34A]">Within 1 hour</span>
                    </div>
                  </div>
                  <button onClick={() => setSuccess(null)} className="mt-6 text-sm font-bold text-[#1F77B4] hover:underline">
                    ← Make another payment
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Deposit Amount <span className="text-[#DC2626]">*</span></label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#1F77B4] font-black text-lg bg-[#1F77B4]/10 border-r border-[#E5E7EB] select-none shrink-0">₹</span>
                      <input type="number" value={cardAmount} onChange={e => { setCardAmount(e.target.value); setCardError(''); }}
                        className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="Enter amount (Min ₹5,000)" min={5000} />
                      <span className="flex items-center px-3 text-xs font-bold text-[#6B7280] select-none shrink-0">INR</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />Minimum: ₹5,000 · No transaction fee
                    </p>
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Card Number <span className="text-[#DC2626]">*</span></label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors relative">
                      <span className="flex items-center px-4 bg-[#F7F9FC] border-r border-[#E5E7EB] shrink-0">
                        <CreditCard className="w-5 h-5 text-[#6B7280]" />
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setCardError(''); }}
                        className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-mono font-medium px-4 outline-none w-0 min-w-0 tracking-wider"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                      {cardInfo.type && (
                        <span className="flex items-center px-3 text-xs font-black shrink-0"
                          style={{ color: cardInfo.color }}>
                          {cardInfo.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Cardholder Name <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => { setCardHolder(e.target.value.toUpperCase()); setCardError(''); }}
                      className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] text-sm font-medium px-4 outline-none focus:border-[#1F77B4]/60 transition-colors uppercase tracking-wider"
                      placeholder="AS ON CARD"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">Expiry Date <span className="text-[#DC2626]">*</span></label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={expiry}
                        onChange={e => { setExpiry(formatExpiry(e.target.value)); setCardError(''); }}
                        className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] text-sm font-mono font-medium px-4 outline-none focus:border-[#1F77B4]/60 transition-colors tracking-widest"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        CVV <span className="text-[#DC2626]">*</span>
                        <span className="ml-1 text-[#9CA3AF] font-normal text-xs">(3 digits)</span>
                      </label>
                      <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors">
                        <input
                          type="password"
                          inputMode="numeric"
                          value={cvv}
                          onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setCardError(''); }}
                          className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-mono font-medium px-4 outline-none w-0 min-w-0 tracking-widest"
                          placeholder="•••"
                          maxLength={4}
                        />
                        <span className="flex items-center px-3 shrink-0">
                          <Lock className="w-4 h-4 text-[#9CA3AF]" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {cardError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30">
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <p className="text-sm text-[#DC2626] font-medium">{cardError}</p>
                    </div>
                  )}

                  {/* Security badge */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
                    <p className="text-xs text-[#166534] leading-relaxed">
                      <span className="font-bold">256-bit SSL Encrypted</span> · Your card details are transmitted securely and never stored on our servers.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={submitCard}
                    disabled={!cardValid || cardLoading}
                    className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: cardValid && !cardLoading ? 'linear-gradient(135deg, #0B3C5D, #1F77B4)' : '#E5E7EB',
                      color: cardValid && !cardLoading ? '#ffffff' : '#9CA3AF',
                      cursor: cardValid && !cardLoading ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {cardLoading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Initiating Payment...</>
                      : <><Lock className="w-5 h-5" /> Proceed to OTP Verification</>
                    }
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── USDT TAB ─────────────────────────────────────── */}
          {tab === 'usdt' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#1F77B4]/20 border border-[#1F77B4]/30 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-[#1F77B4]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">USDT Deposit (TRC20)</h3>
                  <p className="text-xs text-[#6B7280]">Tron network · USDT only · Min 100 USDT</p>
                </div>
              </div>

              {success === 'usdt' ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#16A34A]/20 border border-[#16A34A]/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-[#16A34A]" />
                  </div>
                  <h4 className="text-lg font-bold text-[#111827] mb-2">USDT Deposit Request Received</h4>
                  <p className="text-[#6B7280] text-sm max-w-sm leading-relaxed">Verification in progress. Your balance will be credited once confirmed.</p>
                  <button onClick={() => setSuccess(null)} className="mt-6 text-sm font-bold text-[#1F77B4] hover:underline">Submit another deposit →</button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">USDT (TRC20) Wallet Address</p>
                    <p className="font-mono text-[#374151] text-xs break-all mb-3 leading-relaxed">{USDT_ADDRESS}</p>
                    <button onClick={() => copyText(USDT_ADDRESS)}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] transition-colors font-semibold">
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center py-6 bg-white rounded-xl border border-[#E5E7EB]">
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-2 mb-3 shadow-[0_0_24px_rgba(31,119,180,0.15)]">
                      <img src="/usdt-qr.jpg" alt="USDT TRC20 QR Code" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <p className="text-xs font-bold text-[#1F77B4] uppercase tracking-wider">Scan to Send USDT</p>
                    <p className="text-xs text-[#6B7280] mt-1">TRC20 (Tron) Network Only</p>
                  </div>
                  <div className="bg-[#1F77B4]/10 border border-[#1F77B4]/30 rounded-xl p-3 text-xs text-[#1F77B4] font-semibold">
                    ⚠ Only send USDT on the TRC20 (Tron) network. Other networks = permanent loss.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Amount (USDT) *</label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#F0B90B] font-black text-sm bg-[#F0B90B]/10 border-r border-[#E5E7EB] select-none shrink-0">USDT</span>
                      <input type="number" value={usdtAmount} onChange={e => { setUsdtAmount(e.target.value); setUsdtError(''); }}
                        className="flex-1 bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="e.g. 500" min={100} step="0.01" />
                      <span className="flex items-center px-3 text-xs font-bold text-[#6B7280] select-none shrink-0">TRC20</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] inline-block" />Minimum: 100 USDT
                    </p>
                  </div>
                  {usdtError && <p className="text-sm text-[#DC2626] font-medium">{usdtError}</p>}
                  <button onClick={submitUSDT} disabled={!usdtValid || depositMutation.isPending}
                    className="w-full btn-gold flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                    {depositMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Request
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── INFO PANEL ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-stealth p-6">
            <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">How It Works</h4>
            <ol className="space-y-4">
              {(tab === 'card' ? [
                { step: '1', text: 'Enter your card details and deposit amount.' },
                { step: '2', text: 'Click "Proceed" — an OTP will be sent to your registered mobile.' },
                { step: '3', text: 'Enter the OTP within 15 minutes to confirm.' },
                { step: '4', text: 'Our team verifies and credits your balance within 1 hour.' },
              ] : [
                { step: '1', text: 'Fill in the form and submit your deposit request.' },
                { step: '2', text: 'Complete the payment on your end.' },
                { step: '3', text: 'Our team manually verifies the payment.' },
                { step: '4', text: 'Balance is credited — usually within 1 hour.' },
              ]).map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1F77B4] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                  <p className="text-sm text-[#6B7280]">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {tab === 'card' && (
            <div className="card-stealth p-6">
              <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">OTP Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <Smartphone className="w-4 h-4 text-[#1F77B4] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#374151] leading-relaxed">OTP aane mein <strong>1 se 2 minute</strong> lag sakte hain. Patience rakhen.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <Clock className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#374151] leading-relaxed">OTP validity: <strong>15 minutes</strong>. Window band mat karo.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                  <AlertCircle className="w-4 h-4 text-[#EA580C] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#374151] leading-relaxed">OTP kisi ke saath share mat karo. ECMarket staff kabhi OTP nahi maangta.</p>
                </div>
              </div>
            </div>
          )}

          <div className="card-stealth p-6">
            <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">Processing Times</h4>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'UPI (INR)',           value: 'Within 1 hour',   color: '#16A34A' },
                { label: 'Card (Debit/Credit)', value: 'Within 1 hour',   color: '#16A34A' },
                { label: 'USDT (TRC20)',        value: '1–3 hours',       color: '#16A34A' },
                { label: 'Weekends / Holidays', value: 'Up to 24 hours',  color: '#1F77B4' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#6B7280]">{label}</span>
                  <span className="font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-stealth p-6">
            <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">Deposit Limits</h4>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Min (UPI)',       value: '₹5,000'   },
                { label: 'Min (Card)',      value: '₹5,000'   },
                { label: 'Max (per day)',   value: '₹2,00,000' },
                { label: 'Min (USDT)',      value: '100 USDT' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#6B7280]">{label}</span>
                  <span className="font-bold text-[#111827]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Fees</span>
                <span className="font-bold text-[#16A34A]">None</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION HISTORY ── */}
      <div className="card-stealth p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#111827]">Deposit History</h3>
          <span className="text-[#6B7280] text-sm">{deposits.length} request{deposits.length !== 1 ? 's' : ''}</span>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#1F77B4]" /></div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownLeft className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#6B7280] font-medium">No deposits yet. Submit your first request above.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {['Date', 'Amount', 'Method', 'Reference', 'Status'].map(h => (
                      <th key={h} className="pb-4 text-left text-[#6B7280] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {deposits.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="py-4 pr-6 text-[#6B7280] text-sm">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 pr-6 font-bold text-[#111827]">
                        {tx.currency === 'INR' ? '₹' : ''}{Number(tx.amount).toLocaleString('en-IN')}{tx.currency !== 'INR' ? ` ${tx.currency}` : ''}
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          tx.paymentMethod === 'upi'  ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                          tx.paymentMethod === 'card' ? 'bg-[#1F77B4]/20 text-[#1F77B4]' :
                          'bg-[#F0B90B]/20 text-[#B45309]'
                        }`}>
                          {tx.paymentMethod === 'upi' ? 'UPI' : tx.paymentMethod === 'card' ? 'CARD' : 'USDT'}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-[#6B7280] font-mono text-xs">{tx.transactionReference || '—'}</td>
                      <td className="py-4"><StatusBadge status={tx.status} method={tx.paymentMethod} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {deposits.map((tx: any) => (
                <div key={tx.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-[#111827] text-base">
                      {tx.currency === 'INR' ? '₹' : ''}{Number(tx.amount).toLocaleString('en-IN')}{tx.currency !== 'INR' ? ` ${tx.currency}` : ''}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      tx.paymentMethod === 'upi'  ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                      tx.paymentMethod === 'card' ? 'bg-[#1F77B4]/20 text-[#1F77B4]' :
                      'bg-[#F0B90B]/20 text-[#B45309]'
                    }`}>
                      {tx.paymentMethod === 'upi' ? 'UPI' : tx.paymentMethod === 'card' ? 'CARD' : 'USDT'}
                    </span>
                    <span className="text-xs text-[#6B7280]">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
