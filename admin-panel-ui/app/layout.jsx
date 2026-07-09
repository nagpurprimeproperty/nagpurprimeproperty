import { Analytics } from '@vercel/analytics/next';
import './globals.css';
export const metadata = {
    title: 'NagpurPrimeProperty Admin - Real Estate Lead Generation Platform',
    description: 'Admin panel for NagpurPrimeProperty - Connecting Buyers with Trusted Brokers',
    generator: 'Next.js',
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
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gilroy:wght@200;300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>);
}
