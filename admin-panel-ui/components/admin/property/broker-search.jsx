"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userApi } from "@/lib/api/user.api";
export function BrokerSearch({ selectedId, selectedName, onSelect, onClear, disabled = false, }) {
    const [query, setQuery] = useState("");
    const { data } = useQuery({
        queryKey: ["broker-search", query],
        queryFn: () => userApi.list({ search: query, limit: 15,isActive: true }),
        enabled: query.trim().length >= 2,
        staleTime: 10000,
        placeholderData: (prev) => prev,
    });
    const brokers = data?.data ?? [];
    return (<div className="space-y-2">
      <Label>
        User <span className="text-destructive">*</span>
      </Label>

      {/* Selected broker chip */}
      {selectedId ? (<div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <User className="h-4 w-4 text-primary"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedName}</p>
            <p className="text-xs text-muted-foreground">ID: {selectedId}</p>
          </div>
          {!disabled && (<button type="button" onClick={() => { onClear(); setQuery(""); }} className="text-muted-foreground hover:text-destructive transition shrink-0">
              <X className="h-4 w-4"/>
            </button>)}
        </div>) : (<>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search broker by name or mobile…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" disabled={disabled}/>
          </div>

          {/* Results dropdown */}
          {brokers.length > 0 && (<div className="rounded-lg border bg-popover shadow-md max-h-52 overflow-y-auto divide-y">
              {brokers.map((b) => (<button key={b._id} type="button" onClick={() => { onSelect(b._id, b.name); setQuery(""); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.mobile} · {b.city ?? "Nagpur"}</p>
                  </div>
                </button>))}
            </div>)}

          {query.trim().length >= 2 && brokers.length === 0 && (<p className="text-sm text-muted-foreground px-1">No brokers found for "{query}"</p>)}

          {query.trim().length < 2 && (<p className="text-xs text-muted-foreground px-1">Type at least 2 characters to search</p>)}
        </>)}
    </div>);
}
