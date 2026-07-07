"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, memo } from "react";
import {
  Bell, Menu, LogOut, Settings, ChevronDown,
  UserCircle, CheckCheck, Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminProfileStore, useAdminProfile } from "@/lib/store/admin-profile-store";
import { usePermission } from "@/hooks/use-permissions";
import {
  useNotifications, useNotificationStats,
  useMarkAsRead, useMarkAllAsRead,
} from "@/hooks/use-notification-queries";
import { useSocket } from "@/hooks/use-socket";
import { useQueryClient } from "@tanstack/react-query";

export const AdminHeader = memo(function AdminHeader({ onMobileMenuToggle }) {
  const router     = useRouter();
  const { toast }  = useToast();
  const queryClient = useQueryClient();
  const logout     = useAuthStore((s) => s.logout);
  const clearProfile = useAdminProfileStore((s) => s.clearProfile);
  const profile    = useAdminProfile();
  const { canRead } = usePermission("notifications");

  const notifListParams = useMemo(() => ({ limit: 6 }), []);
  const { data: notifData }  = useNotifications(notifListParams);
  const { data: statsData }  = useNotificationStats();
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const { on } = useSocket("/admin", profile?._id ?? null);
  const notifList = notifData ?? [];

  // Listen for real-time notifications via socket
  useEffect(() => {
    let debounceTimer;
    const cleanup = on("notification", (payload) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // 1. Prepend to active notification lists in the query cache
        queryClient.setQueriesData(
          { queryKey: ["notifications"] },
          (old) => {
            if (!old) return [payload];
            const exists = old.some((n) => n._id === payload._id);
            if (exists) return old;
            return [payload, ...old];
          }
        );

        // 2. Optimistically increment unread count in stats query cache
        queryClient.setQueriesData(
          { queryKey: ["notification-stats"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              total: (old.total ?? 0) + 1,
              unread: (old.unread ?? 0) + 1,
            };
          }
        );

        // 3. Invalidate notification list and stats query keys
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notification-stats"] });

        toast({ title: payload.title, description: payload.message });
      }, 100);
    });
    return () => {
      clearTimeout(debounceTimer);
      cleanup?.();
    };
  }, [on, toast, queryClient]);

  const unreadCount = statsData?.unread ?? 0;

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    markAsRead.mutate(id);

    // Optimistically update notifications list cache
    queryClient.setQueriesData(
      { queryKey: ["notifications"] },
      (old) => {
        if (!old) return old;
        return old.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      }
    );

    // Optimistically update stats cache
    queryClient.setQueriesData(
      { queryKey: ["notification-stats"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          unread: Math.max((old.unread ?? 0) - 1, 0),
        };
      }
    );
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate(undefined);

    // Optimistically update notifications list cache
    queryClient.setQueriesData(
      { queryKey: ["notifications"] },
      (old) => {
        if (!old) return old;
        return old.map((n) => ({ ...n, isRead: true }));
      }
    );

    // Optimistically update stats cache
    queryClient.setQueriesData(
      { queryKey: ["notification-stats"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          unread: 0,
        };
      }
    );
  };

  const handleLogout = () => {
    clearProfile();
    logout();
    toast({ title: "Logged out", description: "You have been logged out of the admin panel" });
    router.replace("/login");
  };

  const initials  = profile ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase() : "AU";
  const fullName  = profile ? `${profile.firstName} ${profile.lastName}` : "Admin User";
  const roleBadge = profile?.role === "admin" ? "Super Admin" : "Sub Admin";

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-6 gap-4 sticky top-0 z-40" style={{ willChange: "transform" }}>

      {/* Mobile menu button */}
      <Button
        variant="ghost" size="icon"
        className="md:hidden shrink-0 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer */}
      <div className="min-w-0 flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* Notifications */}
        {canRead && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 sm:w-96 max-h-[480px] overflow-y-auto p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <p className="font-semibold text-sm">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              {notifList.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifList.slice(0, 8).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => router.push("/admin/notifications")}
                      className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 last:border-0 ${!n.isRead ? "bg-primary/5" : ""}`}
                    >
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        <span className={`block h-1.5 w-1.5 rounded-full ${!n.isRead ? "bg-primary" : "bg-transparent"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm leading-snug truncate">{n.title}</p>
                          {!n.isRead && (
                            <button
                              onClick={(e) => handleMarkRead(e, n._id)}
                              className="text-[10px] text-primary hover:underline shrink-0 mt-0.5"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {n.createdAt
                            ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                            : "Just now"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="border-t p-2">
                <Link
                  href="/admin/notifications"
                  className="flex items-center justify-center w-full py-1.5 text-xs font-medium text-primary hover:text-primary/80 rounded-md hover:bg-primary/5 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Thin divider */}
        <div className="hidden sm:block h-5 w-px bg-border mx-1" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="sm"
              className="flex items-center gap-2 px-2 h-9 sm:h-10 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-border">
                <AvatarImage src={profile?.avatar || undefined} alt={fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-semibold leading-none">{fullName}</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{roleBadge}</span>
              </div>
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 sm:w-60 p-1.5">
            {/* Profile info */}
            <div className="px-2 py-2 mb-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-border shrink-0">
                  <AvatarImage src={profile?.avatar || undefined} alt={fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{profile?.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {roleBadge}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="cursor-pointer rounded-md">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer rounded-md">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/8 cursor-pointer rounded-md"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
