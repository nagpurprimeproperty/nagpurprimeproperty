'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { Loader2, Phone, ShieldCheck, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/stores";
import { useSendOTP, useVerifyOTP } from "@/lib/hooks/useAuthMutations";
import { toast } from "sonner";
import Image from "next/image";

function LoginContent() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile";

  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef([]);

  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();

  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, router, redirect]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    try {
      const otpVal = await sendOTPMutation.mutateAsync({ mobile, name: "User" });
      setStep("otp");
      setResendIn(30);
      toast.success(`OTP sent to your mobile number. OTP: ${otpVal}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    try {
      // clientFetch returns json.data — which is now { user, token }
      const res = await verifyOTPMutation.mutateAsync({ mobile, otp: code });
      const userData = res?.user;
      const token = res?.token;
      if (!token) throw new Error('Login failed — please try again.');
      login(userData, token);
      toast.success("Welcome to Nagpur Prime Property!");
      router.push(redirect);
    } catch (err) {
      toast.error(err.message || "Invalid OTP. Please try again.");
    }
  };

  const onOtpChange = (i, v) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 3) otpRefs.current[i + 1]?.focus();
  };

  const loading = sendOTPMutation.isPending || verifyOTPMutation.isPending;

  return (
    <div className="flex min-h-[80vh] w-full bg-background">
      {/* Left Side: Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[540px] bg-gradient-to-br from-orange-50/20 via-background to-orange-50/5 relative z-10 shadow-2xl lg:shadow-[20px_0_40px_rgba(0,0,0,0.02)] border-r border-border/50">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand/Logo Section */}
          <div className="mb-6 text-center lg:text-left">
            <div className="mx-auto lg:mx-0 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-md">
              <Image src="/logo.jpeg" alt="Nagpur Prime Property" width={48} height={48} className="object-contain rounded-xl"/>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {step === "mobile" ? "Login with mobile" : "Verify OTP"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step === "mobile"
                ? "We'll send a one-time password to your phone"
                : `Enter the 4-digit code sent to +91 ${mobile}`}
            </p>
          </div>

          <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-elegant">
            {step === "mobile" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-xs font-semibold text-muted-foreground">Mobile number</Label>
                  <div className="flex items-center gap-2 rounded-xl border border-input bg-background pl-3 py-0.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <span className="text-sm font-semibold text-muted-foreground">+91</span>
                    <Input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="border-0 shadow-none focus-visible:ring-0 text-base"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  By continuing you agree to our Terms &amp; Privacy Policy
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setStep("mobile"); setOtp(["", "", "", ""]); }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Change number
                </button>
                <div className="flex justify-center gap-3">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      value={d}
                      onChange={(e) => onOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                      }}
                      inputMode="numeric"
                      maxLength={1}
                      className="h-14 w-12 rounded-xl border border-input bg-background text-center font-display text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
                </Button>
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

          <p className="mt-8 text-center text-xs text-muted-foreground/80">
            Connecting Buyers with Trusted Brokers &bull; NagpurPrimeProperty
          </p>
        </div>
      </div>

      {/* Right Side: Hero Visual Panel */}
      <div className="relative hidden flex-1 lg:block bg-slate-900 overflow-hidden">
        <Image
          src="/loginscreen.jpeg"
          alt="Nagpur Prime Property Login Background"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-10000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-transparent" />
        
        {/* Floating dynamic glassmorphic card on the image */}
        <div className="absolute bottom-16 left-16 right-16 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 p-8 text-white shadow-2xl max-w-xl animate-fade-in">
          <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary mb-4">
            Nagpur Prime Property
          </span>
          <h3 className="font-display text-2xl font-bold tracking-tight mb-2">
            Find Your Dream Property in Nagpur
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed mb-4">
            Log in to save your favorite listings, receive instant property alerts, and connect directly with verified, spam-free local brokers.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-300 border-t border-white/10 pt-4">
            <span className="font-medium text-white">Why NPP:</span>
            <span>Direct Broker Contact</span>
            <span>&bull;</span>
            <span>Zero Brokerage Options</span>
            <span>&bull;</span>
            <span>100% Verified Listings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-xl bg-muted-foreground/15" />
          <Skeleton className="mx-auto h-6 w-32 bg-muted-foreground/15" />
          <Skeleton className="mx-auto h-4 w-48 bg-muted-foreground/10" />
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-muted-foreground/15" />
            <Skeleton className="h-10 w-full bg-muted-foreground/15 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full bg-muted-foreground/15 rounded-md" />
        </div>
      </div>
    </div>
  );
}
