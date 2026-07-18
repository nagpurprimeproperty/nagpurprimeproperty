"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, BookOpen, CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";
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
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { usePermission } from "@/hooks/use-permissions";

const WEBSITE_BASE = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001";

export default function BlogsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const { canWrite, canDelete } = usePermission("blogs");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBlogs(data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load blogs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async () => {
    if (!deleteSlug) return;
    try {
      const res = await fetch(`/api/v1/admin/blogs/${deleteSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      toast({ title: "Deleted", description: "Blog removed successfully" });
      setDeleteSlug(null);
      fetchBlogs();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to delete blog", variant: "destructive" });
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <PermissionGate module="blogs" action="read" fallback={<Unauthorized />}>
      <div className="space-y-6 w-full min-w-0">
        {/* ── Page header with Add button ── */}
        <AdminPageHeader
          title="Blogs"
          description="Manage website blog articles and property guides"
          onRefresh={fetchBlogs}
          isFetching={loading}
        >
          {canWrite && (
            <Link href="/admin/blogs/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Blog
              </Button>
            </Link>
          )}
        </AdminPageHeader>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">{blogs.length} article{blogs.length !== 1 ? "s" : ""}</p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading blogs…</div>
            ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 opacity-20" />
                <div className="text-center space-y-2">
                  <p className="font-medium text-foreground">No blogs yet</p>
                  <p className="text-sm">Write your first article to engage visitors.</p>
                </div>
                {canWrite && (
                  <Link href="/admin/blogs/create">
                    <Button className="gap-2 mt-1">
                      <Plus className="h-4 w-4" /> Write First Blog
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Cover</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Author</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Read</th>
                      <th className="px-4 py-3 text-left">Tags</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        {/* Cover thumbnail */}
                        <td className="px-4 py-3">
                          {b.cover ? (
                            <img
                              src={b.cover}
                              alt={b.title}
                              className="h-10 w-16 rounded-md object-cover border border-border"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground opacity-40" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <div className="font-medium truncate">{b.title}</div>
                          <div className="text-xs text-muted-foreground font-mono truncate">{b.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.author}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(b.date)}</td>
                        {/* Read time */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5" />
                            {b.readMins || 5} min
                          </span>
                        </td>
                        {/* Tags */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(b.tags || []).slice(0, 2).map((t) => (
                              <span key={t} className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                {t}
                              </span>
                            ))}
                            {(b.tags || []).length > 2 && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                +{b.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          {b.isPublished ? (
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
                              href={`${WEBSITE_BASE}/blogs/${b.slug}`}
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
                            {canWrite && (
                              <Link href={`/admin/blogs/${b.slug}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-primary"
                                  title="Edit blog"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {/* Delete */}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Delete blog"
                                onClick={() => setDeleteSlug(b.slug)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
              <AlertDialogTitle>Delete blog?</AlertDialogTitle>
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
    </PermissionGate>
  );
}
