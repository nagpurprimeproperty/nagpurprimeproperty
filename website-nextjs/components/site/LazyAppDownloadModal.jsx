import dynamic from 'next/dynamic'

export const LazyAppDownloadModal = dynamic(
  () => import('@/components/site/AppDownloadModal').then((mod) => mod.AppDownloadModal),
  { ssr: false }
)
