import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSubmitDeposit, useGetTransactions } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, Clock, XCircle, ArrowDownLeft,
  Loader2, Copy, CheckCircle2, Smartphone, Bitcoin
} from 'lucide-react';

const USDT_ADDRESS = 'TCnevWTfAeo6SmaJoNF5k5kbZzDxsuR1eo';
const UPI_HANDLE = 'ecmarkets@upi';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    approved: { icon: CheckCircle, color: '#16A34A' },
    pending:  { icon: Clock,        color: '#1F77B4' },
    rejected: { icon: XCircle,      color: '#DC2626' },
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

type Tab = 'upi' | 'usdt';

export function Deposit() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('upi');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<Tab | null>(null);

  const [upiAmount, setUpiAmount] = useState('');
  const [upiId, setUpiId]         = useState('');
  const [upiError, setUpiError]   = useState('');

  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtError, setUsdtError]   = useState('');

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
  const upiValid   = upiAmtNum >= 5000 && upiId.trim().length > 0;
  const usdtValid  = usdtAmtNum >= 100;

  const submitUPI = () => {
    setUpiError('');
    if (upiAmtNum < 5000)      { setUpiError('Minimum deposit is ₹5,000'); return; }
    if (!upiId.trim())          { setUpiError('Please enter your UPI ID'); return; }
    setSuccess(null);
    depositMutation.mutate({ data: { amount: upiAmtNum, currency: 'INR', paymentMethod: 'upi', transactionReference: upiId.trim() } });
  };

  const submitUSDT = () => {
    setUsdtError('');
    if (usdtAmtNum < 100) { setUsdtError('Minimum deposit is 100 USDT'); return; }
    setSuccess(null);
    depositMutation.mutate({ data: { amount: usdtAmtNum, currency: 'USDT', paymentMethod: 'crypto_usdt' } });
  };

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

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 md:mb-6">
        {([
          { key: 'upi',  label: 'UPI India',    icon: Smartphone },
          { key: 'usdt', label: 'Crypto (USDT)', icon: Bitcoin    },
        ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSuccess(null); }}
            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-all border flex-1 md:flex-none justify-center md:justify-start ${
              tab === key
                ? 'bg-[#1F77B4] text-black border-[#1F77B4]'
                : 'bg-transparent text-[#6B7280] border-[#E5E7EB] hover:border-[#1F77B4]/50 hover:text-white'
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

          {/* UPI TAB */}
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
                  {/* Animated waiting indicator */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-full border-4 border-[#1F77B4]/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#1F77B4] animate-spin absolute" />
                      <Smartphone className="w-8 h-8 text-[#1F77B4]" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1F77B4] flex items-center justify-center">
                      <Clock className="w-3 h-3 text-black" />
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
                      You have received a payment request for the entered amount.
                    </p>
                    <p className="text-[#374151] text-sm leading-relaxed mt-3 font-semibold">
                      Please complete the payment. Your balance will be updated instantly after successful payment.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                    Request logged · Status: <span className="font-bold text-[#1F77B4]">Pending</span>
                  </div>

                  <button onClick={() => setSuccess(null)} className="mt-5 text-sm font-bold text-[#6B7280] hover:text-white transition-colors">
                    ← Submit another request
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Amount input group */}
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                      Deposit Amount <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#1F77B4] font-black text-lg bg-[#1F77B4]/10 border-r border-[#E5E7EB] select-none shrink-0">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={upiAmount}
                        onChange={e => { setUpiAmount(e.target.value); setUpiError(''); }}
                        className="flex-1 bg-transparent text-white placeholder-[#4B5563] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="Enter amount (Min ₹5,000)"
                        min={5000}
                      />
                      <span className="flex items-center px-3 text-xs font-bold text-[#6B7280] bg-transparent select-none shrink-0">
                        INR
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
                      Minimum deposit: ₹5,000 &nbsp;·&nbsp; Maximum: ₹2,00,000/day
                    </p>
                  </div>

                  {/* UPI ID input group */}
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                      Your UPI ID <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] focus-within:border-[#1F77B4]/60 transition-colors">
                      <span className="flex items-center px-4 text-[#16A34A] font-black text-base bg-[#16A34A]/10 border-r border-[#E5E7EB] select-none shrink-0">
                        @
                      </span>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                        className="flex-1 bg-transparent text-white placeholder-[#4B5563] text-sm font-medium px-4 outline-none w-0 min-w-0"
                        placeholder="Enter your UPI ID (e.g., user@upi)"
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5">
                      e.g. name@okicici, 9876543210@paytm, user@ybl
                    </p>
                  </div>

                  {upiError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30">
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <p className="text-sm text-[#DC2626] font-medium">{upiError}</p>
                    </div>
                  )}

                  <button
                    onClick={submitUPI}
                    disabled={!upiValid || depositMutation.isPending}
                    className="w-full btn-gold flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {depositMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Request Deposit
                  </button>
                </div>
              )}
            </>
          )}

          {/* USDT TAB */}
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
                  <p className="text-[#6B7280] text-sm max-w-sm leading-relaxed">
                    Verification in progress. Your balance will be credited once confirmed by our team.
                  </p>
                  <button onClick={() => setSuccess(null)} className="mt-6 text-sm font-bold text-[#1F77B4] hover:underline">
                    Submit another deposit →
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Wallet address */}
                  <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">USDT (TRC20) Wallet Address</p>
                    <p className="font-mono text-[#374151] text-xs break-all mb-3 leading-relaxed">{USDT_ADDRESS}</p>
                    <button
                      onClick={() => copyText(USDT_ADDRESS)}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#E5E7EB] text-[#6B7280] hover:text-white transition-colors font-semibold"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center py-6 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB]">
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-2 mb-3 shadow-[0_0_24px_rgba(31,119,180,0.15)]">
                      <img
                        src="/usdt-qr.jpg"
                        alt="USDT TRC20 QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-xs font-bold text-[#1F77B4] uppercase tracking-wider">Scan to Send USDT</p>
                    <p className="text-xs text-[#6B7280] mt-1">TRC20 (Tron) Network Only</p>
                  </div>

                  <div className="bg-[#1F77B4]/10 border border-[#1F77B4]/30 rounded-xl p-3 text-xs text-[#1F77B4] font-semibold">
                    ⚠ Only send USDT on the TRC20 (Tron) network. Sending on other networks will result in permanent loss of funds.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Amount (USDT) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#6B7280] font-bold text-xs">USDT</span>
                      <input
                        type="number"
                        value={usdtAmount}
                        onChange={e => { setUsdtAmount(e.target.value); setUsdtError(''); }}
                        className="input-stealth pl-14 w-full"
                        placeholder="e.g. 500"
                        min={100}
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">Minimum: 100 USDT</p>
                  </div>

                  {usdtError && <p className="text-sm text-[#DC2626] font-medium">{usdtError}</p>}

                  <button
                    onClick={submitUSDT}
                    disabled={!usdtValid || depositMutation.isPending}
                    className="w-full btn-gold flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
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
              {[
                { step: '1', text: 'Fill in the form and submit your deposit request.' },
                { step: '2', text: 'Complete the payment on your end (UPI / USDT transfer).' },
                { step: '3', text: 'Our team manually verifies the payment received.' },
                { step: '4', text: 'Balance is credited — usually within 1 hour.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1F77B4] text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                  <p className="text-sm text-[#6B7280]">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card-stealth p-6">
            <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">Processing Times</h4>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'UPI (INR)',            value: 'Within 1 hour',  color: '#16A34A' },
                { label: 'USDT (TRC20)',         value: '1–3 hours',     color: '#16A34A' },
                { label: 'Weekends / Holidays',  value: 'Up to 24 hours',color: '#1F77B4' },
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
                { label: 'Min (UPI)',      value: '₹5,000'     },
                { label: 'Max (UPI/day)', value: '₹2,00,000'  },
                { label: 'Min (USDT)',    value: '100 USDT'    },
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
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#1F77B4]" />
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownLeft className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#6B7280] font-medium">No deposits yet. Submit your first request above.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {['Date', 'Amount', 'Method', 'UPI / Reference', 'Status'].map(h => (
                      <th key={h} className="pb-4 text-left text-[#6B7280] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {deposits.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#FFFFFF]/40 transition-colors">
                      <td className="py-4 pr-6 text-[#6B7280] text-sm">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 pr-6 font-bold text-[#111827]">
                        {tx.currency === 'INR' ? '₹' : ''}{Number(tx.amount).toLocaleString('en-IN')}{tx.currency !== 'INR' ? ` ${tx.currency}` : ''}
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${tx.paymentMethod === 'upi' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#1F77B4]/20 text-[#1F77B4]'}`}>
                          {tx.paymentMethod === 'upi' ? 'UPI' : 'USDT'}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-[#6B7280] font-mono text-xs">{tx.transactionReference || '—'}</td>
                      <td className="py-4"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {deposits.map((tx: any) => (
                <div key={tx.id} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-[#111827] text-base">
                      {tx.currency === 'INR' ? '₹' : ''}{Number(tx.amount).toLocaleString('en-IN')}{tx.currency !== 'INR' ? ` ${tx.currency}` : ''}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${tx.paymentMethod === 'upi' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#1F77B4]/20 text-[#1F77B4]'}`}>
                        {tx.paymentMethod === 'upi' ? 'UPI' : 'USDT'}
                      </span>
                      {tx.transactionReference && (
                        <span className="text-[#6B7280] font-mono text-xs truncate max-w-[120px]">{tx.transactionReference}</span>
                      )}
                    </div>
                    <span className="text-[#6B7280] text-xs">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</span>
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
