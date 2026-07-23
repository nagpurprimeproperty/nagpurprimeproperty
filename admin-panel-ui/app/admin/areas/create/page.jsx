"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { ImageUploader } from "@/components/admin/common/image-uploader";
import { RichTextEditor } from "@/components/admin/settings/rich-text-editor";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";

const EMPTY_FAQ = { q: "", a: "" };

export default function CreateAreaPage() {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", slug: "", city: "Nagpur", banner: "", startingPrice: "",
    metaTitle: "", metaDescription: "",
    connectivity: "", schools: "", hospitals: "",
    isPublished: true,
  });
  // Rich text fields stored separately
  const [description, setDescription] = useState("");
  const [investment, setInvestment] = useState("");
  const [faqs, setFaqs] = useState([{ ...EMPTY_FAQ }]);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation", description: "Area name is required", variant: "destructive" });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: "Validation", description: "Slug is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          description,
          investment,
          faqs: faqs.filter((f) => f.q && f.a),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.message || "Failed");
        error.errors = data.errors;
        throw error;
      }
      toast({ title: "Area created!", description: `${form.name} is now live.` });
      router.push("/admin/areas");
    } catch (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const addFaq = () => setFaqs((f) => [...f, { ...EMPTY_FAQ }]);
  const removeFaq = (i) => setFaqs((f) => f.filter((_, idx) => idx !== i));
  const setFaq = (i, k, v) => setFaqs((f) => f.map((fq, idx) => idx === i ? { ...fq, [k]: v } : fq));

  return (
    <PermissionGate module="areas" action="write" fallback={<Unauthorized />}>
      <div className="space-y-6 w-full min-w-0">
        <AdminPageHeader title="Create Area" description="Add a new locality to the website" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Area Name *" required>
                <Input
                  value={form.name}
                  onChange={(e) => { set("name", e.target.value); set("slug", autoSlug(e.target.value)); }}
                  placeholder="e.g. MIHAN"
                />
              </Field>
              <Field label="Slug *" required>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. mihan" />
              </Field>
              <Field label="City *" required>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Starting Price">
                <Input value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} placeholder="e.g. ₹28L or ₹1.2Cr" />
              </Field>
              <div className="sm:col-span-2">
                <ImageUploader label="Banner Image" value={form.banner} onChange={(url) => set("banner", url)} />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <p className="text-xs text-muted-foreground">These fields directly control what appears in Google search results.</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Meta Title">
                <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} placeholder="e.g. MIHAN Nagpur — Properties & Locality Guide" />
                <p className="mt-1 text-xs text-muted-foreground">Keep under 60 characters for best results.</p>
              </Field>
              <Field label="Meta Description">
                <Textarea rows={2} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} placeholder="Short description shown in Google search results (max 160 characters)…" />
                <p className="mt-1 text-xs text-muted-foreground">{form.metaDescription.length}/160 characters</p>
              </Field>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <p className="text-xs text-muted-foreground">
                Use the rich editors to <strong>bold keywords</strong>, <em>italicize</em>, and <span className="text-primary underline">add links</span> on important terms for SEO.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label>Description (About this area) — <span className="font-normal text-muted-foreground">select keywords to bold or link them</span></Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Write an overview of this area — highlight key features, landmark projects, and why people choose to live here. Bold important keywords like area names, project names, and price ranges."
                  minHeight={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Connectivity — <span className="font-normal text-muted-foreground">metro, roads, airport distance</span></Label>
                <RichTextEditor
                  value={form.connectivity}
                  onChange={(v) => set("connectivity", v)}
                  placeholder="Describe road access, metro connectivity, railway station distance, airport proximity…"
                  minHeight={140}
                />
              </div>

              <Field label="Schools (comma-separated)">
                <Textarea rows={2} value={form.schools} onChange={(e) => set("schools", e.target.value)} placeholder="e.g. City Pride School, Inventure Academy, DPS" />
                <p className="mt-1 text-xs text-muted-foreground">Enter school names separated by commas. Each will be shown as a bullet point on the website.</p>
              </Field>

              <Field label="Hospitals (comma-separated)">
                <Textarea rows={2} value={form.hospitals} onChange={(e) => set("hospitals", e.target.value)} placeholder="e.g. Apollo Hospital, Wockhardt, Kingsway Hospital" />
                <p className="mt-1 text-xs text-muted-foreground">Enter hospital names separated by commas.</p>
              </Field>

              <div className="space-y-1.5">
                <Label>Investment Potential — <span className="font-normal text-muted-foreground">ROI, price appreciation, growth drivers</span></Label>
                <RichTextEditor
                  value={investment}
                  onChange={setInvestment}
                  placeholder="Describe capital appreciation trends, rental yield, upcoming infrastructure projects, and why this area is a good investment. Bold key figures like '₹45L', '12% ROI', etc."
                  minHeight={160}
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>FAQs</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  FAQs appear in <strong>Google search results</strong> as expandable rich results — great for SEO.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFaq} className="gap-1 shrink-0">
                <Plus className="h-4 w-4" /> Add FAQ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((fq, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FAQ {i + 1}</span>
                    {faqs.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFaq(i)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Field label="Question">
                    <Input value={fq.q} onChange={(e) => setFaq(i, "q", e.target.value)} placeholder="e.g. Is MIHAN good for investment?" />
                  </Field>
                  <div className="space-y-1.5">
                    <Label>Answer — <span className="font-normal text-muted-foreground">you can bold facts and add links</span></Label>
                    <RichTextEditor
                      value={fq.a}
                      onChange={(v) => setFaq(i, "a", v)}
                      placeholder="Provide a helpful, detailed answer…"
                      minHeight={100}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Checkbox id="pub" checked={form.isPublished} onCheckedChange={(v) => set("isPublished", !!v)} />
            <Label htmlFor="pub">Publish immediately (visible on website)</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create Area"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/areas")}>Cancel</Button>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}

function Field({ label, children, required, className }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label>{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
