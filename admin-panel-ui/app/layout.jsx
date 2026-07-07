import { Analytics } from '@vercel/analytics/next';
import './globals.css';
export const metadata = {
    title: 'NagpurPrimeProperty Admin - Real Estate Lead Generation Platform',
    description: 'Admin panel for NagpurPrimeProperty - Connecting Buyers with Trusted Brokers',
    generator: 'Next.js',
    icons: {
        icon: [
            { url: '/logo.jpeg', type: 'image/jpeg', sizes: '32x32' },
            { url: '/icon-light-32x3.jpeg', type: 'image/jpeg', sizes: '32x32' },
            { url: '/icon-light-16x1.jpeg', type: 'image/jpeg', sizes: '16x16' },
            { url: '/favico.jpeg',           type: 'image/jpeg' },
        ],
        apple: [
            { url: '/apple-ico.jpeg', type: 'image/jpeg' },
        ],
        shortcut: '/logo.jpeg',
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
