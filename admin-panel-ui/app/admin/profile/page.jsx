"use client"

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, Loader2, CheckCircle2, Camera, Mail, Phone, FileText, Shield, } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminProfileStore, useAdminProfile, useProfileLoading, useProfileSaving, } from "@/lib/store/admin-profile-store";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
// ─── Validation schema ─────────────────────────────────────────────────────────
const profileSchema = z.object({
    firstName: z.string().min(2, "Min 2 characters").max(30, "Max 30 characters"),
    lastName: z.string().min(2, "Min 2 characters").max(30, "Max 30 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^(\+91[\-\s]?)?(\d{10})$/, "Enter a valid 10-digit phone number"),
    bio: z.string().max(200, "Max 200 characters").optional(),
});
// ─── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { toast } = useToast();
    const fileRef = useRef(null);
    const profile = useAdminProfile();
    const isLoading = useProfileLoading();
    const isSaving = useProfileSaving();
    const { fetchProfile, updateProfile } = useAdminProfileStore();
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { firstName: "", lastName: "", email: "", phone: "", bio: "" },
    });
    // Seed form once profile arrives
    useEffect(() => {
        if (profile) {
            form.reset({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                bio: profile.bio ?? "",
            });
        }
    }, [profile]); // eslint-disable-line
    // Fetch if not loaded
    useEffect(() => {
        if (!profile)
            fetchProfile();
    }, []); // eslint-disable-line
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };
    const onSave = async (data) => {
        const result = await updateProfile(data, avatarFile);
        if (result.success) {
            setAvatarFile(null);
            toast({ title: "Profile updated successfully" });
        }
        else {
            toast({ title: "Update failed", description: result.error, variant: "destructive" });
        }
    };
    const initials = profile ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase() : "AU";
    const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Admin User";
    const roleBadge = profile?.role === "admin" ? "Super Admin" : "Sub Admin";
    return (<div className="space-y-6 w-full min-w-0">
      <AdminPageHeader
        title="My Profile"
        description="Manage your personal information and account details"
      />

      {isLoading ? (
        <div className="space-y-6">
          {/* Avatar card skeleton */}
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full shrink-0" />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Skeleton className="h-6 w-40 mx-auto sm:mx-0" />
                    <Skeleton className="h-5 w-24 rounded-full mx-auto sm:mx-0" />
                  </div>
                  <Skeleton className="h-4 w-52 mx-auto sm:mx-0" />
                  <div className="flex gap-3 pt-1 justify-center sm:justify-start">
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-44 mx-auto sm:mx-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Personal info form card skeleton */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b space-y-1">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6 space-y-5">
              {/* Name row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full rounded-md" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full rounded-md" /></div>
              </div>
              <Skeleton className="h-px w-full" />
              {/* Contact row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-10 w-full rounded-md" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-10 w-full rounded-md" /></div>
              </div>
              {/* Bio */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
              <div className="flex justify-end pt-2">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>

          {/* Account details card skeleton */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (<>
          {/* Avatar + quick info card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview ?? profile?.avatar ?? ""}/>
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button type="button" onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4"/>
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange}/>
                </div>

                {/* Name + role info */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-xl font-semibold">{fullName}</h2>
                    <Badge variant="outline" className="w-fit mx-auto sm:mx-0">
                      <Shield className="mr-1 h-3 w-3"/>
                      {roleBadge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  {profile?.bio && (<p className="text-sm text-muted-foreground italic">{profile.bio}</p>)}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                      <Upload className="h-4 w-4"/>
                      Change Photo
                    </Button>
                    {avatarFile && (<p className="text-xs text-primary flex items-center gap-1 self-center">
                        <CheckCircle2 className="h-3 w-3"/>
                        {avatarFile.name}
                      </p>)}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 10 MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5"/>
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your name, contact details, and bio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
                {/* Name row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" disabled={isSaving} placeholder="John" {...form.register("firstName")}/>
                    {form.formState.errors.firstName && (<p className="text-xs text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" disabled={isSaving} placeholder="Doe" {...form.register("lastName")}/>
                    {form.formState.errors.lastName && (<p className="text-xs text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>)}
                  </div>
                </div>

                <Separator />

                {/* Contact row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground"/>
                      Email Address
                    </Label>
                    <Input id="email" type="email" disabled={isSaving} placeholder="john@example.com" {...form.register("email")}/>
                    {form.formState.errors.email && (<p className="text-xs text-destructive">
                        {form.formState.errors.email.message}
                      </p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground"/>
                      Phone Number
                    </Label>
                    <Input id="phone" disabled={isSaving} placeholder="9876543210" {...form.register("phone")}/>
                    {form.formState.errors.phone && (<p className="text-xs text-destructive">
                        {form.formState.errors.phone.message}
                      </p>)}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground"/>
                    Bio
                    <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  </Label>
                  <Textarea id="bio" placeholder="A short bio about yourself…" disabled={isSaving} className="resize-none" rows={3} {...form.register("bio")}/>
                  {form.formState.errors.bio && (<p className="text-xs text-destructive">
                      {form.formState.errors.bio.message}
                    </p>)}
                  <p className="text-xs text-muted-foreground text-right">
                    {(form.watch("bio") ?? "").length}/200
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving} className="min-w-32">
                    {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving…</>) : ("Save Changes")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account info — read only */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
              <CardDescription>Read-only system information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Account ID</dt>
                  <dd className="font-mono mt-0.5 text-xs">{profile?._id ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="mt-0.5 capitalize">{profile?.role ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Member Since</dt>
                  <dd className="mt-0.5">
                    {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })
                : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Account Status</dt>
                  <dd className="mt-0.5">
                    <Badge variant={profile?.isActive ? "default" : "secondary"}>
                      {profile?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </>)}
    </div>);
}
