// app/areas/[slug]/AreaClient.jsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  ChevronLeft,
  GraduationCap,
  Hospital,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { PropertyCard } from '@/components/site/PropertyCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function AreaClient({ area: a, props, related, blogs = [] }) {
  // Safely normalise array fields that may be missing in older documents
  const schools = Array.isArray(a.schools) ? a.schools : []
  const hospitals = Array.isArray(a.hospitals) ? a.hospitals : []
  const faqs = Array.isArray(a.faqs) ? a.faqs : []
  const propsList = Array.isArray(props) ? props : []
  const relatedList = Array.isArray(related) ? related : []
  const blogsList = Array.isArray(blogs) ? blogs : []

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative h-[48vh] min-h-[340px] max-h-[420px] overflow-hidden">
        {a.banner && (
          <Image
            src={a.banner}
            alt={a.name || 'Banner'}
            fill
            priority
            className="absolute inset-0 object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/55 to-foreground/15" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6">
          <Link
            href="/areas"
            className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold text-background backdrop-blur transition-colors hover:bg-background hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> All areas
          </Link>
          <div className="text-xs uppercase tracking-[0.2em] text-background/80">
            <MapPin className="mr-1 inline h-3 w-3" /> {a.city}
          </div>
          <h1 className="mt-1 font-display text-4xl font-extrabold text-background sm:text-6xl">
            {a.name}
          </h1>
          {a.metaDescription && (
            <p className="mt-2 max-w-2xl text-sm text-background/85 sm:text-base">
              {a.metaDescription}
            </p>
          )}
        </div>
      </section>

      {/* Stat strip */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          <Stat icon={Building2} label="Live properties" value={String(propsList.length)} className="border-r border-b border-border sm:border-b-0" />
          <Stat icon={TrendingUp} label="Starting price" value={a.startingPrice || '—'} className="border-b border-border sm:border-r sm:border-b-0" />
          <Stat icon={GraduationCap} label="Schools nearby" value={String(schools.length)} className="border-r border-border" />
          <Stat icon={Hospital} label="Hospitals nearby" value={String(hospitals.length)} />
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* Overview */}
            {a.description && (
              <Block kicker="Overview" title={`About ${a.name}`}>
                <div
                  className="rich-text"
                  dangerouslySetInnerHTML={{ __html: a.description }}
                />
              </Block>
            )}

            {/* Connectivity */}
            {a.connectivity && (
              <Block kicker="Getting around" title="Connectivity">
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <RouteIcon className="h-5 w-5" />
                  </span>
                  <div
                    className="rich-text text-sm"
                    dangerouslySetInnerHTML={{ __html: a.connectivity }}
                  />
                </div>
              </Block>
            )}

            {/* Lifestyle */}
            {(schools.length > 0 || hospitals.length > 0) && (
              <Block kicker="Lifestyle" title="What's around">
                <div className="grid gap-4 sm:grid-cols-2">
                  {schools.length > 0 && (
                    <InfoCard icon={GraduationCap} title="Schools nearby" items={schools} />
                  )}
                  {hospitals.length > 0 && (
                    <InfoCard icon={Hospital} title="Hospitals nearby" items={hospitals} />
                  )}
                </div>
              </Block>
            )}

            {/* Investment */}
            {a.investment && (
              <Block kicker="The numbers" title="Investment potential">
                <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div
                    className="rich-text text-sm"
                    dangerouslySetInnerHTML={{ __html: a.investment }}
                  />
                </div>
              </Block>
            )}

            {/* Properties */}
            <Block
              kicker="Inventory"
              title={`Available properties in ${a.name}`}
              meta={`${propsList.length} listing${propsList.length === 1 ? '' : 's'}`}
            >
              {propsList.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {propsList.map((p, i) => (
                    <PropertyCard key={p.id || p._id || i} p={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No listings available right now. Check back soon.
                </div>
              )}
            </Block>

            {/* FAQs */}
            {faqs.length > 0 && (
              <Block kicker="Common questions" title="Frequently asked questions">
                <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
                  {faqs.map((f, i) => (
                    <AccordionItem key={i} value={`a${i}`}>
                      <AccordionTrigger className="text-left text-sm font-semibold">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        <div
                          className="rich-text text-sm"
                          dangerouslySetInnerHTML={{ __html: f.a }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Block>
            )}

            {/* Blogs */}
            {blogsList.length > 0 && (
              <Block kicker="Read more" title="Guides about Nagpur">
                <div className="grid gap-4 sm:grid-cols-3">
                  {blogsList.slice(0, 3).map((b) => (
                    <Link
                      key={b.slug}
                      href={`/blogs/${b.slug}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
                    >
                      {b.cover && (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                          <Image
                            src={b.cover}
                            alt={b.title || 'Blog cover'}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {(b.tags || [])[0] && (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            {b.tags[0]}
                          </div>
                        )}
                        <div className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                          {b.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Block>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-elegant">
                <Sparkles className="h-5 w-5" />
                <h3 className="mt-3 font-display text-lg font-bold leading-tight">
                  Talk to a {a.name} specialist
                </h3>
                <p className="mt-1 text-xs opacity-90">
                  Get matched with a verified broker who knows {a.name} inside out.
                </p>
                <Link
                  href="/properties"
                  className="mt-4 inline-block rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-transform hover:scale-105"
                >
                  See all listings →
                </Link>
              </div>

              {relatedList.length > 0 && (
                <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-display text-base font-bold">Related areas</h3>
                  <div className="mt-3 space-y-2">
                    {relatedList.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/areas/${r.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-accent/30"
                      >
                        {r.banner && (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={r.banner}
                              alt={r.name || 'Area thumbnail'}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{r.name}</div>
                          {r.startingPrice && (
                            <div className="truncate text-xs text-muted-foreground">
                              From {r.startingPrice}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

function Stat({ icon: Icon, label, value, className }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-5 sm:px-6 ${className || ''}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-lg font-extrabold leading-tight">{value}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function Block({ kicker, title, meta, children }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{kicker}</div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        {meta && (
          <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">{meta}</span>
        )}
      </div>
      {children}
    </section>
  )
}

function InfoCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-foreground/80">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}