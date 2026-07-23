"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tag, Star, ArrowLeft, MousePointerClick, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";

const CATEGORIES = ["General", "Property Type", "Budget", "Intent", "Area", "Amenity", "Other"];

export default function EditKeywordPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/v1/admin/keywords/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");
        setForm(data.data);
      } catch (err) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form?.keyword?.trim()) {
      toast({ title: "Validation", description: "Keyword text is required", variant: "destructive" });
      return;
    }
    if (!form?.redirectUrl?.trim()) {
      toast({ title: "Validation", description: "Redirect URL is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/keywords/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.message || "Failed to update");
        error.errors = data.errors;
        throw error;
      }
      toast({ title: "Updated!", description: `"${form.keyword}" has been saved.` });
      router.push("/admin/keywords");
    } catch (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading keyword…
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <p>Keyword not found.</p>
        <Link href="/admin/keywords">
          <Button variant="outline">← Back to Keywords</Button>
        </Link>
      </div>
    );
  }

  return (
    <PermissionGate module="keywords" action="write" fallback={<Unauthorized />}>
      <div className="space-y-6 w-full min-w-0">
      <AdminPageHeader
        title="Edit SEO Keyword"
        description={`Editing: "${form.keyword}"`}
      />

      {/* Click stats banner */}
      {(form.clickCount > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <MousePointerClick className="h-5 w-5 text-orange-500" />
          <div>
            <span className="font-semibold text-orange-700">{form.clickCount.toLocaleString()} clicks</span>
            <span className="ml-2 text-sm text-orange-600">recorded for this keyword</span>
          </div>
          <TrendingUp className="h-4 w-4 text-orange-400 ml-auto" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Main Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4 text-primary" />
              Keyword Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Keyword Text *">
              <Input
                value={form.keyword}
                onChange={(e) => set("keyword", e.target.value)}
                placeholder="e.g. Flats in Nagpur"
                maxLength={100}
              />
            </Field>

            <Field label="Redirect URL *">
              <Input
                value={form.redirectUrl}
                onChange={(e) => set("redirectUrl", e.target.value)}
                placeholder="e.g. /properties?type=apartment or https://..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use relative paths for internal pages or full URLs for external links.
              </p>
            </Field>

            <Field label="Category">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set("category", cat)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      form.category === cat
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Sort Order">
              <Input
                type="number"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
                className="w-32"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers appear first.
              </p>
            </Field>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-amber-500" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", !!v)}
              />
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inactive keywords are hidden from the homepage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="isFeatured"
                checked={form.isFeatured}
                onCheckedChange={(v) => set("isFeatured", !!v)}
              />
              <div>
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured <span className="ml-1 text-amber-500">★</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Featured keywords display larger with a star badge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {form.isFeatured ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {form.keyword}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground">
                  {form.keyword}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              → Redirects to: <code className="bg-muted px-1 rounded">{form.redirectUrl || "(not set)"}</code>
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="gap-2">
            <Tag className="h-4 w-4" />
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
          <Link href="/admin/keywords">
            <Button type="button" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </Link>
        </div>
      </form>
    </div>
    </PermissionGate>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
