"use client"

import Link from "next/link";
import { Shield, Info, FileText, Phone, ChevronRight, Globe, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
// ─── Static page navigation items ─────────────────────────────────────────────
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
    return (<div className="space-y-6 w-full min-w-0">
      <AdminPageHeader
        title="Settings"
        description="Manage security, notifications and platform preferences"
      />

      {/* Static Pages — navigation list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5"/>
            App Information
          </CardTitle>
          <CardDescription>Legal and support pages shown in the app</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {staticPages.map((page) => (<li key={page.href}>
                <Link href={page.href} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group">
                  <div className={`rounded-lg p-2 ${page.bg}`}>
                    <page.icon className={`h-5 w-5 ${page.color}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0"/>
                </Link>
              </li>))}
          </ul>
        </CardContent>
      </Card>
    </div>);
}
