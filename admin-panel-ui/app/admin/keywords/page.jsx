"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Tag, CheckCircle, XCircle,
  Star, StarOff, MousePointerClick, Upload, Lightbulb,
  ExternalLink, TrendingUp, Search, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const WEBSITE_BASE = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001";
const CATEGORIES = ["All", "Property Type", "Budget", "Intent", "Area", "General"];

export default function KeywordsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();

  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const fileRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/keywords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setKeywords(data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load keywords", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = keywords.filter((kw) => {
    const matchSearch = !search ||
      kw.keyword.toLowerCase().includes(search.toLowerCase()) ||
      kw.redirectUrl.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || kw.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Category counts
  const categoryCounts = keywords.reduce((acc, kw) => {
    acc[kw.category] = (acc[kw.category] || 0) + 1;
    return acc;
  }, {});

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/v1/admin/keywords/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      toast({ title: "Deleted", description: `"${deleteName}" removed successfully` });
      setDeleteId(null);
      setDeleteName("");
      fetchKeywords();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  // ── Toggle active / featured ───────────────────────────────────────────────
  const handleToggle = async (id, field) => {
    const kw = keywords.find((k) => k._id === id);
    if (!kw) return;
    try {
      const res = await fetch(`/api/v1/admin/keywords/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !kw[field] }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchKeywords();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Suggestions ────────────────────────────────────────────────────────────
  const loadSuggestions = async () => {
    setSuggestLoading(true);
    try {
      const res = await fetch("/api/v1/admin/keywords/suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuggestions(data.data || []);
      setShowSuggestions(true);
    } catch {
      toast({ title: "Error", description: "Failed to load suggestions", variant: "destructive" });
    } finally {
      setSuggestLoading(false);
    }
  };

  const importSelected = async () => {
    if (!selectedSuggestions.length) return;
    setBulkImporting(true);
    try {
      const res = await fetch("/api/v1/admin/keywords", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true, rows: selectedSuggestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import failed");
      toast({ title: "Imported!", description: data.message });
      setShowSuggestions(false);
      setSelectedSuggestions([]);
      fetchKeywords();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkImporting(false);
    }
  };

  const toggleSuggestion = (s) => {
    setSelectedSuggestions((prev) =>
      prev.find((x) => x.keyword === s.keyword)
        ? prev.filter((x) => x.keyword !== s.keyword)
        : [...prev, s]
    );
  };

  // ── Bulk CSV Import ────────────────────────────────────────────────────────
  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result || "");
    reader.readAsText(file);
  };

  const parseCsvToRows = (text) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
    });
  };

  const handleBulkImport = async () => {
    const rows = parseCsvToRows(csvText);
    if (!rows.length) {
      toast({ title: "Error", description: "No valid rows found in CSV", variant: "destructive" });
      return;
    }
    setBulkImporting(true);
    try {
      const res = await fetch("/api/v1/admin/keywords", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import failed");
      toast({ title: "Imported!", description: data.message });
      setShowBulkImport(false);
      setCsvText("");
      fetchKeywords();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkImporting(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalClicks = keywords.reduce((s, k) => s + (k.clickCount || 0), 0);
  const activeCount = keywords.filter((k) => k.isActive).length;
  const featuredCount = keywords.filter((k) => k.isFeatured).length;

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Page Header ── */}
      <AdminPageHeader
        title="SEO Keywords"
        description="Manage homepage SEO keywords with click tracking, categories, and smart suggestions"
        onRefresh={fetchKeywords}
        isFetching={loading}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={loadSuggestions}
            disabled={suggestLoading}
          >
            <Lightbulb className="h-4 w-4" />
            {suggestLoading ? "Loading…" : "Smart Suggestions"}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowBulkImport(true)}
          >
            <Upload className="h-4 w-4" />
            Bulk Import CSV
          </Button>
          <Link href="/admin/keywords/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Keyword
            </Button>
          </Link>
        </div>
      </AdminPageHeader>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Keywords", value: keywords.length, icon: Tag, color: "text-blue-600" },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "text-green-600" },
          { label: "Featured", value: featuredCount, icon: Star, color: "text-amber-500" },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-orange-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-8 w-8 ${s.color} shrink-0`} />
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search keywords or URLs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat}
              {cat !== "All" && categoryCounts[cat] ? (
                <span className="ml-1 opacity-60">({categoryCounts[cat]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── Keywords Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              Loading keywords…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
              <Tag className="h-12 w-12 opacity-20" />
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">No keywords found</p>
                <p className="text-sm">
                  {keywords.length === 0
                    ? "Add your first SEO keyword or use Smart Suggestions."
                    : "Try adjusting your search or category filter."}
                </p>
              </div>
              {keywords.length === 0 && (
                <div className="flex gap-2">
                  <Button className="gap-2" onClick={loadSuggestions}>
                    <Lightbulb className="h-4 w-4" /> Smart Suggestions
                  </Button>
                  <Link href="/admin/keywords/create">
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Keyword
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Keyword</th>
                    <th className="px-4 py-3 text-left">Redirect URL</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-center">Clicks</th>
                    <th className="px-4 py-3 text-center">Order</th>
                    <th className="px-4 py-3 text-center">Featured</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((kw) => (
                    <tr key={kw._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      {/* Keyword */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {kw.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <span className="font-medium">{kw.keyword}</span>
                        </div>
                      </td>
                      {/* Redirect URL */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <a
                          href={`${kw.redirectUrl.startsWith("http") ? "" : WEBSITE_BASE}${kw.redirectUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-mono truncate"
                        >
                          {kw.redirectUrl}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                          {kw.category || "General"}
                        </span>
                      </td>
                      {/* Clicks */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <MousePointerClick className="h-3.5 w-3.5" />
                          {(kw.clickCount || 0).toLocaleString()}
                        </div>
                      </td>
                      {/* Sort Order */}
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {kw.sortOrder ?? 0}
                      </td>
                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(kw._id, "isFeatured")}
                          title={kw.isFeatured ? "Remove featured" : "Mark as featured"}
                          className={`rounded-full p-1.5 transition-colors ${
                            kw.isFeatured
                              ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                              : "bg-muted text-muted-foreground hover:text-amber-500"
                          }`}
                        >
                          {kw.isFeatured
                            ? <Star className="h-3.5 w-3.5 fill-amber-500" />
                            : <StarOff className="h-3.5 w-3.5" />
                          }
                        </button>
                      </td>
                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(kw._id, "isActive")}
                          title={kw.isActive ? "Deactivate" : "Activate"}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors ${
                            kw.isActive
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {kw.isActive
                            ? <><CheckCircle className="h-3 w-3" /> Active</>
                            : <><XCircle className="h-3 w-3" /> Inactive</>
                          }
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/keywords/${kw._id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete"
                            onClick={() => { setDeleteId(kw._id); setDeleteName(kw.keyword); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete keyword?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteName}"</strong> and remove it from the website. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Smart Suggestions Dialog ── */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Smart Keyword Suggestions
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {suggestions.length} new keywords you haven't added yet. Select all you want to import.
            </p>
          </DialogHeader>

          {suggestions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              🎉 Great! You've already added all suggested keywords.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Select All */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedSuggestions(
                      selectedSuggestions.length === suggestions.length ? [] : [...suggestions]
                    )
                  }
                >
                  {selectedSuggestions.length === suggestions.length ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedSuggestions.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => {
                  const selected = !!selectedSuggestions.find((x) => x.keyword === s.keyword);
                  return (
                    <button
                      key={s.keyword}
                      onClick={() => toggleSuggestion(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {s.keyword}
                      <span className="ml-1.5 opacity-60 text-[10px]">{s.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestions(false)}>Cancel</Button>
            <Button
              onClick={importSelected}
              disabled={!selectedSuggestions.length || bulkImporting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {bulkImporting ? "Importing…" : `Import ${selectedSuggestions.length} Keywords`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk CSV Import Dialog ── */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Import Keywords via CSV
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">CSV Format (required columns):</p>
              <code className="block bg-background rounded p-2 font-mono text-[11px]">
                keyword,redirectUrl,category,isFeatured,sortOrder<br />
                "Flats in Nagpur","/properties?type=apartment","Property Type","false","0"<br />
                "Buy Plot Nagpur","/properties?type=plot","Intent","true","1"
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Upload CSV File</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFile}
                className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Or Paste CSV Text</label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                placeholder="keyword,redirectUrl,category,isFeatured,sortOrder&#10;Flat in Nagpur,/properties,Property Type,false,0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {csvText && (
              <p className="text-xs text-muted-foreground">
                ~{parseCsvToRows(csvText).length} rows detected
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkImport(false); setCsvText(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={!csvText.trim() || bulkImporting}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {bulkImporting ? "Importing…" : "Import Keywords"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
