// app/manifest.js — Web App Manifest / PWA (Next.js App Router)

export default function manifest() {
  return {
    name: 'Nagpur Prime Property',
    short_name: 'NPP',
    description: 'Find verified flats, plots and villas in Nagpur. Direct contact with trusted brokers.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fdfaf7',
    theme_color: '#c97f3a',
    categories: ['real estate', 'property', 'housing'],
    lang: 'en-IN',
    icons: [
      {
        src: '/android-chrome-512x512.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
      {
        src: '/logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  }
}
