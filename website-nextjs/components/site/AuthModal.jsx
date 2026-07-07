'use client'
/**
 * AuthModal — Global login dialog (matches the mobile app's AuthModal pattern)
 *
 * Triggered by calling: useAuth.getState().openAuth()
 * Never navigates away — user stays on the current page.
 * After successful login the modal closes and the action resumes.
 */
import { useState, useRef, useEffect } from 'react'
import { Loader2, Phone, ShieldCheck, X, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/stores'
import { useSendOTP, useVerifyOTP } from '@/lib/hooks/useAuthMutations'
import { toast } from 'sonner'

export function AuthModal() {
  const showAuthModal = useAuth((s) => s.showAuthModal)
  const closeAuth = useAuth((s) => s.closeAuth)
  const login = useAuth((s) => s.login)

  const [step, setStep] = useState('mobile') // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [resendIn, setResendIn] = useState(0)
  const otpRefs = useRef([])

  const sendOTPMutation = useSendOTP()
  const verifyOTPMutation = useVerifyOTP()
  const loading = sendOTPMutation.isPending || verifyOTPMutation.isPending

  // Reset state when modal opens
  useEffect(() => {
    if (showAuthModal) {
      setStep('mobile')
      setMobile('')
      setOtp(['', '', '', ''])
      setResendIn(0)
    }
  }, [showAuthModal])

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showAuthModal])

  const handleClose = () => {
    closeAuth()
  }

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    try {
      const otpVal = await sendOTPMutation.mutateAsync({ mobile, name: 'User' })
      setStep('otp')
      setResendIn(30)
      toast.success(`OTP sent to your mobile number. OTP: ${otpVal}`)
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Please try again.')
    }
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 4) {
      toast.error('Enter the 4-digit OTP')
      return
    }
    try {
      // clientFetch returns json.data — which is now { user, token }
      const res = await verifyOTPMutation.mutateAsync({ mobile, otp: code })
      const userData = res?.user
      const token = res?.token
      if (!token) throw new Error('Login failed — token missing. Please try again.')
      login(userData, token)
      toast.success('Welcome to Nagpur Prime Property!')
      closeAuth()
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.')
    }
  }

  const onOtpChange = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 3) otpRefs.current[i + 1]?.focus()
  }

  if (!showAuthModal) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom sheet — slides up from bottom on mobile, centered on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom-8 duration-300
                   sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                   sm:slide-in-from-bottom-0 sm:zoom-in-95"
      >
        <div className="rounded-t-3xl bg-card sm:rounded-3xl border border-border shadow-2xl p-6 pb-10 sm:pb-6">
          {/* Handle bar (mobile) */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                {step === 'mobile' ? <Phone className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">
                  {step === 'mobile' ? 'Login to continue' : 'Verify OTP'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {step === 'mobile'
                    ? "We'll send a one-time password to your phone"
                    : `Code sent to +91 ${mobile}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-2 w-2 rounded-full transition-colors ${step === 'mobile' ? 'bg-primary' : 'bg-border'}`} />
            <div className="h-px w-8 bg-border" />
            <div className={`h-2 w-2 rounded-full transition-colors ${step === 'otp' ? 'bg-primary' : 'bg-border'}`} />
          </div>

          {step === 'mobile' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <span className="text-sm font-semibold text-muted-foreground select-none">+91</span>
                <input
                  id="auth-modal-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                By continuing you agree to our Terms &amp; Privacy Policy
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep('mobile'); setOtp(['', '', '', '']) }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Change number
              </button>
              <div className="flex justify-center gap-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
                      if (e.key === 'Enter') verifyOtp()
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-14 w-12 rounded-xl border border-input bg-background text-center font-display text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Continue'}
              </button>
              <div className="text-center text-xs text-muted-foreground">
                {resendIn > 0 ? (
                  <>Resend OTP in {resendIn}s</>
                ) : (
                  <button type="button" onClick={sendOtp} className="font-semibold text-primary hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
