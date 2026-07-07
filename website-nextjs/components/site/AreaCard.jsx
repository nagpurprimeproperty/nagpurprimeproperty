import React from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export const AreaCard = React.memo(function AreaCard({ area }) {
  return (
    <Link href={`/areas/${area.slug}`}>
      <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary">{area.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{area.properties} properties</p>
          </div>
          <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{area.description}</p>
      </div>
    </Link>
  );
})
