// app/properties/[slug]/PropertyDetailClient.jsx
'use client'
import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Heart, MapPin, MessageCircle, Phone, Share2, Sparkles,
} from 'lucide-react'
import { useFavorites, useViewed, useUnlocked, useLeads, useAuth, getPersistedAuth, useHasHydrated } from '@/lib/stores'
import { BrokerCard } from '@/components/site/BrokerCard'
import { PropertyCard } from '@/components/site/PropertyCard'
import { PropertyMedia } from '@/components/site/PropertyMedia'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useSubmitEnquiry } from '@/lib/hooks/useEnquiry'
import { useSaveToggle } from '@/lib/hooks/useProperties'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getDetailsList } from '@/lib/property-details'


export default function PropertyDetailClient({ property: p, broker, similar }) {
  const router = useRouter()
  const { highlights, specsTable, financeTable } = useMemo(() => getDetailsList(p), [p])
  const fav = useFavorites()
  const pid = p._id || p.id
  const hydrated = useHasHydrated()
  const liked = hydrated && fav.ids.includes(pid)
  const pushViewed = useViewed((s) => s.push)

  const saveToggleMutation = useSaveToggle()
  const submitEnquiry = useSubmitEnquiry()

  useEffect(() => { pushViewed(pid) }, [pid, pushViewed])

  const handleSaveToggle = () => {
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    fav.toggle(pid);
    saveToggleMutation.mutate({ id: pid, token }, {
      onError: (err) => { console.warn('Save toggle backend error:', err.message); }
    });
  };

  const handleScheduleVisit = () => {
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const brokerId = p.brokerId || (broker && broker.id);

    // Perform background submission using user profile details
    const leadDetails = {
      name: user.name || 'Verified User',
      mobile: user.mobile || '9876543210',
      message: `Requested to schedule a visit for property: ${p.title}`,
      brokerId,
      propertyId: pid,
    };

    // Optimistically update local store and unlock contact
    useLeads.getState().add(leadDetails);
    if (brokerId) useUnlocked.getState().unlock(brokerId);

    // Submit backend enquiry
    submitEnquiry.mutate(
      { 
        propertyId: pid, 
        data: { name: leadDetails.name, mobile: leadDetails.mobile, message: leadDetails.message }, 
        token 
      },
      {
        onError: (err) => {
          console.warn('Schedule visit mutation error:', err.message);
        },
      }
    );

    toast.success('Visit Scheduled!', {
      description: 'The broker will contact you shortly on your registered number.',
    });
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Back to All Properties Header */}
      <section className="bg-secondary/40 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Link href="/properties" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to all properties
          </Link>
          <PropertyMedia images={p.images || p.photos || []} video={p.video} alt={p.title} aspectClassName="aspect-[16/10]" rounded="rounded-2xl" />
        </div>
      </section>

      {/* Main Details Body */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Title, Badges, Address */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {p.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                )}
                <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground">{p.type}</span>
                <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-success">Verified</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl text-foreground leading-tight">{p.title}</h1>
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>{typeof p.location === 'string' ? p.location : [p.location?.locality, p.location?.subLocality, p.location?.city].filter(Boolean).join(', ')}</span>
              </div>

              {/* Price Gradient Header Container */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-card to-secondary/30 p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Price Details</span>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight text-primary">
                        {p.totalPrice || p.priceLabel || (p.pricing?.totalPrice ? `₹${p.pricing.totalPrice.toLocaleString('en-IN')}` : 'Price on request')}
                      </span>
                      {p.pricing?.pricePerSqft ? (
                        <span className="text-xs font-semibold text-muted-foreground">/ (~ ₹{p.pricing.pricePerSqft.toLocaleString('en-IN')}/sqft)</span>
                      ) : (p.pricing?.totalPrice && (p.details?.superBuiltUpArea || p.details?.builtUpArea) ? (
                        <span className="text-xs font-semibold text-muted-foreground">
                          / (~ ₹{Math.round(p.pricing.totalPrice / (p.details.superBuiltUpArea || p.details.builtUpArea)).toLocaleString('en-IN')}/sqft)
                        </span>
                      ) : null)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                      onClick={handleSaveToggle} 
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-soft transition-all hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
                      aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={cn("h-5 w-5 transition-transform", liked && "fill-primary text-primary scale-110")} />
                    </button>
                    <button 
                      onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied') }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-soft transition-all hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
                      aria-label="Share page"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            {highlights.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map((h, idx) => (
                  <Stat key={idx} icon={h.icon} label={h.label} value={h.value} />
                ))}
              </div>
            )}

            {/* About Block */}
            <Block title="About this property">
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">{p.description}</p>
            </Block>

            {/* Amenities Block */}
            {p.amenities && p.amenities.length > 0 && (
              <Block title="Amenities">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft hover:shadow-md transition-all">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-sm text-foreground">{a}</span>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {/* Nearby Landmarks Block */}
            {p.landmarks && p.landmarks.length > 0 && (
              <Block title="Nearby landmarks">
                <div className="grid gap-3 sm:grid-cols-2">
                  {p.landmarks.map((l) => (
                    <div key={l.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-soft hover:shadow-md transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm text-foreground truncate">{l.name}</span>
                      </div>
                      <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground shrink-0">{l.distance}</span>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {/* Specifications Block */}
            {specsTable.length > 0 && (
              <Block title="Property Specifications">
                <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:grid-cols-2">
                  {specsTable.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/30 pb-3 text-sm last:border-none last:pb-0 md:border-b-0 md:pb-0 md:p-3.5 md:hover:bg-secondary/20 md:rounded-xl md:transition-colors">
                      <span className="font-medium text-muted-foreground">{spec.label}</span>
                      <span className="rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {/* Pricing Block */}
            {financeTable.length > 0 && (
              <Block title="Pricing & Financial Details">
                <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:grid-cols-2">
                  {financeTable.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/30 pb-3 text-sm last:border-none last:pb-0 md:border-b-0 md:pb-0 md:p-3.5 md:hover:bg-secondary/20 md:rounded-xl md:transition-colors">
                      <span className="font-medium text-muted-foreground">{f.label}</span>
                      <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {/* FAQs Block */}
            <Block title="Frequently asked">
              <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
                {[
                  { q: 'Is this property ready to move?', a: 'Yes, the property is ready to move with all amenities operational.' },
                  { q: 'Are home loans available?', a: 'Yes, this project is approved by major banks including SBI, HDFC and ICICI.' },
                  { q: 'Can I schedule a site visit?', a: "Click 'Schedule Visit' and our broker will reach out within an hour." },
                ].map((f, i) => (
                  <AccordionItem key={i} value={`f${i}`} className="border-b border-border/40 px-5 last:border-0">
                    <AccordionTrigger className="text-sm font-semibold py-4 hover:no-underline hover:text-primary transition-colors">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Block>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-20 space-y-4">
              {broker && <BrokerCard broker={broker} propertyTitle={p.title} />}
              <Button variant="hero" size="lg" className="w-full text-base font-semibold" onClick={handleScheduleVisit}>
                Schedule a Visit
              </Button>
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similar && similar.length > 0 && (
          <div className="mt-16 border-t border-border/50 pt-10">
            <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-foreground">Similar properties</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => <PropertyCard key={s._id || s.id || i} p={s} index={i} />)}
            </div>
          </div>
        )}
      </section>

      {/* Mobile CTA Footer */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden shadow-lg">
        <div className="grid grid-cols-3 gap-2 p-2">
          <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-secondary/40 active:scale-95 transition-transform">
            <Phone className="h-4 w-4 text-primary" /> Call
          </a>
          <a href={`https://wa.me/919876543210?text=${encodeURIComponent('Interested in ' + p.title)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-whatsapp py-2.5 text-xs font-bold text-whatsapp-foreground hover:opacity-95 active:scale-95 transition-transform">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <button onClick={handleScheduleVisit} className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95 active:scale-95 transition-transform cursor-pointer">
            Visit
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-md transition-all">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-display text-sm font-bold text-foreground truncate">{value}</div>
      </div>
    </div>
  )
}

function Block({ title, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full bg-primary" />
        <h2 className="font-display text-lg font-bold text-foreground sm:text-xl tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}