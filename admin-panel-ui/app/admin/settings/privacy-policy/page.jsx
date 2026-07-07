"use client"

import { Shield } from "lucide-react";
import { SettingsPageEditor } from "@/components/admin/settings/settings-page-editor";
export default function PrivacyPolicyPage() {
    return (<SettingsPageEditor slug="privacy-policy" icon={Shield} title="Privacy Policy" description="How we collect, use, and protect user data" accentColor="green"/>);
}
