import { MapPin, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { useSearchSuggestions } from '@/lib/hooks/useProperties';
import { cn } from '@/lib/utils';

export const LocationSearch = forwardRef(function LocationSearch(
  { value, onChange, onSelect, placeholder = 'Search locality, project or area…', className, compact = false },
  forwardedRef
) {
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);
  const ref = forwardedRef || localRef;

  // Debounce query for API
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  const { data: apiSuggestions = [] } = useSearchSuggestions(debouncedQuery);

  const suggestions = useMemo(() => {
    const list = Array.isArray(apiSuggestions) ? apiSuggestions : [];
    // Fallback static suggestion when no query
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return [{ label: 'Nagpur', sublabel: 'All city', areaSlug: undefined }];
    }
    return list.slice(0, 6).map((s) => ({
      label: s.title || s.label || s.name || (typeof s === 'string' ? s : ''),
      sublabel: s.subtitle || s.sublabel || s.type || 'Property',
      areaSlug: s.areaSlug || s.slug,
      propertyId: s.propertyId,
      type: s.type,
    }));
  }, [apiSuggestions, debouncedQuery]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [ref]);

  return (
    <div ref={ref} className={cn('relative z-20', className)}>
      <div className={cn('flex items-center gap-2 rounded-xl border border-border bg-background px-3', compact ? 'h-10' : 'h-12')}>
        <Search className="h-4 w-4 text-primary" />
        <input
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-elegant ring-1 ring-black/5">
          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Suggestions
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(s.label); setOpen(false); onSelect?.(s); }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <div className="truncate font-medium">{s.label}</div>
                <div className="truncate text-xs text-muted-foreground">{s.sublabel}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
