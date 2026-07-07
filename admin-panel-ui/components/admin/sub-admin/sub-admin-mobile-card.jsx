/**
 * SubAdminMobileCard — card view for small screens
 */
"use client";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Lock, ToggleLeft, ToggleRight, Trash2, } from "lucide-react";
function getGrantedModules(sa) {
    if (!sa.permissions || sa.permissions.length === 0)
        return [];
    return sa.permissions
        .filter((p) => p.permissions.read || p.permissions.write || p.permissions.delete)
        .map((p) => p.module);
}
export function SubAdminMobileCard({ subAdmin: sa, onToggleStatus, onDelete }) {
    const modules = getGrantedModules(sa);
    return (<div className="border rounded-lg p-4 space-y-3 bg-card">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {sa.firstName[0]}{sa.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{sa.firstName} {sa.lastName}</p>
            <p className="text-xs text-muted-foreground">{sa.email}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/sub-admin/${sa._id}/permissions`} className="gap-2 cursor-pointer">
                <Lock className="h-4 w-4"/> Manage Permissions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(sa)} className="gap-2 cursor-pointer">
              {sa.isActive ? (<><ToggleLeft className="h-4 w-4"/> Deactivate</>) : (<><ToggleRight className="h-4 w-4"/> Activate</>)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(sa)} className="text-destructive gap-2 cursor-pointer">
              <Trash2 className="h-4 w-4"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status + date */}
      <div className="flex items-center justify-between text-xs">
        <Badge variant={sa.isActive ? "default" : "secondary"}>
          {sa.isActive ? "Active" : "Inactive"}
        </Badge>
        <span className="text-muted-foreground">
          {new Date(sa.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "2-digit",
        })}
        </span>
      </div>

      {/* Modules */}
      {modules.length > 0 ? (<div className="flex flex-wrap gap-1">
          {modules.map((m) => (<Badge key={m} variant="outline" className="text-xs capitalize">{m}</Badge>))}
        </div>) : (<p className="text-xs text-muted-foreground italic">No module access</p>)}
    </div>);
}
