"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Info, FileText, Phone, ChevronRight, Globe, AlertTriangle, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { usePermission } from "@/hooks/use-permissions";

// ─── Helper for input type="datetime-local" ───────────────────────────────────
function toLocalDatetimeString(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // Format: YYYY-MM-DDTHH:MM
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const staticPages = [
    {
        href: "/admin/settings/about",
        icon: Info,
        label: "About Us",
        description: "App version, mission and company info",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        href: "/admin/settings/privacy-policy",
        icon: Shield,
        label: "Privacy Policy",
        description: "How we collect and use your data",
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        href: "/admin/settings/terms",
        icon: FileText,
        label: "Terms & Conditions",
        description: "Platform usage terms and rules",
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
    {
        href: "/admin/settings/contact",
        icon: Phone,
        label: "Help & Support",
        description: "Contact us and FAQs",
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
];

export default function SettingsPage() {
    const { data: settings, isLoading, isError } = useSettings();
    const updateMutation = useUpdateSettings();
    const { canWrite } = usePermission("settings");

    const [isDirty, setIsDirty] = useState(false);
    const [formData, setFormData] = useState({
        isMaintenanceMode: false,
        isComingSoonMode: false,
        maintenanceTitle: "Under Maintenance",
        maintenanceDescription: "",
        maintenanceLiveAt: ""
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                isMaintenanceMode: settings.isMaintenanceMode ?? false,
                isComingSoonMode: settings.isComingSoonMode ?? false,
                maintenanceTitle: settings.maintenanceTitle ?? "Under Maintenance",
                maintenanceDescription: settings.maintenanceDescription ?? "",
                maintenanceLiveAt: toLocalDatetimeString(settings.maintenanceLiveAt)
            });
            setIsDirty(false);
        }
    }, [settings]);

    const updateField = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateMutation.mutate(formData, {
            onSuccess: () => {
                setIsDirty(false);
            }
        });
    };

    return (
        <div className="space-y-6 w-full min-w-0">
            <AdminPageHeader
                title="Settings"
                description="Manage security, notifications and platform preferences"
            />

            {/* Platform Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Website Status (Maintenance & Launch)
                    </CardTitle>
                    <CardDescription>
                        Control whether the website is live, under maintenance, or launching soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4 py-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : isError ? (
                        <div className="text-sm text-destructive flex items-center gap-2">
                            Failed to load platform settings. Please try again.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Toggles */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="coming-soon" className="text-sm font-semibold">Coming Soon Mode</Label>
                                        <p className="text-xs text-muted-foreground">Redirects all pages to the Coming Soon page</p>
                                    </div>
                                    <Switch
                                        id="coming-soon"
                                        checked={formData.isComingSoonMode}
                                        onCheckedChange={(checked) => {
                                            updateField("isComingSoonMode", checked);
                                            if (checked) {
                                                // Turn off maintenance mode if coming soon is turned on
                                                updateField("isMaintenanceMode", false);
                                            }
                                        }}
                                        disabled={!canWrite}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="maintenance" className="text-sm font-semibold">Maintenance Mode</Label>
                                        <p className="text-xs text-muted-foreground">Redirects all pages to the Maintenance page</p>
                                    </div>
                                    <Switch
                                        id="maintenance"
                                        checked={formData.isMaintenanceMode}
                                        onCheckedChange={(checked) => {
                                            updateField("isMaintenanceMode", checked);
                                            if (checked) {
                                                // Turn off coming soon if maintenance is turned on
                                                updateField("isComingSoonMode", false);
                                            }
                                        }}
                                        disabled={!canWrite}
                                    />
                                </div>
                            </div>

                            {/* Maintenance Details */}
                            {formData.isMaintenanceMode && (
                                <div className="space-y-4 border-t pt-4 animate-in fade-in duration-200">
                                    <h3 className="text-sm font-medium text-amber-600">Maintenance Details</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="m-title">Maintenance Title</Label>
                                        <Input
                                            id="m-title"
                                            value={formData.maintenanceTitle}
                                            onChange={(e) => updateField("maintenanceTitle", e.target.value)}
                                            placeholder="Under Maintenance"
                                            disabled={!canWrite}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="m-desc">What is coming in this update?</Label>
                                        <Textarea
                                            id="m-desc"
                                            value={formData.maintenanceDescription}
                                            onChange={(e) => updateField("maintenanceDescription", e.target.value)}
                                            placeholder="e.g. We are updating our search engine and adding locality charts. Back online soon!"
                                            rows={3}
                                            disabled={!canWrite}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="m-liveat">Expected Live Date & Time</Label>
                                        <Input
                                            id="m-liveat"
                                            type="datetime-local"
                                            value={formData.maintenanceLiveAt}
                                            onChange={(e) => updateField("maintenanceLiveAt", e.target.value)}
                                            disabled={!canWrite}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Save Actions */}
                            {canWrite && (
                                <div className="flex items-center justify-between border-t pt-4">
                                    <div>
                                        {isDirty && !updateMutation.isPending && (
                                            <p className="text-xs text-amber-600">You have unsaved changes</p>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending || !isDirty}
                                        className="gap-2 min-w-32"
                                    >
                                        {updateMutation.isPending ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                                        ) : (
                                            <><Save className="h-4 w-4" />Save Changes</>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {!canWrite && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm text-amber-800">You have read-only access. Contact an admin to change the platform status.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Static Pages — navigation list */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        App Information
                    </CardTitle>
                    <CardDescription>Legal and support pages shown in the app</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        {staticPages.map((page) => (
                            <li key={page.href}>
                                <Link href={page.href} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group">
                                    <div className={`rounded-lg p-2 ${page.bg}`}>
                                        <page.icon className={`h-5 w-5 ${page.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{page.label}</p>
                                        <p className="text-xs text-muted-foreground">{page.description}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Fallback Skeleton Component ───────────────────────────────────────────────
function Skeleton({ className, ...props }) {
    return <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />;
}
