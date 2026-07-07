"use client"

import { useCallback, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Bell, Plus, Send, CheckCircle, Loader2, CheckCheck, Inbox, } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { usePermission } from "@/hooks/use-permissions";
import { useNotifications, useNotificationStats, useCreateNotification, useDeleteNotification, useMarkAsRead, useMarkAllAsRead, } from "@/hooks/use-notification-queries";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { AdminStatGrid } from "@/components/admin/common/admin-stat-grid";
import { NotificationListCard, NotificationListSkeleton, } from "@/components/admin/notifications/notification-list-primitives";
const createSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
    targetRole: z.enum(["admin", "user", "all"]).default("all"),
    sendPush: z.boolean().default(false),
});
export default function NotificationsPage() {
    const { toast } = useToast();
    const { canWrite, canDelete } = usePermission("notifications");
    const listParams = useMemo(() => ({ limit: 50 }), []);
    const notificationsQuery = useNotifications(listParams);
    const statsQuery = useNotificationStats();
    const { data: notifications = [], isLoading } = notificationsQuery;
    const { data: stats } = statsQuery;
    const isHeaderRefreshing = notificationsQuery.isFetching || statsQuery.isFetching;
    const handleRefreshNotifications = () => {
        notificationsQuery.refetch();
        statsQuery.refetch();
    };
    const notificationStatItems = useMemo(() => [
        { label: "Total", value: stats?.total ?? 0, icon: Bell, color: "text-primary", bg: "bg-primary/10" },
        { label: "Sent", value: stats?.sent ?? 0, icon: Send, color: "text-green-600", bg: "bg-green-500/10" },
        { label: "Delivered", value: stats?.delivered ?? 0, icon: CheckCheck, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Unread", value: stats?.unread ?? 0, icon: Inbox, color: "text-yellow-600", bg: "bg-yellow-500/10" },
    ], [stats?.total, stats?.sent, stats?.delivered, stats?.unread]);
    const createMutation = useCreateNotification();
    const deleteMutation = useDeleteNotification();
    const markAsReadMutation = useMarkAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();
    const handleMarkAsRead = useCallback((id) => {
        markAsReadMutation.mutate(id, {
            onSuccess: () => {
                toast({ title: "Done", description: "Notification marked as read" });
            },
        });
    }, [markAsReadMutation, toast]);
    const handleMarkAllAsRead = useCallback(() => {
        markAllAsReadMutation.mutate(undefined, {
            onSuccess: () => {
                toast({ title: "Done", description: "All notifications marked as read" });
            },
        });
    }, [markAllAsReadMutation, toast]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);
    const form = useForm({
        resolver: zodResolver(createSchema),
        defaultValues: { title: "", message: "", targetRole: "all", sendPush: false },
    });
    const handleViewNotification = useCallback((n) => {
        setSelectedNotification(n);
    }, []);
    const openDeleteConfirm = useCallback((notification) => {
        setNotificationToDelete(notification);
        setDeleteConfirmOpen(true);
    }, []);
    const handleCreateNotification = (data) => {
        createMutation.mutate({
            title: data.title,
            message: data.message,
            targetRole: data.targetRole,
            sendPush: data.sendPush,
        }, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                form.reset();
                toast({ title: "Notification created", description: "Your notification has been sent" });
            },
            onError: () => {
                toast({ title: "Failed", description: "Could not create notification", variant: "destructive" });
            },
        });
    };
    const handleDeleteNotification = () => {
        if (!notificationToDelete)
            return;
        deleteMutation.mutate(notificationToDelete._id, {
            onSuccess: () => {
                setDeleteConfirmOpen(false);
                setNotificationToDelete(null);
                toast({ title: "Deleted", description: "Notification removed" });
            },
            onError: (err) => {
                toast({ title: "Delete failed", description: err?.message || "Could not delete notification", variant: "destructive" });
            },
        });
    };
    return (<PermissionGate module="notifications" action="read" fallback={<Unauthorized />}>
      <div className="space-y-6">
        <AdminPageHeader
          title="Push Notifications"
          description="Create and manage push notifications"
          onRefresh={handleRefreshNotifications}
          isFetching={isHeaderRefreshing}
        >
          <Button variant="outline" className="gap-2" onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}>
            {markAllAsReadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCheck className="h-4 w-4"/>}
            Mark All Read
          </Button>
          {canWrite && (<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4"/>Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create Push Notification</DialogTitle>
                  <DialogDescription>Create and send a new push notification.</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreateNotification)} className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Notification title" {...form.register("title")}/>
                    {form.formState.errors.title && (<p className="text-xs text-destructive">{form.formState.errors.title.message}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea placeholder="Enter your notification message..." className="min-h-24" {...form.register("message")}/>
                    {form.formState.errors.message && (<p className="text-xs text-destructive">{form.formState.errors.message.message}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Controller name="targetRole" control={form.control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Admins & Users</SelectItem>
                            <SelectItem value="admin">Admins Only</SelectItem>
                            <SelectItem value="user">Users Only</SelectItem>
                          </SelectContent>
                        </Select>)}/>
                    {form.formState.errors.targetRole && (<p className="text-xs text-destructive">{form.formState.errors.targetRole.message}</p>)}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sendPush" {...form.register("sendPush")} className="h-4 w-4 rounded border-gray-300"/>
                    <Label htmlFor="sendPush" className="text-sm cursor-pointer">Also send as Firebase push notification</Label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                      Send Now
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>)}
        </AdminPageHeader>

        <AdminStatGrid items={notificationStatItems} isLoading={statsQuery.isLoading} gridClassName="grid gap-4 md:grid-cols-4"/>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (<div className="space-y-4">
                <NotificationListSkeleton />
                <NotificationListSkeleton />
                <NotificationListSkeleton />
              </div>) : notifications.length > 0 ? (<div className="space-y-4">
                {notifications.map((n) => (<NotificationListCard key={n._id} notification={n} canDelete={canDelete} onView={handleViewNotification} onDeleteRequest={openDeleteConfirm} onMarkAsRead={handleMarkAsRead}/>))}
              </div>) : (<div className="py-8 text-center text-muted-foreground">No notifications yet.</div>)}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
              <DialogDescription>View the complete details of this notification.</DialogDescription>
            </DialogHeader>
            {selectedNotification && (<div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedNotification.title}</h3>
                  <p className="mt-2 text-muted-foreground">{selectedNotification.message}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium capitalize">{selectedNotification.status}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="mt-1 font-medium">
                      {selectedNotification.createdAt
                ? formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })
                : "N/A"}
                    </p>
                  </div>
                </div>
                {selectedNotification.pushSent && (<Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3"/> Push notification delivered
                  </Badge>)}
              </div>)}
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        {canDelete && (<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogTitle>Delete Notification</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this notification? This action cannot be undone.</AlertDialogDescription>
              <div className="flex gap-3 justify-end pt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteNotification} disabled={deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>)}
      </div>
    </PermissionGate>);
}
