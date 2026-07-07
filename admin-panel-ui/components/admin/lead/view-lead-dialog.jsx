"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function ViewLeadDialog({ lead, onClose }) {
  return (
    <Dialog open={!!lead} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>Full information for this lead.</DialogDescription>
        </DialogHeader>
        {lead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Customer Name", value: lead.customerName },
                { label: "Phone", value: lead.phone },
                { label: "Property Type", value: lead.propertyType },
                { label: "Area", value: lead.area },
                { label: "Budget", value: lead.budget || "—" },
                { label: "Status", value: lead.status },
                { label: "Source", value: lead.source },
                {
                  label: "Created",
                  value: new Date(lead.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {lead.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm">{lead.notes}</p>
                </div>
              </>
            )}

            {lead.brokerId && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Assigned Broker
                  </p>
                  <p className="text-sm font-semibold">{lead.brokerId.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.brokerId.mobile}</p>
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
