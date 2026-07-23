'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, ShieldAlert, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState("mobile"); // 'mobile' | 'otp' | 'success'
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }
      setStep("otp");
      toast.success(`Verification OTP sent. OTP: ${data.data?.otp}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    } catch (err) {
      toast.error(err.message || "User not found or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP.");
      }
      setStep("success");
      toast.success("Your account has been successfully deleted.");
    } catch (err) {
      toast.error(err.message || "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (i, v) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 3) otpRefs.current[i + 1]?.focus();
  };

  const onOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  if (step === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Account Deleted
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Your account and all associated profile listings, search history, saved properties, and lead logs have been permanently deleted from our database.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button className="w-full">Go to Home Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="flex items-center gap-2 text-destructive mb-6">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Delete Account Request
          </h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Please enter your mobile number. We will send an OTP to confirm account deletion. This action is permanent and cannot be undone.
        </p>

        {step === "mobile" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10 font-medium"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" variant="destructive" className="w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP to Delete Account"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep("mobile")}
              className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-4"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </button>

            <div className="space-y-2">
              <Label className="text-center block text-sm">Enter 4-Digit Verification Code</Label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(i, e)}
                    className="h-12 w-12 rounded-xl border border-input bg-background text-center text-lg font-bold text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="destructive" className="w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                "Confirm & Permanently Delete"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
