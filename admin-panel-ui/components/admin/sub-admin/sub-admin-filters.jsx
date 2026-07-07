"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Search } from "lucide-react";

/**
 * Controlled filters. Parent should debounce `searchInput` before API calls (e.g. useAdminListState).
 */
export function SubAdminFilters({ searchInput, onSearchChange, status, onStatusChange, }) {
    return (<div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
        <Input placeholder="Search by name or email…" value={searchInput} onChange={onSearchChange} className="pl-9"/>
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Select status"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>);
}
