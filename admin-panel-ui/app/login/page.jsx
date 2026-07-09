"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore, useIsAuthenticated, useAuthLoading } from "@/lib/store/auth-store";
const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState("");
    // Already logged in → redirect to admin
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/admin");
        }
    }, [isAuthenticated, router]);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });
    const onSubmit = async (data) => {
        setApiError("");
        const result = await login(data);
        if (result.success) {
            router.replace("/admin");
        }
        else {
            setApiError(result.error ?? "Invalid email or password");
        }
    };
    return (
      <div className="flex min-h-screen w-full bg-white">
        {/* Left Side: Form Container */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[540px] bg-gradient-to-br from-orange-50/40 via-white to-orange-50/10 relative z-10 shadow-2xl lg:shadow-[20px_0_40px_rgba(0,0,0,0.03)] border-r border-orange-100/30">
          <div className="mx-auto w-full max-w-sm">
            {/* Brand */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md border border-orange-100/50">
                <Image src="/logo.jpeg" alt="NagpurProperty" width={64} height={64} className="object-contain"/>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                <span className="text-slate-900">Nagpur</span>
                <span className="text-primary ml-1">Prime Property</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Admin Portal</p>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md">
              <CardHeader className="space-y-1 pb-4 text-center lg:text-left">
                <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
                <CardDescription>Sign in to access the admin dashboard</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* API error */}
                  {apiError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0"/>
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                      <Input id="email" type="email" placeholder="admin@example.com" className="pl-10" autoComplete="email" disabled={isLoading} {...register("email")}/>
                    </div>
                    {errors.email && (<p className="text-xs text-destructive">{errors.email.message}</p>)}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" autoComplete="current-password" disabled={isLoading} {...register("password")}/>
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showPassword ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                      </button>
                    </div>
                    {errors.password && (<p className="text-xs text-destructive">{errors.password.message}</p>)}
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white transition-all shadow-md hover:shadow-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Signing in…
                      </>
                    ) : ("Sign In")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-8 text-center text-xs text-muted-foreground/80">
              Connecting Buyers with Trusted Brokers &bull; NagpurPrimeProperty
            </p>
          </div>
        </div>

        {/* Right Side: Hero Visual Panel */}
        <div className="relative hidden flex-1 lg:block bg-slate-900 overflow-hidden">
          <Image
            src="/loginscreen.jpeg"
            alt="Nagpur Prime Property Admin Portal Background"
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-10000 hover:scale-105"
          />
          {/* Subtle gradient overlay to make overlay text readable */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-transparent" />
          
          {/* Floating dynamic glassmorphic card on the image */}
          <div className="absolute bottom-16 left-16 right-16 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 p-8 text-white shadow-2xl max-w-xl animate-fade-in">
            <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary mb-4">
              Real Estate Portal
            </span>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              Nagpur's Leading Property Network
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed mb-4">
              Access real-time leads, track broker performance, and manage premium residential and commercial listings across the city.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300 border-t border-white/10 pt-4">
              <span className="font-medium text-white">Quick Stats:</span>
              <span>10K+ Premium Listings</span>
              <span>&bull;</span>
              <span>500+ Verified Brokers</span>
            </div>
          </div>
        </div>
      </div>);
}
