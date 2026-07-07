"use client"

/**
 * UpdateStatusDialog
 * Reusable dialog for changing property status with optional notes/reason.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useUpdatePropertyStatus } from "@/hooks/use-property-queries";
// Statuses allowed for manual transition by admin
const ALLOWED_STATUSES = [
    "Active", "Inactive", "Sold",
];
export function UpdateStatusDialog({ open, onOpenChange, propertyId, propertyTitle, currentStatus, }) {
    const [status, setStatus] = useState(currentStatus);
    const [adminNotes, setAdminNotes] = useState("");
    const [reason, setReason] = useState("");
    const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();
    const needsNotes = status === "Active" || status === "Inactive";
    const handleConfirm = () => {
        updateStatus({
            id: propertyId,
            status,
            ...(adminNotes.trim() && { adminNotes: adminNotes.trim() }),
            ...(reason.trim() && { rejectedReason: reason.trim() }),
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setAdminNotes("");
                setReason("");
            },
        });
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Property Status</DialogTitle>
          <DialogDescription className="line-clamp-2">
            Change status for: <strong>{propertyTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status picker */}
          <div className="space-y-1.5">
            <Label>New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v)} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_STATUSES.filter((s) => s !== currentStatus).map((s) => (<SelectItem key={s} value={s}>
                    <span className="capitalize">{s}</span>
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>


          {/* Admin notes */}
          {needsNotes && (<div className="space-y-1.5">
              <Label>Admin Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
              <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes about this status change…" rows={2} disabled={isPending}/>
            </div>)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
