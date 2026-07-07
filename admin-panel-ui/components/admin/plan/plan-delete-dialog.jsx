"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
export function PlanDeleteDialog({ plan, isPending, onOpenChange, onConfirm, }) {
    return (<AlertDialog open={!!plan} onOpenChange={(v) => { if (!v)
        onOpenChange(false); }}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to permanently delete the{" "}
          <strong>"{plan?.name}"</strong> plan? Existing subscribers won't be
          affected, but new sign-ups will be unavailable.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2 pt-4">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Delete Plan
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>);
}
