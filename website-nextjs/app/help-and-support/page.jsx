// app/help-and-support/page.jsx — Server Component
import React from 'react';
import connectDB from '@/server/src/config/db.js';
import StaticPage from '@/server/src/modules/static-page/static-page.model.js';
import { Phone, Mail, MessageCircle, Clock, LifeBuoy, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import FaqAccordion from './FaqAccordion';

export const revalidate = 60; // ISR — revalidate every 60 seconds

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com';

const FALLBACK_CONTACT_DATA = {
  type: 'contact',
  phone: '+91 98765 43210',
  email: 'hello@nagpurprime.in',
  whatsapp: '+91 98765 43210',
  supportHours: 'Monday - Saturday, 9:00 AM - 7:00 PM IST',
  faqs: [
    { id: '1', question: 'How do I search for properties?', answer: 'Use the search bar and apply filters like location, budget, and property type.' },
    { id: '2', question: 'How do I contact a broker?', answer: 'Open any listing and click "Contact Broker". You will need to verify your mobile number via OTP.' },
    { id: '3', question: 'What does saving a property do?', answer: 'Saved properties are stored in your favorites for easy access later.' },
    { id: '4', question: 'Is my phone number shared with brokers?', answer: 'Only with brokers you explicitly contact through our enquiry form.' },
    { id: '5', question: 'How do featured properties work?', answer: 'Featured properties get priority placement in search results and are hand-verified by our team.' },
    { id: '6', question: 'Can I schedule a property visit?', answer: 'Yes, after contacting a broker you can arrange a visit directly with them.' },
  ],
};

export async function generateMetadata() {
  try {
    await connectDB();
    const page = await StaticPage.findOne({ slug: 'contact-us', isPublished: true }).lean();
    if (!page) {
      return {
        title: 'Help & Support — Nagpur Prime Property',
        description: 'Get in touch with Nagpur Prime Property support team. Browse our frequently asked questions or contact us directly.',
        alternates: { canonical: '/help-and-support' },
      };
    }
    return {
      title: page.metaTitle || 'Help & Support — Nagpur Prime Property',
      description: page.metaDescription || 'Get in touch with Nagpur Prime Property support team. Browse our FAQs or contact us directly.',
      alternates: { canonical: '/help-and-support' },
    };
  } catch (err) {
    console.error('[HelpSupportPage] Metadata generation failed:', err?.message);
    return {
      title: 'Help & Support — Nagpur Prime Property',
    };
  }
}

export default async function HelpSupportPage() {
  let supportData = FALLBACK_CONTACT_DATA;
  let pageTitle = 'Help & Support';
  let updatedAt = Date.now();

  try {
    await connectDB();
    const page = await StaticPage.findOne({ slug: 'contact-us', isPublished: true }).lean();
    if (page) {
      if (page.title) pageTitle = page.title;
      if (page.updatedAt || page.lastUpdated) {
        updatedAt = page.updatedAt || page.lastUpdated;
      }
      if (page.content) {
        try {
          const parsed = JSON.parse(page.content);
          if (parsed && typeof parsed === 'object') {
            supportData = {
              ...FALLBACK_CONTACT_DATA,
              ...parsed,
            };
          }
        } catch (jsonErr) {
          console.error('[HelpSupportPage] Content JSON parse error, using fallback:', jsonErr?.message);
        }
      }
    }
  } catch (err) {
    console.error('[HelpSupportPage] Database query failed, using fallback:', err?.message);
  }

  const { phone, email, whatsapp, supportHours, faqs } = supportData;

  const contactChannels = [
    {
      icon: Phone,
      title: 'Call Support',
      value: phone,
      href: `tel:${phone}`,
      label: 'Call Now',
      color: 'text-primary bg-primary/10 hover:border-primary/50',
    },
    {
      icon: Mail,
      title: 'Email Support',
      value: email,
      href: `mailto:${email}`,
      label: 'Send Email',
      color: 'text-sky-500 bg-sky-500/10 hover:border-sky-500/50',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Chat',
      value: whatsapp,
      href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`,
      label: 'Open WhatsApp',
      color: 'text-emerald-500 bg-emerald-500/10 hover:border-emerald-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-[oklch(0.16_0.02_50)] py-20 text-white">
        {/* Decorative background ambient glows */}
        <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
        
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow backdrop-blur-md">
              <LifeBuoy className="h-3.5 w-3.5" /> Customer Care
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {pageTitle}
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Have questions about buying, selling, or renting properties in Nagpur? We are here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* ── CONTACT CHANNELS ── */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Connect With Us
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Choose your preferred channel to get in touch with our team directly.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <div
                  key={i}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div>
                    <div className={`grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 ${channel.color.split(' ')[1]}`}>
                      <Icon className={`h-6 w-6 ${channel.color.split(' ')[0]}`} />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-foreground">{channel.title}</h3>
                    <p className="mt-1.5 text-sm font-semibold text-muted-foreground break-all">{channel.value}</p>
                  </div>
                  <div className="mt-6">
                    <a
                      href={channel.href}
                      target={channel.href.startsWith('http') ? '_blank' : undefined}
                      rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-sm font-bold text-foreground transition-all duration-300 hover:border-primary hover:bg-gradient-primary hover:text-white hover:shadow-glow"
                    >
                      {channel.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FAQ & AVAILABILITY GRID ── */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* FAQ Accordion */}
          <div className="lg:col-span-8">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>

          {/* Availability Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.18_0.02_50)] p-6 text-white shadow-soft">
              {/* Background ambient glow inside card */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-glow" />
                <span className="font-display text-xs font-black uppercase tracking-widest text-primary-glow">
                  Availability
                </span>
              </div>
              
              <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight">
                Support Hours
              </h3>
              
              {supportHours && (
                <div className="mt-3 space-y-1">
                  {supportHours.split(',').map((part, index) => (
                    <p key={index} className={`text-sm ${index === 0 ? 'font-bold text-white' : 'text-white/70'}`}>
                      {part.trim()}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-primary-glow">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Verified Assistance</p>
                    <p className="text-[11px] text-white/60">Connect directly with authentic brokers</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-primary-glow">
                    <HeartHandshake className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Zero Commission</p>
                    <p className="text-[11px] text-white/60">We charge absolutely no deal commissions</p>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${phone}`}
                className="mt-8 block w-full rounded-xl bg-primary py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary-glow hover:shadow-glow"
              >
                Call Hotline Now
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <h4 className="font-display text-sm font-bold text-foreground">Need to delete your account?</h4>
              <p className="mt-1 text-xs text-muted-foreground">You can request account deletion at any time under our terms.</p>
              <Link
                href="/delete-account"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-glow"
              >
                Go to account deletion
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
