"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/auth-store"

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [apiError, setApiError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data) => {
    setApiError("")
    const result = await forgotPassword({ email: data.email })
    if (result.success) {
      setSentEmail(data.email)
      setSent(true)
    } else {
      setApiError(result.error ?? "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
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
            <CardTitle className="text-xl font-semibold">Forgot password</CardTitle>
            <CardDescription>
              {sent
                ? "Check your inbox for the reset link"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 rounded-lg bg-green-50 p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Reset link sent!</p>
                    <p className="mt-1 text-sm text-green-700">
                      We sent a password reset link to{" "}
                      <strong>{sentEmail}</strong>.{" "}
                      Click the link in that email to set a new password.
                    </p>
                    <p className="mt-2 text-xs text-green-600">
                      The link expires in 20 minutes. Check your spam folder if you don't see it.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setSent(false); setApiError("") }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {apiError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
