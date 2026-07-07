/**
 * CreateSubAdminDialog — form to create a new sub-admin
 */
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
const schema = z.object({
    firstName: z.string().min(2, "Min 2 characters").max(30, "Max 30 characters"),
    lastName: z.string().min(2, "Min 2 characters").max(30, "Max 30 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^(\+91[\-\s]?)?(\d{10})$/, "Enter a valid 10-digit number"),
    password: z.string().min(8, "Min 8 characters").max(20, "Max 20 characters"),
});
export function CreateSubAdminDialog({ open, isSubmitting, onOpenChange, onSubmit }) {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "" },
    });
    const handleSubmit = (data) => {
        onSubmit(data);
        form.reset();
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Sub Admin</DialogTitle>
          <DialogDescription>
            Add a new sub-admin user to manage specific modules
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="John" disabled={isSubmitting} {...form.register("firstName")}/>
              {form.formState.errors.firstName && (<p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>)}
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Doe" disabled={isSubmitting} {...form.register("lastName")}/>
              {form.formState.errors.lastName && (<p className="text-xs text-destructive">
                  {form.formState.errors.lastName.message}
                </p>)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="john@example.com" disabled={isSubmitting} {...form.register("email")}/>
            {form.formState.errors.email && (<p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>)}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input placeholder="9876543210" disabled={isSubmitting} {...form.register("phone")}/>
            {form.formState.errors.phone && (<p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>)}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Min 8 characters" disabled={isSubmitting} {...form.register("password")}/>
            {form.formState.errors.password && (<p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>)}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); form.reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);
}
