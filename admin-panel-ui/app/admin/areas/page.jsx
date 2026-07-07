"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, MapPin, CheckCircle, XCircle, ExternalLink, GraduationCap, Hospital } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const WEBSITE_BASE = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001";

export default function AreasPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/areas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAreas(data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load areas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAreas(); }, []);

  const handleDelete = async () => {
    if (!deleteSlug) return;
    try {
      const res = await fetch(`/api/v1/admin/areas/${deleteSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      toast({ title: "Deleted", description: "Area removed successfully" });
      setDeleteSlug(null);
      fetchAreas();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to delete area", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ── Page header with Add button ── */}
      <AdminPageHeader
        title="Areas"
        description="Manage Nagpur localities displayed on the website"
        onRefresh={fetchAreas}
        isFetching={loading}
      >
        <Link href="/admin/areas/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Area
          </Button>
        </Link>
      </AdminPageHeader>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm text-muted-foreground">{areas.length} area{areas.length !== 1 ? "s" : ""}</p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading areas…</div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
              <MapPin className="h-12 w-12 opacity-20" />
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">No areas yet</p>
                <p className="text-sm">Create your first locality to get started.</p>
              </div>
              <Link href="/admin/areas/create">
                <Button className="gap-2 mt-1">
                  <Plus className="h-4 w-4" /> Create First Area
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Image</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Starting Price</th>
                    <th className="px-4 py-3 text-left">Schools</th>
                    <th className="px-4 py-3 text-left">Hospitals</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((a) => (
                    <tr key={a.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      {/* Banner thumbnail */}
                      <td className="px-4 py-3">
                        {a.banner ? (
                          <img
                            src={a.banner}
                            alt={a.name}
                            className="h-10 w-16 rounded-md object-cover border border-border"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-muted-foreground opacity-40" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.city}</td>
                      <td className="px-4 py-3 font-medium">{a.startingPrice || "—"}</td>
                      {/* Schools count */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {Array.isArray(a.schools) ? a.schools.length : 0}
                        </span>
                      </td>
                      {/* Hospitals count */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Hospital className="h-3.5 w-3.5" />
                          {Array.isArray(a.hospitals) ? a.hospitals.length : 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
                            <CheckCircle className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 border border-gray-200">
                            <XCircle className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      {/* ── Actions ── */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View on website */}
                          <a
                            href={`${WEBSITE_BASE}/areas/${a.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="View on website"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          {/* Edit */}
                          <Link href={`/admin/areas/${a.slug}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-primary"
                              title="Edit area"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete area"
                            onClick={() => setDeleteSlug(a.slug)}
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

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteSlug} onOpenChange={(o) => !o && setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete area?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteSlug}</strong> and remove it from the website. This action cannot be undone.
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
    </div>
  );
}
