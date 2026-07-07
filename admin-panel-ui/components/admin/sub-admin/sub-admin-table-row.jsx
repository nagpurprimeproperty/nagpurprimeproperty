/**
 * SubAdminTableRow — single row in the desktop table view
 */
"use client";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Lock, ToggleLeft, ToggleRight, Trash2, Loader2, } from "lucide-react";
function getGrantedModules(sa) {
    if (!sa.permissions || sa.permissions.length === 0)
        return [];
    return sa.permissions
        .filter((p) => p.permissions.read || p.permissions.write || p.permissions.delete)
        .map((p) => p.module);
}
export function SubAdminTableRow({ subAdmin: sa, isToggling, onToggleStatus, onDelete }) {
    const modules = getGrantedModules(sa);
    return (<TableRow key={sa._id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {sa.firstName[0]}{sa.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{sa.firstName} {sa.lastName}</span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">{sa.email}</TableCell>

      <TableCell>
        <Badge variant={sa.isActive ? "default" : "secondary"}>
          {sa.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>

      <TableCell>
        {modules.length > 0 ? (<div className="flex flex-wrap gap-1">
            {modules.slice(0, 3).map((m) => (<Badge key={m} variant="outline" className="text-xs capitalize">{m}</Badge>))}
            {modules.length > 3 && (<Badge variant="outline" className="text-xs">+{modules.length - 3}</Badge>)}
          </div>) : (<span className="text-xs text-muted-foreground italic">No access</span>)}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {new Date(sa.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "2-digit",
        })}
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/sub-admin/${sa._id}/permissions`} className="gap-2 cursor-pointer">
                <Lock className="h-4 w-4"/>
                Manage Permissions
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onToggleStatus(sa)} disabled={isToggling} className="gap-2 cursor-pointer">
              {isToggling ? (<Loader2 className="h-4 w-4 animate-spin"/>) : sa.isActive ? (<ToggleLeft className="h-4 w-4"/>) : (<ToggleRight className="h-4 w-4"/>)}
              {sa.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onDelete(sa)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4"/>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>);
}
