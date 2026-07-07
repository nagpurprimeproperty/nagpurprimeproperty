"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Save, Plus, Trash2, Phone, Mail, MessageCircle, Clock, HelpCircle, ChevronDown, ChevronUp, } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStaticPage, useUpdateStaticPage } from "@/hooks/use-static-pages";
import { usePermission } from "@/hooks/use-permissions";
const DEFAULT_CONTACT = {
    type: "contact",
    phone: "+91 98765 43210",
    email: "support@nagpurproperty.com",
    whatsapp: "+91 98765 43210",
    supportHours: "Monday - Saturday, 9:00 AM - 7:00 PM IST",
    faqs: [
        { id: "1", question: "How do I search for properties?", answer: "Use the search bar and apply filters like location, budget, and property type." },
        { id: "2", question: "How do I contact a broker?", answer: "Open any listing and tap \"Contact Broker\". You'll need to verify your mobile via OTP." },
        { id: "3", question: "What does saving a property do?", answer: "Saved properties are stored in your favorites for easy access later." },
        { id: "4", question: "Is my phone number shared with brokers?", answer: "Only with brokers you explicitly contact through our enquiry form." },
        { id: "5", question: "How do featured properties work?", answer: "Featured properties get priority placement in search results and are verified by our team." },
        { id: "6", question: "Can I schedule a property visit?", answer: "Yes, after contacting a broker you can arrange a visit directly with them." },
    ],
};
function parseContactData(content) {
    try {
        const parsed = JSON.parse(content);
        if (parsed?.type === "contact")
            return { ...DEFAULT_CONTACT, ...parsed };
    }
    catch { }
    return DEFAULT_CONTACT;
}
// ─── FAQ Row ───────────────────────────────────────────────────────────────────
function FaqRow({ faq, index, canWrite, onChange, onRemove, }) {
    const [expanded, setExpanded] = useState(false);
    return (<div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <span className="text-sm font-medium truncate flex-1 mr-2">
          {faq.question || `FAQ #${index + 1}`}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {canWrite && (<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(faq.id); }}>
              <Trash2 className="h-3.5 w-3.5"/>
            </Button>)}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
        </div>
      </div>
      {expanded && (<div className="p-4 space-y-3 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Question</Label>
            <Input value={faq.question} onChange={(e) => onChange(faq.id, "question", e.target.value)} placeholder="Enter question..." disabled={!canWrite}/>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Answer</Label>
            <Textarea value={faq.answer} onChange={(e) => onChange(faq.id, "answer", e.target.value)} placeholder="Enter answer..." rows={3} className="resize-none text-sm" disabled={!canWrite}/>
          </div>
        </div>)}
    </div>);
}
// ─── Main Component ────────────────────────────────────────────────────────────
export function ContactEditor() {
    const { data: page, isLoading, isError } = useStaticPage("contact-us");
    const updateMutation = useUpdateStaticPage("contact-us");
    const { canWrite } = usePermission("settings");
    const [data, setData] = useState(DEFAULT_CONTACT);
    const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
        if (page?.content) {
            setData(parseContactData(page.content));
        }
    }, [page]);
    const update = (key, value) => {
        setData((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };
    const handleFaqChange = (id, field, value) => {
        setData((prev) => ({
            ...prev,
            faqs: prev.faqs.map((f) => f.id === id ? { ...f, [field]: value } : f),
        }));
        setIsDirty(true);
    };
    const addFaq = () => {
        const newFaq = { id: Date.now().toString(), question: "", answer: "" };
        update("faqs", [...data.faqs, newFaq]);
    };
    const removeFaq = (id) => {
        update("faqs", data.faqs.filter((f) => f.id !== id));
    };
    const handleSave = () => {
        updateMutation.mutate({ content: JSON.stringify(data), title: "Help & Support" });
        setIsDirty(false);
    };
    if (isLoading)
        return (
          <div className="space-y-5 w-full min-w-0">
            {/* Back button */}
            <Skeleton className="h-8 w-36 rounded-md" />

            {/* Page header */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>

            {/* Mobile preview banner */}
            <div className="rounded-lg bg-muted/40 border p-4">
              <Skeleton className="h-3 w-28 mb-3" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-card border p-3 text-center space-y-2">
                    <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Channels card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Support Hours card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="p-6">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* FAQs card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <div className="p-6 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted/30">
                      <Skeleton className="h-4 w-[70%]" />
                      <Skeleton className="h-4 w-4 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-0" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        );
    if (isError)
        return (<div className="flex flex-col items-center gap-3 py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive"/>
      <p className="font-medium">Failed to load page</p>
      <Link href="/admin/settings"><Button variant="outline">Back to Settings</Button></Link>
    </div>);
    return (<div className="space-y-5 w-full min-w-0">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/admin/settings">
          <ArrowLeft className="h-4 w-4"/>
          Back to Settings
        </Link>
      </Button>

      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="rounded-xl p-3 bg-purple-100">
          <Phone className="h-6 w-6 text-purple-600"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">Contact channels and FAQs shown in the mobile app</p>
        </div>
      </div>

      {/* Mobile Preview Banner */}
      <div className="rounded-lg bg-muted/40 border p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Mobile Preview</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Phone, label: "Call Us", value: data.phone, color: "bg-green-100 text-green-600" },
            { icon: Mail, label: "Email", value: data.email, color: "bg-blue-100 text-blue-600" },
            { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", color: "bg-green-100 text-green-600" },
        ].map(({ icon: Icon, label, value, color }) => (<div key={label} className="rounded-lg bg-white border p-3 text-center">
              <div className={`mx-auto mb-2 h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5"/>
              </div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 break-all">{value}</p>
            </div>))}
        </div>
      </div>

      {/* Contact Channels */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Contact Channels</CardTitle>
          <CardDescription>The 3 contact cards shown at the top of Help & Support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-green-600"/>Call Us
              </Label>
              <Input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600"/>Email
              </Label>
              <Input value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="support@nagpurproperty.com" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-green-600"/>WhatsApp
              </Label>
              <Input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+91 98765 43210" disabled={!canWrite}/>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Hours */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary"/>Support Hours
          </CardTitle>
          <CardDescription>Displayed in the "Support Hours" section at the bottom</CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={data.supportHours} onChange={(e) => update("supportHours", e.target.value)} placeholder="Monday - Saturday, 9:00 AM - 7:00 PM IST" disabled={!canWrite}/>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary"/>Frequently Asked Questions
              </CardTitle>
              <CardDescription className="mt-1">
                {data.faqs.length} question{data.faqs.length !== 1 ? "s" : ""} • Click to expand and edit
              </CardDescription>
            </div>
            {canWrite && (<Button variant="outline" size="sm" className="gap-2" onClick={addFaq}>
                <Plus className="h-4 w-4"/>Add FAQ
              </Button>)}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.faqs.length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">
              No FAQs yet. Click "Add FAQ" to add one.
            </div>) : (data.faqs.map((faq, i) => (<FaqRow key={faq.id} faq={faq} index={i} canWrite={canWrite} onChange={handleFaqChange} onRemove={removeFaq}/>)))}
        </CardContent>
      </Card>

      {/* Save */}
      {canWrite && (<div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div>
            {isDirty && !updateMutation.isPending && (<p className="text-xs text-amber-600">You have unsaved changes</p>)}
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending || !isDirty} className="gap-2 min-w-32">
            {updateMutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin"/>Saving…</>) : (<><Save className="h-4 w-4"/>Save Changes</>)}
          </Button>
        </div>)}

      {!canWrite && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">You have read-only access. Contact an admin to edit this page.</p>
        </div>)}
    </div>);
}
