'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function PropertiesError({ error, reset }) {
  useEffect(() => {
    console.error('Properties Page Error Boundary caught:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-elegant">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Unable to Load Properties
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We encountered an issue while loading property listings. Please try again or return to the homepage.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            variant="hero"
            className="gap-2 shadow-soft"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" /> Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
