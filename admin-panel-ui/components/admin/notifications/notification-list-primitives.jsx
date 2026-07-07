"use client";

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Bell, CheckCircle, MoreHorizontal, Eye, Trash2, Calendar, MailCheck, } from "lucide-react";

function targetRoleBadgeClass(role) {
    if (role === "user")
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    if (role === "admin" || role === "sub-admin")
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    return "bg-green-100 text-green-700 hover:bg-green-100";
}

function targetRoleLabel(role) {
    if (role === "all")
        return "All";
    if (role === "sub-admin")
        return "Admin";
    return role;
}

export const NotificationListCard = memo(function NotificationListCard({ notification, canDelete, onView, onDeleteRequest, onMarkAsRead, }) {
    const isRead = notification.isRead;
    return (<div className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${isRead ? "bg-muted/30 opacity-75" : "bg-background border-l-4 border-l-primary"}`}>
      <div className="flex gap-4 min-w-0">
        <div className={`rounded-lg p-2 shrink-0 ${isRead ? "bg-muted" : "bg-primary/10"}`}>
          <Bell className={`h-5 w-5 ${isRead ? "text-muted-foreground" : "text-primary"}`}/>
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className={`truncate ${isRead ? "font-medium text-muted-foreground" : "font-semibold"}`}>{notification.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5"/>
              {notification.createdAt
                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                : "Just now"}
            </div>
            {notification.pushSent && (<Badge variant="outline" className="text-[10px] h-5">Push sent</Badge>)}
            <Badge variant="secondary" className={`text-[10px] h-5 ${targetRoleBadgeClass(notification.targetRole)}`}>
              {targetRoleLabel(notification.targetRole)}
            </Badge>
            {isRead && (<Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">Read</Badge>)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="default" className="gap-1 capitalize">
          <CheckCircle className="h-4 w-4 text-green-600"/>
          {notification.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(notification)}>
              <Eye className="mr-2 h-4 w-4"/>View Details
            </DropdownMenuItem>
            {!isRead && onMarkAsRead && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification._id)}>
                <MailCheck className="mr-2 h-4 w-4"/>Mark as Read
              </DropdownMenuItem>
            )}
            {canDelete && (<DropdownMenuItem className="text-destructive" onClick={() => onDeleteRequest(notification)}>
                <Trash2 className="mr-2 h-4 w-4"/>Delete
              </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>);
});

export function NotificationListSkeleton() {
    return (<div className="flex items-start justify-between rounded-lg border p-4">
      <div className="flex gap-4 min-w-0">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0"/>
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-4 w-56 max-w-full"/>
          <Skeleton className="h-3 w-72 max-w-full"/>
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-3 w-24"/>
            <Skeleton className="h-5 w-16 rounded-full"/>
            <Skeleton className="h-5 w-14 rounded-full"/>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-6 w-16 rounded-full"/>
        <Skeleton className="h-8 w-8 rounded-md"/>
      </div>
    </div>);
}
