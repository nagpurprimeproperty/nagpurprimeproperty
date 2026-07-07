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
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-elegant">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          {step === "mobile" ? <Phone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <h1 className="mt-4 text-center font-display text-2xl font-bold">
          {step === "mobile" ? "Login with mobile" : "Verify OTP"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {step === "mobile"
            ? "We'll send a one-time password to your phone"
            : `Enter the 4-digit code sent to +91 ${mobile}`}
        </p>

        {step === "mobile" ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile number</Label>
              <div className="flex items-center gap-2 rounded-md border border-input bg-background pl-3">
                <span className="text-sm font-semibold text-muted-foreground">+91</span>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="hero"
              size="lg"
              className="w-full"
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
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => { setStep("mobile"); setOtp(["", "", "", ""]); }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
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
                  className="h-14 w-12 rounded-xl border border-input bg-background text-center font-display text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              ))}
            </div>
            <Button
              type="button"
              variant="hero"
              size="lg"
              className="w-full"
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
