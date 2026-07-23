'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Heart, Menu, Search, User, X, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth, useFavorites, useClientAuth, useHasHydrated } from '@/lib/stores'
import { useAllSavedPropertyIds } from '@/lib/hooks/useProfile'
import { LazyAppDownloadModal } from '@/components/site/LazyAppDownloadModal'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/areas', label: 'Areas' },
  { to: '/blogs', label: 'Blogs' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  // useClientAuth: null before mount (SSR safe), real value after mount
  const { user, token } = useClientAuth()
  const hydrated = useHasHydrated()
  const favCount = useFavorites((s) => s.ids.length)
  const pathname = usePathname()

  const { data: allSavedIds } = useAllSavedPropertyIds(token)

  useEffect(() => {
    if (token && allSavedIds) {
      useFavorites.getState().setIds(allSavedIds)
    } else if (!token) {
      useFavorites.getState().setIds([])
    }
  }, [token, allSavedIds])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt="Nagpur Prime Property Logo"
            width={36}
            height={36}
            className="rounded-xl object-cover shadow-elegant"
          />
          <div className="leading-tight">
            <div className="font-display text-base font-bold sm:text-lg max-w-[140px] truncate sm:max-w-none">Nagpur Prime Property</div>
            <div className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
              Verified Listings
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)
            return (
              <Link
                key={n.to}
                href={n.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  active ? 'bg-accent text-primary' : 'text-foreground/70'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className="hidden rounded-lg p-2 text-foreground/70 hover:bg-accent md:inline-flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/favorites"
            className="relative hidden rounded-lg p-2 text-foreground/70 hover:bg-accent md:inline-flex"
            aria-label="Favorites"
          >
            <Heart className="h-5 w-5" />
            {hydrated && favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {favCount}
              </span>
            )}
          </Link>
          <div className="hidden md:block">
            <Button
              className="gap-1.5 btn-premium-cta"
              size="sm"
              onClick={() => setDownloadOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Property Free
            </Button>
          </div>
          {user ? (
            <Link href="/profile" className="hidden md:inline-flex">
              <Button variant="outline" size="sm" className="w-full">
                <User className="mr-1.5 h-4 w-4" /> {user.name.split(' ')[0]}
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="hero" size="sm" className="w-full">Login</Button>
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 hover:bg-accent md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Favorites ({favCount})
            </Link>
            <div className="pt-2 px-3">
              <button
                onClick={() => { setOpen(false); setDownloadOpen(true); }}
                className="w-full justify-center gap-2 btn-premium-cta"
              >
                <Plus className="h-4 w-4" /> Add Property Free
              </button>
            </div>
            {user ? (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                My Profile
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block pt-2">
                <Button variant="hero" className="w-full">Login with mobile</Button>
              </Link>
            )}
          </div>
        </div>
      )}
      <LazyAppDownloadModal open={downloadOpen} onOpenChange={setDownloadOpen} />
    </header>
  )
}