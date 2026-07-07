import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-background px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find Your Perfect Property in Nagpur
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Verified listings of flats, plots, and villas with direct broker contact
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/properties">
              <Button size="lg" variant="hero">
                Browse Properties
              </Button>
            </Link>
            <Link href="/areas">
              <Button size="lg" variant="outline">
                Explore Areas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
