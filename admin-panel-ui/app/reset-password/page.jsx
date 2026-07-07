"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { KeyRound, AlertCircle, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [apiError, setApiError] = useState("")

  const token = params.get("token") ?? ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium text-destructive">Invalid reset link</p>
        <p className="text-sm text-muted-foreground">
          This link is missing a reset token. Please request a new one.
        </p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setApiError("")
    const result = await resetPassword({
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    })

    if (result.success) {
      toast({ title: "Password reset successfully. Please log in." })
      router.replace("/login")
    } else {
      setApiError(result.error ?? "Invalid or expired reset link. Please request a new one.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {apiError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Min 8 characters"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat new password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting…</>
        ) : (
          "Reset Password"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Request a new link
        </Link>
      </div>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Image src="/logo.jpeg" alt="NagpurPrimeProperty" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">Nagpur</span>
            <span className="text-primary">Prime</span>
            <span className="text-primary">Property</span>
          </h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">Set new password</CardTitle>
            <CardDescription>Enter and confirm your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
