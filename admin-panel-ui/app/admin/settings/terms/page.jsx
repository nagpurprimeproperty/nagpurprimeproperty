"use client"

import { FileText } from "lucide-react";
import { SettingsPageEditor } from "@/components/admin/settings/settings-page-editor";
export default function TermsPage() {
    return (<SettingsPageEditor slug="terms-and-conditions" icon={FileText} title="Terms & Conditions" description="Platform usage terms and legal rules shown in the app" accentColor="orange"/>);
}
