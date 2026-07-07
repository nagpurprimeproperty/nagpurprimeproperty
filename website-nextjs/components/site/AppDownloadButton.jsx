// components/site/AppDownloadButton.jsx
'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LazyAppDownloadModal } from '@/components/site/LazyAppDownloadModal'

export default function AppDownloadButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        size="lg"
        variant="secondary"
        className="font-semibold"
        onClick={() => setOpen(true)}
      >
        List Property <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
      <LazyAppDownloadModal open={open} onOpenChange={setOpen} />
    </>
  )
}