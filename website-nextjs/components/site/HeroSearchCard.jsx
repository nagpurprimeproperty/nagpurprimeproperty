// components/site/HeroSearchCard.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocationSearch } from '@/components/site/LocationSearch'
import Link from 'next/link'

const BUDGETS = [
  { v: 'any', label: 'Any budget' },
  { v: '20', label: 'Under ₹20 Lakh' },
  { v: '50', label: '₹20L – ₹50 Lakh' },
  { v: '100', label: '₹50L – ₹1 Cr' },
  { v: '200', label: '₹1 Cr – ₹2 Cr' },
  { v: '201', label: 'Above ₹2 Cr' },
]

export default function HeroSearchCard({ popularAreas }) {
  const [query, setQuery] = useState('')
  const [selectedAreaSlug, setSelectedAreaSlug] = useState(null)
  const [budget, setBudget] = useState('any')
  const router = useRouter()

  const handleSelectSuggestion = (s) => {
    setQuery(s.label)
    if (s.areaSlug) {
      setSelectedAreaSlug(s.areaSlug)
    } else {
      setSelectedAreaSlug(null)
    }
  }

  const goSearch = () => {
    const queryParts = []
    if (query.trim()) {
      queryParts.push(`search=${encodeURIComponent(query.trim())}`)
    }
    if (selectedAreaSlug) {
      queryParts.push(`areaSlug=${encodeURIComponent(selectedAreaSlug)}`)
    }
    if (budget !== 'any') {
      queryParts.push(`budget=${budget}`)
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
    router.push(`/properties${queryString}`)
  }

  return (
    <>
      <div className="relative z-30 mt-7 rounded-2xl border border-background/20 bg-background/95 p-3 shadow-glow backdrop-blur md:p-4">
        <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_auto]">
          <LocationSearch
            value={query}
            onChange={(val) => { setQuery(val); setSelectedAreaSlug(null); }}
            onSelect={handleSelectSuggestion}
            placeholder="Search locality, project or area…"
          />
          <div className="rounded-xl border border-border bg-background px-3 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Budget</div>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-primary" />
                  <SelectValue placeholder="Any budget" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {BUDGETS.map((b) => <SelectItem key={b.v} value={b.v}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="hero" size="lg" onClick={goSearch}>
            <Search className="mr-1 h-4 w-4" /> Search
          </Button>
        </div>
      </div>
    </>
  )
}