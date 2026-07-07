"use client"

/**
 * SettingsPageEditor — reusable editor for Privacy Policy and Terms pages.
 * SEO section removed. Used only for HTML content pages.
 */
import { useEffect } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, Save, } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useStaticPage, useUpdateStaticPage } from "@/hooks/use-static-pages";
import { usePermission } from "@/hooks/use-permissions";
import { RichTextEditor } from "@/components/admin/settings/rich-text-editor";
// ─── Form schema ───────────────────────────────────────────────────────────────
const formSchema = z.object({
    title: z.string().min(2, "Title is required").max(200),
    content: z.string().min(10, "Content is required"),
    isPublished: z.boolean(),
});
const ACCENT_MAP = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600", badge: "border-blue-200 text-blue-700" },
    green: { bg: "bg-green-100", icon: "text-green-600", badge: "border-green-200 text-green-700" },
    orange: { bg: "bg-orange-100", icon: "text-orange-600", badge: "border-orange-200 text-orange-700" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600", badge: "border-purple-200 text-purple-700" },
};
// ─── Component ─────────────────────────────────────────────────────────────────
export function SettingsPageEditor({ slug, icon: Icon, title, description, accentColor = "blue", backHref = "/admin/settings", }) {
    const accent = ACCENT_MAP[accentColor];
    const { data: page, isLoading, isError } = useStaticPage(slug);
    const updateMutation = useUpdateStaticPage(slug);
    const { canWrite } = usePermission("settings");
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            isPublished: true,
        },
    });
    // Seed form once data arrives
    useEffect(() => {
        if (page) {
            form.reset({
                title: page.title,
                content: page.content,
                isPublished: page.isPublished,
            });
        }
    }, [page]); // eslint-disable-line
    const onSubmit = (data) => {
        updateMutation.mutate(data);
    };
    const isDirty = form.formState.isDirty;
    const isSaving = updateMutation.isPending;
    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
          <div className="space-y-5 w-full min-w-0">
            {/* Back button skeleton */}
            <Skeleton className="h-8 w-36 rounded-md" />

            {/* Page header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Content card skeleton */}
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b space-y-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="p-6 space-y-5">
                {/* Title field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                {/* Rich text editor area */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full rounded-t-md" />
                  <Skeleton className="h-64 w-full rounded-b-md" />
                </div>
              </div>
            </div>

            {/* Publish + save bar skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        );
    }
    // ── Error ─────────────────────────────────────────────────────────────────
    if (isError || !page) {
        return (<div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-destructive"/>
        <p className="font-medium">Failed to load page</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        <Link href={backHref}><Button variant="outline">Back to Settings</Button></Link>
      </div>);
    }
    const lastUpdated = new Date(page.lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
    });
    // ── Render ────────────────────────────────────────────────────────────────
    return (<div className="space-y-5 w-full min-w-0">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4"/>
          Back to Settings
        </Link>
      </Button>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${accent.bg}`}>
            <Icon className={`h-6 w-6 ${accent.icon}`}/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`gap-1 ${page.isPublished ? accent.badge : "border-muted text-muted-foreground"}`}>
            {page.isPublished ? (<><Eye className="h-3 w-3"/> Published</>) : (<><EyeOff className="h-3 w-3"/> Draft</>)}
          </Badge>
          <span className="text-xs text-muted-foreground">Updated {lastUpdated}</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Main content card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Page Content</CardTitle>
            <CardDescription>
              {canWrite
            ? "Edit the content that will be displayed in the mobile app."
            : "You have read-only access to this page."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Page Title
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input id="title" placeholder="Page title" disabled={!canWrite || isSaving} {...form.register("title")}/>
              {form.formState.errors.title && (<p className="text-xs text-destructive">{form.formState.errors.title.message}</p>)}
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <Label>
                Content
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Controller name="content" control={form.control} render={({ field }) => (<RichTextEditor value={field.value} onChange={field.onChange} disabled={!canWrite || isSaving} placeholder="Write the page content here…" minHeight={300}/>)}/>
              {form.formState.errors.content && (<p className="text-xs text-destructive">{form.formState.errors.content.message}</p>)}
            </div>
          </CardContent>
        </Card>

        {/* Publish + Save row */}
        {canWrite && (<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-card p-4">
            {/* Publish toggle */}
            <div className="flex items-center gap-3">
              <Controller name="isPublished" control={form.control} render={({ field }) => (<Switch id="isPublished" checked={field.value} onCheckedChange={field.onChange} disabled={isSaving}/>)}/>
              <div>
                <Label htmlFor="isPublished" className="cursor-pointer font-medium">
                  Published
                </Label>
                <p className="text-xs text-muted-foreground">
                  {form.watch("isPublished") ? "Visible in the app" : "Hidden from users"}
                </p>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
              {isDirty && !isSaving && (<p className="text-xs text-amber-600">You have unsaved changes</p>)}
              <Button type="submit" disabled={isSaving || !isDirty} className="min-w-32 gap-2">
                {isSaving ? (<><Loader2 className="h-4 w-4 animate-spin"/>Saving…</>) : (<><Save className="h-4 w-4"/>Save Changes</>)}
              </Button>
            </div>
          </div>)}

        {/* Read-only notice */}
        {!canWrite && (<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              You have read-only access. Contact an admin to edit this page.
            </p>
          </div>)}
      </form>
    </div>);
}
