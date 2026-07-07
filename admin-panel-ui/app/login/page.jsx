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
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Image src="/logo.jpeg" alt="NagpurProperty" width={64} height={64} className="object-contain"/>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">Nagpur</span>
            <span className="text-primary">Prime</span>
            <span className="text-primary">Property</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* API error */}
              {apiError && (<div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0"/>
                  <span>{apiError}</span>
                </div>)}

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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Signing in…
                  </>) : ("Sign In")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Connecting Buyers with Trusted Brokers
        </p>
      </div>
    </div>);
}
