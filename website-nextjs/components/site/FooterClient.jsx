'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, Shield, Star } from 'lucide-react';

const explore = [
  { to: '/properties', label: 'All Properties' },
  { to: '/areas', label: 'Popular Areas' },
  { to: '/blogs', label: 'Blog & Guides' },
  { to: '/about-us', label: 'About Us' },
  { to: '/favorites', label: 'Saved Homes' },
  { to: '/login', label: 'Login' },
];

function FacebookIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export function FooterClient({ initialAboutData = {}, initialAreasList = [] }) {
  const [aboutData, setAboutData] = useState(initialAboutData);

  useEffect(() => {
    // Fetch fresh details from API on client-side mount
    async function load() {
      try {
        const res = await fetch('/api/pages/about-us');
        const json = await res.json();
        if (json.success && json.data?.content) {
          const parsed = JSON.parse(json.data.content);
          setAboutData(parsed);
        }
      } catch (err) {
        console.error('Failed to load footer config on client:', err);
      }
    }
    load();
  }, []);

  const activeLocalities = initialAreasList.length > 0 
    ? initialAreasList.slice(0, 4).map(a => ({ slug: a.slug, label: a.name }))
    : [
        { slug: 'dighori-nagpur', label: 'Dighori' },
        { slug: 'mihan-nagpur', label: 'MIHAN' },
        { slug: 'wardha-road-nagpur', label: 'Wardha Road' },
        { slug: 'manish-nagar-nagpur', label: 'Manish Nagar' },
      ];

  const address = aboutData.contactInfo?.address || "Wardha Road, Nagpur 440015, Maharashtra";
  const phone = aboutData.contactInfo?.phone || "+91 98765 43210";
  const email = aboutData.contactInfo?.email || "hello@nagpurprime.in";

  return (
    <footer className="relative mt-24 overflow-hidden bg-[oklch(0.16_0.02_50)] text-[oklch(0.97_0.005_80)]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <Image
                src="/logo.jpeg"
                alt="Nagpur Prime Property Logo"
                width={44}
                height={44}
                className="rounded-xl object-cover shadow-glow transition group-hover:scale-105"
              />
              <div className="leading-tight">
                <div className="font-display text-base font-bold text-white">Nagpur Prime Property</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Verified Listings</div>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm text-white/60">
              Nagpur&apos;s premium real estate marketplace — verified flats, plots and villas across
              MIHAN, Wardha Road, Dighori and beyond.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                <Shield className="h-3.5 w-3.5 text-primary" /> RERA-aware
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                <Star className="h-3.5 w-3.5 text-primary" /> Hand-verified brokers
              </span>
            </div>
            <div className="mt-6 flex gap-2">
              {aboutData.contactInfo?.facebook && (
                <a
                  href={aboutData.contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook link"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary hover:bg-gradient-primary hover:text-white hover:shadow-glow"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {aboutData.contactInfo?.instagram && (
                <a
                  href={aboutData.contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram link"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary hover:bg-gradient-primary hover:text-white hover:shadow-glow"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {aboutData.contactInfo?.youtube && (
                <a
                  href={aboutData.contactInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube link"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary hover:bg-gradient-primary hover:text-white hover:shadow-glow"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {explore.map((l) => (
                <li key={l.to}>
                  <Link
                    href={l.to}
                    className="inline-flex items-center gap-1 text-white/75 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Localities */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Top Localities</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {activeLocalities.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/areas/${l.slug}`}
                    className="group inline-flex items-center gap-1.5 text-white/75 transition hover:text-white"
                  >
                    Property in {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Get in touch</h4>
            <ul className="mt-5 space-y-3.5 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                {address}
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-primary">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
              </li>
            </ul>
            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-primary hover:bg-gradient-primary hover:shadow-glow"
            >
              Browse properties <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Nagpur Prime Property. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/about-us" className="transition hover:text-white">About Us</Link>
            <Link href="/privacy-policy" className="transition hover:text-white">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition hover:text-white">Terms</Link>
            <Link href="/help-and-support" className="transition hover:text-white">Help & Support</Link>
            <Link href="/delete-account" className="transition hover:text-white">Delete Account</Link>
            <span className="hidden sm:inline">Built for Nagpur • Made with ♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
