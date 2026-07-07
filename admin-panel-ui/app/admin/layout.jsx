"use client"

import { useState } from "react";
import { AppProvider } from "@/components/providers/app-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Spinner } from "@/components/ui/spinner";
function AdminLayoutInner({ children }) {
    const { isReady } = useAuthGuard();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Show spinner while checking auth / fetching initial profile
    if (!isReady) {
        return (<div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>);
    }
    return (<div className="flex h-screen w-full max-w-[100vw] flex-col md:flex-row bg-background overflow-hidden">
      <AdminSidebar mobileMenuOpen={mobileMenuOpen} onMobileMenuOpenChange={setMobileMenuOpen}/>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}/>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 overscroll-contain" style={{ willChange: "transform" }}>{children}</div>
      </main>
    </div>);
}
export default function AdminLayout({ children }) {
    return (<AppProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AppProvider>);
}
