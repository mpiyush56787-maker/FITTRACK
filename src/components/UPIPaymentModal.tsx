import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  HelpCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { SubscriptionTier, UpiPaymentSubmission } from '../types';
import { api } from '../api';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTier: SubscriptionTier;
  onSubmissionComplete?: (submission: UpiPaymentSubmission) => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  planTier,
  onSubmissionComplete
}) => {
  const [step, setStep] = useState<'pay' | 'completed_prompt' | 'enter_utr' | 'pending'>('pay');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [upiRefId, setUpiRefId] = useState<string>('');

  // Form states
  const [utr, setUtr] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSubmission, setActiveSubmission] = useState<UpiPaymentSubmission | null>(null);

  // Environment variables with exact fallbacks
  const payeeUpiId =
    (import.meta as any).env?.VITE_FITTRACK_UPI_ID ||
    (process.env as any)?.FITTRACK_UPI_ID ||
    'mtushar9801@okhdfcbank';

  const payeeName =
    (import.meta as any).env?.VITE_FITTRACK_UPI_NAME ||
    (process.env as any)?.FITTRACK_UPI_NAME ||
    'FITTRACK';

  const planDetails: Record<SubscriptionTier, { name: string; amount: number; subtitle: string }> = {
    FREE: { name: 'Free Athlete', amount: 0, subtitle: 'Standard logging' },
    PLAN_299: { name: 'FITTRACK Nutrition', amount: 299, subtitle: 'Personalized Indian Macro & Diet Planner' },
    PLAN_449: { name: 'FITTRACK Performance', amount: 449, subtitle: 'Custom Workout Splits & Training Routines' },
    PLAN_699: { name: 'FITTRACK Elite', amount: 699, subtitle: 'Complete Transformation & Progressive Overload AI' }
  };

  const selectedPlan = planDetails[planTier] || planDetails.PLAN_299;
  const amountInr = selectedPlan.amount;

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'upi' | 'amount') => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Fallback if clipboard API restricted
    }
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Generate UPI deep link ONLY when the user clicks the payment button
  const handlePayViaUpi = () => {
    const refId = `FTK${Date.now().toString().slice(-6)}`;
    setUpiRefId(refId);
    const transactionNote = `FITTRACK ${selectedPlan.name}`;
    const upiLink = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amountInr}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${refId}`;
    
    // Trigger deep link
    window.location.href = upiLink;
    
    // Transition to prompt without recursion
    setStep('completed_prompt');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUtr = utr.trim().replace(/\s+/g, '');
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitUtrPayment({
        planTier,
        amountInr,
        utr: cleanUtr,
        upiRefId: upiRefId || `FTK${Date.now().toString().slice(-6)}`,
        notes: userNotes
      });

      if (res.success && res.submission) {
        setActiveSubmission(res.submission);
        setStep('pending');
        if (onSubmissionComplete) {
          onSubmissionComplete(res.submission);
        }
      } else {
        setErrorMessage(res.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting UTR:', err);
      setErrorMessage(err.message || 'Failed to submit payment details. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappSupportUrl = `https://wa.me/917206125905?text=${encodeURIComponent(
    `Hi FITTRACK Support, I have made a UPI payment of ₹${amountInr} for the ${selectedPlan.name} plan. My UTR Number is: ${utr || 'Pending Verification'}. Please verify and activate my plan.`
  )}`;

  return (
    <div
      id="upi-payment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[420px] my-auto bg-[#17191C] border border-[#2A2E35] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#2A2E35] bg-[#121417] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-athletic font-bold text-white tracking-wide text-sm uppercase">
                  FITTRACK UPI PAYMENT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Direct UPI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Zero Gateway Fees • Direct UPI Transfer</p>
            </div>
          </div>
          <button
            id="close-upi-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Tracker Steps */}
        <div className="px-5 py-2.5 bg-[#14161A] border-b border-[#24272E] flex items-center justify-between text-[11px]">
          <div
            className={`flex items-center gap-1 font-athletic uppercase font-bold ${
              step === 'pay' ? 'text-red-500' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'pay' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              1
            </span>
            <span>Pay via UPI</span>
          </div>

          <span className="text-zinc-600">→</span>

          <div
            className={`flex items-center gap-1 font-athletic uppercase font-bold ${
              step === 'completed_prompt' || step === 'enter_utr' ? 'text-red-500' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'completed_prompt' || step === 'enter_utr'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              2
            </span>
            <span>Submit UTR</span>
          </div>

          <span className="text-zinc-600">→</span>

          <div
            className={`flex items-center gap-1 font-athletic uppercase font-bold ${
              step === 'pending' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'pending' ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              3
            </span>
            <span>Verification</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* STEP 1: Pay via UPI */}
          {step === 'pay' && (
            <div className="space-y-4">
              {/* Plan Summary Card */}
              <div className="bg-[#1F2228] border border-[#2D313A] rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-athletic font-bold uppercase tracking-wider text-red-500">
                    Selected Membership
                  </span>
                  <h3 className="font-athletic font-bold text-white text-base tracking-wide uppercase">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400">{selectedPlan.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-athletic text-white tracking-tight">
                    ₹{amountInr}
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-medium">1 Month Access</span>
                </div>
              </div>

              {/* Static Primary UPI Button */}
              <div className="space-y-2">
                <button
                  id={`pay-${amountInr}-via-upi-btn`}
                  onClick={handlePayViaUpi}
                  className="w-full py-4 px-4 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-athletic font-bold text-base tracking-wide uppercase shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>PAY ₹{amountInr} VIA UPI</span>
                  <ExternalLink className="h-4 w-4 ml-1 opacity-80" />
                </button>
                <p className="text-[11px] text-center text-zinc-400">
                  Opens Google Pay, PhonePe, Paytm, BHIM, or CRED directly
                </p>
              </div>

              {/* Direct UPI ID & Payee Credentials Box */}
              <div className="bg-[#1D2026] border border-[#2A2E35] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Payee Name:</span>
                  <span className="font-bold text-white tracking-wide font-athletic uppercase">
                    {payeeName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400 font-medium">FITTRACK UPI ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white select-all">
                      {payeeUpiId}
                    </span>
                    <button
                      id="copy-upi-id-btn"
                      type="button"
                      onClick={() => handleCopy(payeeUpiId, 'upi')}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {copiedUpi && (
                  <div className="text-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Copied UPI ID to Clipboard!
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400 font-medium">Amount:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 font-athletic text-base">
                      ₹{amountInr}
                    </span>
                    <button
                      id="copy-amount-btn"
                      type="button"
                      onClick={() => handleCopy(String(amountInr), 'amount')}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                      title="Copy Amount"
                    >
                      {copiedAmount ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Step: Enter UTR */}
              <button
                id="proceed-to-utr-btn"
                onClick={() => setStep('enter_utr')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#252830] hover:bg-[#2F333D] border border-zinc-700 text-white font-athletic font-bold text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>I have made the payment → Enter UTR</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          )}

          {/* STEP 2A: Payment Completed Prompt (After app opening) */}
          {step === 'completed_prompt' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-red-500" />
              </div>

              <div>
                <h3 className="font-athletic font-bold text-xl text-white uppercase tracking-wide">
                  Payment Completed?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Did you complete transferring <strong className="text-white">₹{amountInr}</strong> to{' '}
                  <strong className="text-white">{payeeUpiId}</strong> in your UPI app?
                </p>
              </div>

              <div className="bg-[#1D2026] border border-[#2A2E35] rounded-xl p-3 text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Plan:</span>
                  <span className="font-bold text-white font-athletic">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount:</span>
                  <span className="font-bold text-emerald-400 font-athletic">₹{amountInr}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  id="confirm-payment-done-btn"
                  onClick={() => setStep('enter_utr')}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-athletic font-bold text-sm tracking-wider uppercase shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>YES, PAYMENT DONE — ENTER UTR</span>
                </button>

                <button
                  id="reopen-upi-btn"
                  onClick={() => setStep('pay')}
                  className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white font-athletic font-bold text-xs tracking-wider uppercase transition cursor-pointer"
                >
                  Go Back / View Payee Details Again
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: Enter UTR / Transaction ID */}
          {step === 'enter_utr' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <span className="text-[10px] font-athletic font-bold uppercase tracking-wider text-red-500">
                  Step 2 of 3
                </span>
                <h3 className="font-athletic font-bold text-lg text-white uppercase tracking-wide">
                  Submit Payment Verification
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter the 12-digit UTR or UPI Transaction Reference number from your payment receipt.
                </p>
              </div>

              {/* Amount badge */}
              <div className="bg-[#1D2026] border border-[#2A2E35] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block font-medium">Plan</span>
                  <span className="font-athletic font-bold text-white text-xs uppercase">
                    {selectedPlan.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-400 block font-medium">Paid Amount</span>
                  <span className="font-athletic font-bold text-emerald-400 text-base">
                    ₹{amountInr}
                  </span>
                </div>
              </div>

              {/* UTR Input Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="utr-input"
                  className="block text-xs font-athletic font-bold text-zinc-300 uppercase tracking-wider"
                >
                  12-Digit UTR / Transaction Reference ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="utr-input"
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. 423589012345"
                    value={utr}
                    onChange={e => {
                      setUtr(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full bg-[#121417] border border-zinc-700 rounded-xl px-3.5 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                  {utr.trim().length >= 6 && (
                    <div className="absolute right-3 top-3 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>Found in GPay, PhonePe, or Paytm receipt as &apos;UPI Ref No.&apos; or &apos;UTR&apos;</span>
                </p>
              </div>

              {/* Optional User Notes */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-notes-input"
                  className="block text-xs font-athletic font-bold text-zinc-400 uppercase tracking-wider"
                >
                  Sender UPI ID or Remark (Optional)
                </label>
                <input
                  id="user-notes-input"
                  type="text"
                  placeholder="e.g. Paid from yourname@oksbi"
                  value={userNotes}
                  onChange={e => setUserNotes(e.target.value)}
                  className="w-full bg-[#121417] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-2 pt-1">
                <button
                  id="submit-payment-btn"
                  type="submit"
                  disabled={submitting || !utr.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-athletic font-bold text-sm tracking-wider uppercase shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting for Verification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>SUBMIT PAYMENT</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('pay')}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-white font-athletic uppercase tracking-wider transition cursor-pointer"
                >
                  ← Back to UPI Payment Button
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Payment Verification Pending */}
          {step === 'pending' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-athletic font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-2">
                  Payment Verification Pending
                </span>
                <h3 className="font-athletic font-bold text-xl text-white uppercase tracking-wide">
                  UTR Recorded Successfully
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[320px] mx-auto leading-relaxed">
                  Your payment reference has been securely submitted and logged in our system. Our team will verify the transaction with our bank account.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-[#1D2026] border border-[#2A2E35] rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Selected Plan</span>
                  <span className="font-bold text-white font-athletic uppercase">
                    {selectedPlan.name}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Amount</span>
                  <span className="font-bold text-emerald-400 font-athletic text-sm">
                    ₹{amountInr}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Submitted UTR</span>
                  <span className="font-mono font-bold text-white select-all">
                    {activeSubmission?.utr || utr}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Payee UPI</span>
                  <span className="font-mono text-zinc-300">{payeeUpiId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Status</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-athletic uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Verification Pending
                  </span>
                </div>
              </div>

              {/* Policy note */}
              <div className="bg-[#121417] border border-[#24272E] rounded-xl p-3 text-left flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-300">Feature Activation Policy:</strong> Paid tier features unlock immediately upon bank verification. Plan stays in current tier until verified.
                </p>
              </div>

              {/* Instant WhatsApp Priority Verification Button */}
              <div className="space-y-2 pt-1">
                <a
                  id="whatsapp-priority-verify-btn"
                  href={whatsappSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-athletic font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send UTR on WhatsApp for Fast Approval</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>

                <button
                  id="done-view-dashboard-btn"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-[#252830] hover:bg-[#2E333C] text-white font-athletic font-bold text-xs tracking-wider uppercase transition cursor-pointer"
                >
                  Done — Close &amp; Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
