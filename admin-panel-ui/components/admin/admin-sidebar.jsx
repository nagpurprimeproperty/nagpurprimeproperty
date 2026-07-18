"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, CreditCard, BarChart3, Package,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, Zap, X,
  Shield, UserCircle, MapPin, BookOpen, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminProfileStore } from "@/lib/store/admin-profile-store";
import { usePermissionStore } from "@/lib/store/permission-store";

// ─── Menu definitions ──────────────────────────────────────────────────────────
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/admin",               module: "dashboard"     },
  { icon: Shield,          label: "Sub Admin",      href: "/admin/sub-admin",     module: "sub-admin"     },
  { icon: UserCircle,      label: "Users",          href: "/admin/users",         module: "users"         },
  { icon: Zap,             label: "Leads",          href: "/admin/leads",         module: "leads"         },
  { icon: Building2,       label: "Properties",     href: "/admin/properties",    module: "properties"    },
  { icon: MapPin,          label: "Areas",          href: "/admin/areas",         module: "areas"            },
  { icon: BookOpen,        label: "Blogs",          href: "/admin/blogs",         module: "blogs"            },
  { icon: Tag,             label: "Keywords",       href: "/admin/keywords",      module: "keywords"            },
  { icon: CreditCard,      label: "Revenue",        href: "/admin/revenue",       module: "revenue"       },
  { icon: BarChart3,       label: "Analytics",      href: "/admin/analytics",     module: "analytics"     },
  { icon: Package,         label: "Plans",          href: "/admin/plans",         module: "plans"         },
  { icon: Bell,            label: "Notifications",  href: "/admin/notifications", module: "notifications" },
];
const bottomMenuItems = [
  { icon: UserCircle, label: "Profile",  href: "/admin/profile",  module: null       },
  { icon: Settings,   label: "Settings", href: "/admin/settings", module: "settings" },
];

// ─── Nav item ──────────────────────────────────────────────────────────────────
const NavItem = memo(function NavItem({ href, icon: Icon, label, isActive, isCollapsed, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white text-orange-600 shadow-md shadow-black/10"
          : "text-white/70 hover:bg-white/10 hover:text-white",
        isCollapsed && "justify-center px-2.5"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive ? "text-orange-500" : "text-white/60 group-hover:text-white"
        )}
      />
      {!isCollapsed && <span className="truncate">{label}</span>}

      {/* Active dot when collapsed */}
      {isCollapsed && isActive && (
        <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
      )}
    </Link>
  );
});

// ─── Logout button ─────────────────────────────────────────────────────────────
function LogoutButton({ isCollapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? "Logout" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-red-500/20 hover:text-red-200",
        isCollapsed && "justify-center px-2.5"
      )}
    >
      <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {!isCollapsed && <span>Logout</span>}
    </button>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children, isCollapsed }) {
  if (isCollapsed) return <div className="my-2 mx-2 border-t border-white/25" />;
  return (
    <p className="mb-1.5 mt-4 first:mt-1 px-3 text-[10px] font-bold uppercase tracking-widest text-white">
      {children}
    </p>
  );
}

// ─── Sidebar component ─────────────────────────────────────────────────────────
export function AdminSidebar({ mobileMenuOpen = false, onMobileMenuOpenChange } = {}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { toast } = useToast();

  const logout       = useAuthStore((s) => s.logout);
  const clearProfile = useAdminProfileStore((s) => s.clearProfile);
  const can          = usePermissionStore((s) => s.can);
  const isAdmin      = usePermissionStore((s) => s.isAdmin);

  const [isCollapsed, setIsCollapsed]           = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.module === null) return true;
    if (isAdmin()) return true;
    return can(item.module, "read");
  });
  const visibleBottomItems = bottomMenuItems.filter((item) => {
    if (item.module === null) return true;
    if (isAdmin()) return true;
    return can(item.module, "read");
  });

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    clearProfile();
    logout();
    toast({ title: "Logged out successfully" });
    router.replace("/login");
  };

  const SidebarContent = ({ onNavClick }) => {
    const collapsed = onNavClick ? false : isCollapsed;

    return (
      <div
        className="relative flex h-full flex-col overflow-visible"
        style={{
          background: "linear-gradient(160deg, #c2410c 0%, #ea580c 30%, #f97316 65%, #fb923c 100%)",
        }}
      >
        {/* Decorative shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(255,200,100,0.2) 0%, transparent 60%)",
          }}
        />

        {/* ── Logo ── */}
        <div
          className={cn(
            "relative flex h-14 items-center shrink-0 px-3",
            "border-b border-white/15",
          )}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden"
            onClick={onNavClick}
          >
            {/* Logo pill */}
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white/20 p-1 ring-1 ring-white/30 shrink-0 backdrop-blur-sm">
              <Image src="/logo.jpeg" alt="NagpurProperty" fill className="object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold text-white leading-tight tracking-tight drop-shadow-sm truncate">
                  NagpurPrimeProperty
                </p>
                <p className="text-[11px] font-semibold text-white/55 leading-tight tracking-widest uppercase">
                  Admin Panel
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close button only */}
          {onNavClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-white/60 hover:text-white hover:bg-white/15 rounded-lg"
              onClick={onNavClick}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* ── Desktop edge toggle button — floats at right edge of sidebar ── */}
        {!onNavClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((v) => !v)}
            className="absolute -right-3 top-[26px] z-50 h-6 w-6 rounded-full bg-white text-orange-600 shadow-md border border-orange-200 hover:bg-orange-50 shrink-0"
          >
            {isCollapsed
              ? <ChevronRight className="h-3 w-3" />
              : <ChevronLeft className="h-3 w-3" />}
          </Button>
        )}

        {/* ── Main nav ── */}
        <nav
          className="relative flex-1 overflow-y-auto px-3 py-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <SectionLabel isCollapsed={collapsed}>Main Menu</SectionLabel>
          <div className="space-y-0.5">
            {visibleMenuItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.href)}
                isCollapsed={collapsed}
                onClick={onNavClick}
              />
            ))}
          </div>
        </nav>

        {/* ── Bottom nav ── */}
        <div className="relative px-3 pb-4 pt-2 border-t border-white/15 shrink-0">
          <SectionLabel isCollapsed={collapsed}>Account</SectionLabel>
          <div className="space-y-0.5">
            {visibleBottomItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.href)}
                isCollapsed={collapsed}
                onClick={onNavClick}
              />
            ))}
            <LogoutButton
              isCollapsed={collapsed}
              onClick={() => setLogoutDialogOpen(true)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:h-screen md:flex-col shrink-0 transition-[width] duration-200 shadow-xl shadow-orange-900/20 overflow-visible",
          isCollapsed ? "md:w-[68px]" : "md:w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuOpenChange}>
        <SheetContent side="right" className="w-64 p-0 border-0 [&>button]:hidden overflow-hidden">
          <div className="sr-only"><SheetTitle>Navigation Menu</SheetTitle></div>
          <SidebarContent onNavClick={() => onMobileMenuOpenChange?.(false)} />
        </SheetContent>
      </Sheet>

      {/* Logout confirmation dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout? You will need to sign in again to access the admin panel.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}