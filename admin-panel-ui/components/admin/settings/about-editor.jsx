"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Save, Plus, Trash2, Globe, Mail, Phone, MapPin, Info, TrendingUp, } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStaticPage, useUpdateStaticPage } from "@/hooks/use-static-pages";
import { usePermission } from "@/hooks/use-permissions";
import { ImageUploader } from "@/components/admin/common/image-uploader";
const DEFAULT_ABOUT = {
    type: "about",
    version: "1.0.0",
    tagline: "Connecting Buyers with Trusted Brokers",
    mission: "NagpurProperty aims to simplify the property search experience by connecting buyers directly with verified and trusted real estate brokers. We believe in transparency, trust, and making homeownership accessible to everyone.",
    whatWeOffer: [
        "Thousands of verified property listings",
        "Direct broker connections with OTP verification",
        "Smart search with advanced filters",
        "Save favorites and track enquiries",
        "Price alerts and new listing notifications",
    ],
    stats: { properties: "10K+", brokers: "500+", users: "50K+", cities: "15+" },
    contactInfo: {
        website: "www.nagpurproperty.com",
        email: "info@nagpurproperty.com",
        phone: "+91 98765 43210",
        address: "Pune, Maharashtra, India",
        facebook: "",
        instagram: "",
        youtube: "",
    },
    bannerImage: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1536&q=80",
    bannerHeading: "Find your next home in",
    bannerHeadingHighlight: "Nagpur",
    bannerSubheading: "Verified flats, plots and villas across Dighori, MIHAN, Wardha Road and more. Direct contact with trusted brokers — no middlemen, no spam.",
};
function parseAboutData(content) {
    try {
        const parsed = JSON.parse(content);
        if (parsed?.type === "about")
            return { ...DEFAULT_ABOUT, ...parsed };
    }
    catch { }
    return DEFAULT_ABOUT;
}
// ─── Component ─────────────────────────────────────────────────────────────────
export function AboutEditor() {
    const { data: page, isLoading, isError } = useStaticPage("about-us");
    const updateMutation = useUpdateStaticPage("about-us");
    const { canWrite } = usePermission("settings");
    const [data, setData] = useState(DEFAULT_ABOUT);
    const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
        if (page?.content) {
            setData(parseAboutData(page.content));
        }
    }, [page]);
    const update = (key, value) => {
        setData((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };
    const updateStats = (key, value) => {
        setData((prev) => ({ ...prev, stats: { ...prev.stats, [key]: value } }));
        setIsDirty(true);
    };
    const updateContact = (key, value) => {
        setData((prev) => ({ ...prev, contactInfo: { ...prev.contactInfo, [key]: value } }));
        setIsDirty(true);
    };
    const updateOffer = (index, value) => {
        const next = [...data.whatWeOffer];
        next[index] = value;
        update("whatWeOffer", next);
    };
    const addOffer = () => update("whatWeOffer", [...data.whatWeOffer, ""]);
    const removeOffer = (i) => update("whatWeOffer", data.whatWeOffer.filter((_, idx) => idx !== i));
    const handleSave = () => {
        updateMutation.mutate({ content: JSON.stringify(data), title: "About Us" });
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
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>

            {/* App Identity card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full rounded-md" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full rounded-md" /></div>
              </div>
            </div>

            {/* Mission card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="p-6">
                <Skeleton className="h-28 w-full rounded-md" />
              </div>
            </div>

            {/* What We Offer card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Stats card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-60" />
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info card */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
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
        <div className="rounded-xl p-3 bg-blue-100">
          <Info className="h-6 w-6 text-blue-600"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold">About Us</h1>
          <p className="text-sm text-muted-foreground">App version, mission, and company information shown in the mobile app</p>
        </div>
      </div>

      {/* App Identity */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">App Identity</CardTitle>
          <CardDescription>Shown at the top of the About screen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={data.version} onChange={(e) => update("version", e.target.value)} placeholder="1.0.0" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={data.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Connecting Buyers with Trusted Brokers" disabled={!canWrite}/>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homepage Banner Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Homepage Banner Settings</CardTitle>
          <CardDescription>Configure the hero banner image and texts shown on the website home page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <ImageUploader
              label="Banner Image"
              value={data.bannerImage || ""}
              onChange={(url) => update("bannerImage", url)}
              disabled={!canWrite}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Banner Heading Prefix</Label>
              <Input value={data.bannerHeading || ""} onChange={(e) => update("bannerHeading", e.target.value)} placeholder="Find your next home in" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label>Banner Heading Highlight</Label>
              <Input value={data.bannerHeadingHighlight || ""} onChange={(e) => update("bannerHeadingHighlight", e.target.value)} placeholder="Nagpur" disabled={!canWrite}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Banner Subheading</Label>
            <Textarea value={data.bannerSubheading || ""} onChange={(e) => update("bannerSubheading", e.target.value)} rows={3} placeholder="Describe the platform sub-headline..." disabled={!canWrite}/>
          </div>
        </CardContent>
      </Card>

      {/* Mission */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Our Mission</CardTitle>
          <CardDescription>Displayed in the "Our Mission" section</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={data.mission} onChange={(e) => update("mission", e.target.value)} rows={4} className="resize-none" placeholder="Describe your mission..." disabled={!canWrite}/>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">What We Offer</CardTitle>
              <CardDescription className="mt-1">Bullet list shown with green checkmarks</CardDescription>
            </div>
            {canWrite && (<Button variant="outline" size="sm" className="gap-2" onClick={addOffer}>
                <Plus className="h-4 w-4"/>Add Item
              </Button>)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.whatWeOffer.map((item, i) => (<div key={i} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <Input value={item} onChange={(e) => updateOffer(i, e.target.value)} className="flex-1" disabled={!canWrite}/>
              {canWrite && (<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeOffer(i)} disabled={data.whatWeOffer.length <= 1}>
                  <Trash2 className="h-4 w-4"/>
                </Button>)}
            </div>))}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary"/>
            Platform Stats
          </CardTitle>
          <CardDescription>Numbers shown in the stats row (e.g. "10K+", "500+")</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["properties", "brokers", "users", "cities"].map((key) => (<div key={key} className="space-y-2">
                <Label className="capitalize">{key}</Label>
                <Input value={data.stats[key]} onChange={(e) => updateStats(key, e.target.value)} placeholder={key === "cities" ? "15+" : "10K+"} disabled={!canWrite}/>
              </div>))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Contact Information</CardTitle>
          <CardDescription>Shown in the "Contact Us" section at the bottom</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground"/>Website
              </Label>
              <Input value={data.contactInfo.website} onChange={(e) => updateContact("website", e.target.value)} placeholder="www.nagpurproperty.com" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground"/>Email
              </Label>
              <Input value={data.contactInfo.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="info@nagpurproperty.com" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground"/>Phone
              </Label>
              <Input value={data.contactInfo.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="+91 98765 43210" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground"/>Address
              </Label>
              <Input value={data.contactInfo.address} onChange={(e) => updateContact("address", e.target.value)} placeholder="Pune, Maharashtra, India" disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input value={data.contactInfo.facebook || ""} onChange={(e) => updateContact("facebook", e.target.value)} placeholder="https://facebook.com/..." disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={data.contactInfo.instagram || ""} onChange={(e) => updateContact("instagram", e.target.value)} placeholder="https://instagram.com/..." disabled={!canWrite}/>
            </div>
            <div className="space-y-2">
              <Label>Youtube URL</Label>
              <Input value={data.contactInfo.youtube || ""} onChange={(e) => updateContact("youtube", e.target.value)} placeholder="https://youtube.com/..." disabled={!canWrite}/>
            </div>
          </div>
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
