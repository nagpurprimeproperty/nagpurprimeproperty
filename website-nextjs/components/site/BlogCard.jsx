import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const BlogCard = React.memo(function BlogCard({ blog }) {
  return (
    <Link href={`/blogs/${blog.slug}`}>
      <article className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary hover:shadow-md">
        <div className="aspect-video bg-muted" />
        <div className="p-4">
          <span className="text-xs font-semibold uppercase text-primary">{blog.category}</span>
          <h3 className="mt-2 font-semibold text-lg line-clamp-2 group-hover:text-primary">{blog.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{blog.date}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </article>
    </Link>
  );
});
