// app/blogs/[slug]/BlogDetailClient.js
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Clock, Share2, Mail, Globe } from 'lucide-react'
import { toast } from 'sonner'

function ensureHeadingHierarchy(html) {
  if (!html) return '';
  return html
    .replace(/<h1\b([^>]*)>/gi, '<h2 class="font-display text-xl font-bold mt-6 mb-3"$1>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/<h2\b([^>]*)>/gi, '<h3 class="font-display text-lg font-bold mt-5 mb-2"$1>')
    .replace(/<\/h2>/gi, '</h3>')
    .replace(/<h3\b([^>]*)>/gi, '<h4 class="font-display text-base font-bold mt-4 mb-2"$1>')
    .replace(/<\/h3>/gi, '</h4>');
}

export default function BlogDetailClient({ blog: b, related }) {
  const tags = Array.isArray(b.tags) ? b.tags : []
  const content = Array.isArray(b.content) ? b.content : []
  const relatedList = Array.isArray(related) ? related : []

  const handleShareNative = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: b.title, text: b.excerpt || '', url });
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const handleShareEmail = () => {
    const url = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(b.title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`;
  };

  const handleCopyLink = () => copyToClipboard(window.location.href);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link.'));
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> All articles
          </Link>
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            {b.title}
          </h1>
          {b.excerpt && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {b.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            {b.authorImage && (
              <Image
                src={b.authorImage}
                alt={b.author || 'Author avatar'}
                width={44}
                height={44}
                className="rounded-full object-cover ring-2 ring-background"
              />
            )}
            <div className="text-sm">
              <div className="font-semibold">{b.author}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {b.date && (
                  <span>
                    {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {b.date && b.readMins && <span>•</span>}
                {b.readMins && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {b.readMins} min read
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {b.cover && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="-mt-2 overflow-hidden rounded-2xl shadow-elegant sm:-mt-4 relative aspect-[16/9] w-full bg-muted">
            <Image src={b.cover} alt={b.title || 'Blog cover'} fill priority className="object-cover" />
          </div>
        </div>
      )}

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">

          {/* Article body */}
          <article className="min-w-0">
            {content.length > 0 ? (
              content.map((s, i) => (
                <section key={i} id={`h${i}`} className="mb-12 scroll-mt-24">
                  {/* Chapter label */}
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {String(i + 1).padStart(2, '0')} — Chapter
                  </div>

                  {/* Section heading → plain text from admin input */}
                  {s.heading && (
                    <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl mb-4">
                      {s.heading}
                    </h2>
                  )}

                  {/* Section body → rendered as HTML (supports bold, links, lists etc.) */}
                  <div
                    className={`rich-text${i === 0 ? ' rich-text-dropcap' : ''}`}
                    dangerouslySetInnerHTML={{ __html: ensureHeadingHierarchy(s.body) }}
                  />
                </section>
              ))
            ) : (
              <p className="text-muted-foreground">No content available for this article.</p>
            )}

            {/* Share */}
            <div className="mt-12 flex items-center gap-3 border-t border-border pt-6">
              <div className="text-xs font-semibold text-muted-foreground">Share this article</div>
              <button
                onClick={handleShareNative}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                title="Share article"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleShareEmail}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                title="Share via Email"
              >
                <Mail className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                title="Copy Link"
              >
                <Globe className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            {/* Table of contents — from section headings */}
            {content.some((s) => s.heading) && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  In this article
                </div>
                <ol className="mt-3 space-y-2 text-sm">
                  {content.map((s, i) =>
                    s.heading ? (
                      <li key={i} className="flex gap-2">
                        <span className="text-xs font-bold text-muted-foreground">{i + 1}.</span>
                        <a href={`#h${i}`} className="text-foreground/80 hover:text-primary">
                          {s.heading}
                        </a>
                      </li>
                    ) : null
                  )}
                </ol>
              </div>
            )}

            {/* CTA card */}
            <div className="overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-elegant">
              <h3 className="font-display text-base font-bold">Find your Nagpur home</h3>
              <p className="mt-1 text-xs opacity-90">1000+ verified listings across the city.</p>
              <Link
                href="/properties"
                className="mt-3 inline-block rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                Browse Properties →
              </Link>
            </div>
          </aside>
        </div>

        {/* Related articles */}
        {relatedList.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h3 className="font-display text-2xl font-bold">Related reads</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedList.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blogs/${r.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-elegant"
                >
                  {r.cover && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={r.cover}
                        alt={r.title || 'Related read'}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {(r.tags || [])[0] && (
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                        {r.tags[0]}
                      </div>
                    )}
                    <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                      {r.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}