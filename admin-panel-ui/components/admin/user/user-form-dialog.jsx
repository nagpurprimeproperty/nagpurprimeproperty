"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
// ─── Zod schema (mirrors backend user.schema.js) ─────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Min 2 characters").max(30, "Max 30 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().max(50).optional(),
  area: z.string().max(50).optional(),
  address: z.string().max(100).optional(),
});
export function UserFormDialog({ open, onOpenChange, onSubmit, isSubmitting, user }) {
  const isEdit = !!user;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", mobile: "", email: "", city: "", area: "", address: "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset(user
        ? {
          name: user.name,
          mobile: user.mobile,
          email: user.email ?? "",
          city: user.city ?? "",
          area: user.area ?? "",
          address: user.address ?? "",
        }
        : { name: "", mobile: "", email: "", city: "", area: "", address: "", });
    }
  }, [open, user]); // eslint-disable-line
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };
  const handleSubmit = (data) => {
    // Strip empty optional strings to undefined
    const clean = { ...data };
    if (!clean.email)
      delete clean.email;
    onSubmit(clean);
  };
  return (<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update user information." : "Fill in the details to add a new user."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label>Full Name <span className="text-destructive">*</span></Label>
            <Input placeholder="Rahul Deshmukh" disabled={isSubmitting} {...form.register("name")} />
            {form.formState.errors.name && (<p className="text-xs text-destructive">{form.formState.errors.name.message}</p>)}
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label>Mobile <span className="text-destructive">*</span></Label>
            <Input placeholder="9876543210" disabled={isSubmitting} {...form.register("mobile")} />
            {form.formState.errors.mobile && (<p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>)}
          </div>

          {/* Email */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" placeholder="user@example.com" disabled={isSubmitting} {...form.register("email")} />
            {form.formState.errors.email && (<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>)}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>
            <Input placeholder="Nagpur" disabled={isSubmitting} {...form.register("city")} />
          </div>

          {/* Area */}
          <div className="space-y-2">
            <Label>Area</Label>
            <Input placeholder="Dighori" disabled={isSubmitting} {...form.register("area")} />
          </div>

          {/* Address */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input placeholder="Full address" disabled={isSubmitting} {...form.register("address")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add User"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>);
}
