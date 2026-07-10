// app/layout.jsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { FloatingWhatsApp, MobileBottomBar } from '@/components/site/MobileBottomBar'
import { Toaster } from '@/components/ui/sonner'
import QueryProvider from '@/providers/QueryProvider'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const AuthModal = dynamic(() => import('@/components/site/AuthModal').then((mod) => mod.AuthModal))

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'),
  title: {
    default: 'Nagpur Prime Property — Verified Flats, Plots & Villas in Nagpur',
    template: '%s | Nagpur Prime Property',
  },
  description: 'Find 1000+ verified flats, plots, villas and houses in Nagpur. Direct contact with trusted brokers — no middlemen, no spam.',
  keywords: 'property in nagpur, flats in nagpur, plots in nagpur, villas in nagpur, buy property nagpur, rent flat nagpur',
  authors: [{ name: 'Nagpur Prime Property' }],
  creator: 'Nagpur Prime Property',
  publisher: 'Nagpur Prime Property',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nagpur Prime Property',
    title: 'Nagpur Prime Property — Verified Flats, Plots & Villas',
    description: 'Find 1000+ verified flats, plots, villas and houses in Nagpur. Direct contact with trusted brokers.',
    images: [
      {
        url: '/logo.jpeg',
        width: 512,
        height: 512,
        alt: 'Nagpur Prime Property Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nagpur Prime Property — Verified Property in Nagpur',
    description: 'Find 1000+ verified flats, plots, villas in Nagpur. Direct contact with trusted brokers.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.jpeg', type: 'image/jpeg', sizes: '32x32' },
      { url: '/favicon-16x16.jpeg', type: 'image/jpeg', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-ico.jpeg', type: 'image/jpeg' },
      { url: '/android-chrome-512x512.jpeg', type: 'image/jpeg', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
  },
  verification: {
    // google: 'your-google-search-console-verification-code', // Add when you have it
  },
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isSpecialPage = pathname === '/coming-soon' || pathname === '/maintenance';

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <QueryProvider>
          {isSpecialPage ? (
            <div className="flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
              <Toaster />
            </div>
          ) : (
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomBar />
              <FloatingWhatsApp />
              <AuthModal />
              <Toaster />
            </div>
          )}
        </QueryProvider>
      </body>
    </html>
  )
}