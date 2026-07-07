/**
 * DeleteSubAdminDialog — confirmation alert before deleting
 */
"use client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
export function DeleteSubAdminDialog({ subAdmin, onOpenChange, onConfirm }) {
    return (<AlertDialog open={!!subAdmin} onOpenChange={(v) => !v && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Sub Admin</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete{" "}
          <strong>
            {subAdmin?.firstName} {subAdmin?.lastName}
          </strong>
          ? All their permissions will also be removed. This cannot be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2 pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>);
}
