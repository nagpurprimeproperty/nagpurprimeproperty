import { Apple, Smartphone, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";

export function AppDownloadModal({
  open,
  onOpenChange,
} ) {
  const [links, setLinks] = useState({ android: "", ios: "" });

  useEffect(() => {
    if (open) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setLinks({
              android: res.data.androidAppLink || "",
              ios: res.data.iosAppLink || "",
            });
          }
        })
        .catch((err) => console.error("Error fetching app links:", err));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="bg-gradient-primary px-6 py-7 text-primary-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <Sparkles className="h-3 w-3" /> Owners only
          </span>
          <DialogHeader className="mt-3 space-y-1">
            <DialogTitle className="font-display text-2xl font-extrabold text-primary-foreground">
              List your property on the Nagpur Prime Property app
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm opacity-90">
            Listings, leads, chat and visit scheduling happen on our owner app —
            install it free and get your first inquiry within 24 hours.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-[120px_1fr] sm:items-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-2xl border border-border bg-card p-2 shadow-soft">
            <Image
              src="/logo.jpeg"
              alt="Nagpur Prime Property Logo"
              width={96}
              height={96}
              className="rounded-xl object-cover"
            />
          </div>
          <div className="space-y-2">
            <a
              href={links.android || "#"}
              target={links.android ? "_blank" : undefined}
              rel={links.android ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (!links.android) {
                  e.preventDefault();
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left hover:border-primary"
            >
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Get it on</div>
                <div className="text-sm font-bold">Google Play</div>
              </div>
            </a>
            <a
              href={links.ios || "#"}
              target={links.ios ? "_blank" : undefined}
              rel={links.ios ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (!links.ios) {
                  e.preventDefault();
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left hover:border-primary"
            >
              <Apple className="h-5 w-5 text-primary" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Download on the</div>
                <div className="text-sm font-bold">App Store</div>
              </div>
            </a>
          </div>
        </div>

        <p className="px-6 pb-6 text-center text-[11px] text-muted-foreground">
          Download the app to list and manage your properties.
        </p>
      </DialogContent>
    </Dialog>
  );
}
