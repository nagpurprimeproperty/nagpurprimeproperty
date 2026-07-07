'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, MessageCircle, Search, User } from 'lucide-react'
import { useClientAuth } from '@/lib/stores'

export function MobileBottomBar() {
  const pathname = usePathname()
  const { user } = useClientAuth()   // SSR-safe — null before mount, real value after

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Search', icon: Search },
    { to: '/favorites', label: 'Saved', icon: Heart },
    { to: user ? '/profile' : '/login', label: user ? 'Profile' : 'Login', icon: User },
  ]

  if (pathname === '/login') return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = it.to === '/' ? pathname === '/' : pathname.startsWith(it.to)
          return (
            <Link
              key={it.label}
              href={it.to}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function FloatingWhatsApp() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  const isPropertyDetail = /^\/properties\/[^/]+$/.test(pathname)

  return (
    <a
      href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20looking%20for%20property%20in%20Nagpur"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${
        isPropertyDetail ? 'bottom-32' : 'bottom-20'
      } right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-elegant transition-transform hover:scale-110 md:bottom-6`}
      aria-label="WhatsApp Us"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}