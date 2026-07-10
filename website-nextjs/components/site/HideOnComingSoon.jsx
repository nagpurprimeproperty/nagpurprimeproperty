'use client'

import { usePathname } from 'next/navigation';

export default function HideOnComingSoon({ children }) {
  const pathname = usePathname();
  if (pathname === '/coming-soon' || pathname === '/maintenance') {
    return null;
  }
  return children;
}
