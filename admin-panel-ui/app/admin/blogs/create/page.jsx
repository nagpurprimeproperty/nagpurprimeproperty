"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { ImageUploader } from "@/components/admin/common/image-uploader";
import { RichTextEditor } from "@/components/admin/settings/rich-text-editor";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/hooks/use-toast";

const EMPTY_SECTION = { heading: "", body: "" };

export default function CreateBlogPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", cover: "",
    author: "", authorImage: "",
    date: new Date().toISOString().slice(0, 10),
    readMins: 5, tags: "", isPublished: true,
  });
  const [content, setContent] = useState([{ ...EMPTY_SECTION }]);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const tagPreview = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

  // Strip HTML tags to check if body is empty
  const isHtmlEmpty = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Validation", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: "Validation", description: "Slug is required", variant: "destructive" });
      return;
    }
    if (!form.author.trim()) {
      toast({ title: "Validation", description: "Author name is required", variant: "destructive" });
      return;
    }
    const validContent = content.filter((s) => !isHtmlEmpty(s.body));
    if (validContent.length === 0) {
      toast({ title: "Validation", description: "At least one section with content is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, content: validContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create blog");
      toast({ title: "Blog created!", description: `"${form.title}" is now live on the website.` });
      router.push("/admin/blogs");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const addSection = () => setContent((c) => [...c, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setContent((c) => c.filter((_, idx) => idx !== i));
  const setSection = (i, k, v) =>
    setContent((c) => c.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  return (
    <div className="space-y-6 w-full min-w-0">
      <AdminPageHeader title="Create Blog" description="Write a new article for the website" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Post Info ── */}
        <Card>
          <CardHeader><CardTitle>Post Info</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="Title *" className="sm:col-span-2">
              <Input
                value={form.title}
                onChange={(e) => { set("title", e.target.value); set("slug", autoSlug(e.target.value)); }}
                placeholder="e.g. Top 5 areas in Nagpur for investment in 2025"
              />
            </Field>
            <Field label="Slug *" className="sm:col-span-2">
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated from title"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used in the URL: /blogs/<strong>{form.slug || "your-slug"}</strong>
              </p>
            </Field>
            <Field label="Excerpt" className="sm:col-span-2">
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="Short summary shown in the blog listing page…"
              />
            </Field>

            <div className="sm:col-span-2">
              <ImageUploader label="Cover Image" value={form.cover} onChange={(url) => set("cover", url)} />
            </div>

            <Field label="Author *">
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="e.g. Priya Sharma" />
            </Field>

            <div className="flex flex-col items-start gap-1.5">
              <p className="text-sm font-medium">Author Photo</p>
              <ImageUploader circular value={form.authorImage} onChange={(url) => set("authorImage", url)} />
            </div>

            <Field label="Published Date">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Read Time (minutes)">
              <Input type="number" min={1} value={form.readMins} onChange={(e) => set("readMins", Number(e.target.value))} />
            </Field>

            <Field label="Tags (comma-separated)" className="sm:col-span-2">
              <Input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="e.g. Investment, Lifestyle, MIHAN"
              />
              {tagPreview.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tagPreview.map((t, i) => (
                    <span key={i} className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Tags help readers find related articles on the website.</p>
            </Field>
          </CardContent>
        </Card>

        {/* ── Content Sections ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Content Sections</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Each section has an optional chapter heading and a rich body.
                Select text in the body to <strong>bold</strong>, <em>italicize</em>, or{" "}
                <span className="text-primary underline">add a link</span> on any keyword.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSection} className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Add Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Section {i + 1}
                  </span>
                  {content.length > 1 && (
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeSection(i)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Field label="Heading (optional — becomes chapter title on website)">
                  <Input
                    value={s.heading}
                    onChange={(e) => setSection(i, "heading", e.target.value)}
                    placeholder="e.g. Why MIHAN is a great investment"
                  />
                </Field>

                <div className="space-y-1.5">
                  <Label>
                    Body * — <span className="text-muted-foreground font-normal">select text to bold, link or format keywords</span>
                  </Label>
                  <RichTextEditor
                    value={s.body}
                    onChange={(val) => setSection(i, "body", val)}
                    placeholder="Write this section's content here. Select any word and use the toolbar to make it bold, italic, or add a hyperlink…"
                    minHeight={220}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Publish toggle ── */}
        <div className="flex items-center gap-3">
          <Checkbox id="pub" checked={form.isPublished} onCheckedChange={(v) => set("isPublished", !!v)} />
          <Label htmlFor="pub">Publish immediately (visible on website)</Label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Create Blog"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/blogs")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
