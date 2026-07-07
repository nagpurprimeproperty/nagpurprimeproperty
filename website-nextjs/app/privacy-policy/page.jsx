import connectDB from '@/server/src/config/db.js';
import StaticPage from '@/server/src/modules/static-page/static-page.model.js';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR - revalidate every 60 seconds

export default async function PrivacyPolicyPage() {
  let page = null;
  try {
    await connectDB();
    page = await StaticPage.findOne({ slug: 'privacy-policy', isPublished: true }).lean();
  } catch (err) {
    console.error('Failed to load privacy policy page from DB:', err);
  }

  if (!page) {
    notFound();
  }

  const updatedAt = page.updatedAt || page.lastUpdated || Date.now();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {page.title}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Last updated: {new Date(updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div 
        className="rich-text mt-8 text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
