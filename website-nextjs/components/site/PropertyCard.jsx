'use client';

import React, { useMemo, useCallback } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  MapPin, 
  Eye, 
  Phone,  
  Sparkles, 
  Ruler, 
  BedDouble, 
  Armchair, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Briefcase, 
  Car, 
  Leaf, 
  Compass,
  Camera,
  Video,
  MessageCircle
} from "lucide-react";
import { useFavorites, useAuth, useUnlocked, useLeads, getPersistedAuth, useHasHydrated } from "@/lib/stores";
import { useSubmitEnquiry } from "@/lib/hooks/useEnquiry";
import { useSaveToggle } from "@/lib/hooks/useProperties";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Removed framer-motion import
import { PropertyMedia } from "./PropertyMedia";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to extract dynamic card specifications based on property type, matching the mobile app
function getPropertySpecs(p) {
  const details = p.details || {};
  const type = p.propertyType || p.type || "";

  if (type === "Flat/Apartment" || type === "Penthouse" || type === "Builder Floor") {
    const superArea = p.area && p.area !== "N/A" ? p.area : (details.superBuiltUpArea ? `${details.superBuiltUpArea} sqft` : details.builtUpArea ? `${details.builtUpArea} sqft` : details.carpetArea ? `${details.carpetArea} sqft` : p.sqft ? `${p.sqft} sqft` : "N/A");
    const bedrooms = details.bhk ? `${details.bhk} BHK` : p.bhk ? `${p.bhk} BHK` : "N/A";
    const furnishing = details.furnishing ?? "N/A";
    return [
      { icon: Ruler, value: superArea, label: details.superBuiltUpArea ? "Super Area" : "Area" },
      { icon: BedDouble, value: bedrooms, label: "Bedrooms" },
      { icon: Armchair, value: furnishing, label: "Furnishing" },
    ];
  } else if (type === "Villa/Independent House") {
    const plotArea = details.plotArea ? `${details.plotArea} sqft` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const bedrooms = details.bhk ? `${details.bhk} BHK` : p.bhk ? `${p.bhk} BHK` : "N/A";
    const furnishing = details.furnishing ?? "N/A";
    return [
      { icon: Ruler, value: plotArea, label: "Plot Area" },
      { icon: BedDouble, value: bedrooms, label: "Bedrooms" },
      { icon: Armchair, value: furnishing, label: "Furnishing" },
    ];
  } else if (type === "Office Space") {
    const carpetArea = details.carpetArea ? `${details.carpetArea} sqft` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const capacity = details.cabinCount !== undefined && details.cabinCount > 0 ? `${details.cabinCount} Cabins` : details.openDesks !== undefined ? `${details.openDesks} Seats` : "N/A";
    const power = details.dgBackup === true ? "DG Backup" : details.dgBackup === false ? "No Backup" : "N/A";
    return [
      { icon: Ruler, value: carpetArea, label: "Carpet Area" },
      { icon: Briefcase, value: capacity, label: "Capacity" },
      { icon: Zap, value: power, label: "Power Backup" },
    ];
  } else if (type === "Shop") {
    const shopArea = p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A";
    const floor = details.shopFloor ?? "N/A";
    const corner = details.cornerShop === true ? "Corner Shop" : "Regular";
    return [
      { icon: Ruler, value: shopArea, label: "Shop Area" },
      { icon: Building2, value: floor, label: "Floor Level" },
      { icon: Compass, value: corner, label: "Position" },
    ];
  } else if (type === "Showroom") {
    const showroomArea = details.showroomArea ? `${details.showroomArea} sqft` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const floors = details.numberOfShowroomFloors ? `${details.numberOfShowroomFloors} Floors` : "N/A";
    const parking = details.parkingAvailable === true ? "Available" : "N/A";
    return [
      { icon: Ruler, value: showroomArea, label: "Showroom Area" },
      { icon: Building2, value: floors, label: "Floors" },
      { icon: Car, value: parking, label: "Parking" },
    ];
  } else if (type === "Warehouse/Godown") {
    const warehouseArea = details.warehouseArea ? `${details.warehouseArea} sqft` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const height = details.warehouseHeight ? `${details.warehouseHeight} ft` : "N/A";
    const midc = details.midc === true ? "MIDC Appr." : "Regular";
    return [
      { icon: Ruler, value: warehouseArea, label: "Warehouse Area" },
      { icon: Ruler, value: height, label: "Ceiling Height" },
      { icon: ShieldCheck, value: midc, label: "Approval" },
    ];
  } else if (type === "Residential Plot" || type.toLowerCase().includes("plot")) {
    const plotArea = details.plotAreaSqFt ? `${details.plotAreaSqFt} sqft` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const dims = details.plotLength && details.plotWidth ? `${details.plotLength}×${details.plotWidth} ft` : "N/A";
    const isGated = details.gatedLayout === true ? "Gated Layout" : "Open Layout";
    return [
      { icon: Ruler, value: plotArea, label: "Plot Area" },
      { icon: Compass, value: dims, label: "Dimensions" },
      { icon: ShieldCheck, value: isGated, label: "Security" },
    ];
  } else if (type === "Agricultural Land" || type.toLowerCase().includes("land")) {
    const landArea = details.areaAcres ? `${details.areaAcres} Acres` : (p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A");
    const soil = details.soilType ?? "N/A";
    const access = details.roadAccess === true ? "Yes" : details.roadAccess === false ? "No" : "N/A";
    return [
      { icon: Ruler, value: landArea, label: "Land Area" },
      { icon: Leaf, value: soil, label: "Soil Type" },
      { icon: Car, value: access, label: "Road Access" },
    ];
  } else {
    // Fallback
    const area = p.area && p.area !== "N/A" ? p.area : p.sqft ? `${p.sqft} sqft` : "N/A";
    const displayType = type || "Property";
    const isGated = Boolean(details.gatedLayout ?? details.gatedSociety ?? p.gatedSociety ?? p.gatedLayout ?? true);
    return [
      { icon: Ruler, value: area, label: "Area" },
      { icon: Building2, value: displayType, label: "Property Type" },
      { icon: ShieldCheck, value: isGated ? "Gated Project" : "Standard", label: "Security" },
    ];
  }
}

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const PropertyCard = React.memo(function PropertyCard({ p, index = 0 }) {
  const router = useRouter();
  const fav = useFavorites();
  const pid = p._id || p.id;
  const hydrated = useHasHydrated();
  // Gate with hydrated so SSR (false) matches client first render — no hydration warning
  const liked = hydrated && fav.ids.includes(pid);

  const saveToggleMutation = useSaveToggle();
  const submitEnquiry = useSubmitEnquiry();
  const unlockedStore = useUnlocked((s) => s.isUnlocked(p.broker?._id || p.brokerId));
  // Gate with hydrated so SSR (false) matches client first render
  const isUnlocked = hydrated && unlockedStore;

  const slug = useMemo(() => {
    // Prefer the real DB slug (unique, SEO-friendly, stable)
    if (p.slug) return p.slug;
    // Legacy fallback: slugify the title for old properties without a slug
    if (p.title) return slugify(p.title);
    return p._id || p.id;
  }, [p.slug, p.title, p._id, p.id]);

  const specs = useMemo(() => getPropertySpecs(p), [p]);

  const isNegotiable = useMemo(() => {
    return Boolean(
      p.priceNegotiable ??
      p.rentNegotiable ??
      (p.pricing && (p.pricing.priceNegotiable ?? p.pricing.rentNegotiable)) ??
      false
    );
  }, [p]);

  const priceDisplay = p.totalPrice || p.priceLabel || p.pricing?.totalPrice || "Price on request";

  const handleSaveToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    fav.toggle(pid);
    saveToggleMutation.mutate({ id: pid, token }, {
      onError: (err) => { console.warn('Save toggle backend error:', err.message); }
    });
  }, [pid, fav, saveToggleMutation]);


  const handleActionWithUnlockCheck = useCallback(async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const brokerId = p.broker?._id || p.brokerId;
    if (!brokerId) return;

    const rawMobile = p.broker?.mobile || p.broker?.phone || '9876543210';
    const cleanMobile = rawMobile.replace(/\D/g, '');
    const formatted = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    const isUnlocked = useUnlocked.getState().isUnlocked(brokerId);
    if (isUnlocked) {
      if (type === 'call') {
        window.location.href = `tel:+${formatted}`;
      } else {
        const msg = encodeURIComponent(`Hi, I am interested in your property "${p.title}" listed on Nagpur Prime Property.`);
        window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Perform background submission using user profile details
      const { token, user } = useAuth.getState();
      const { unlock, add: addLead } = useUnlocked.getState();
      const addLeadFn = useLeads.getState().add;
      const leadDetails = {
        name: user?.name || 'Verified User',
        mobile: user?.mobile || '9876543210',
        message: `Requested contact details for: ${p.title}`,
        brokerId,
        propertyId: pid,
      };

      // Optimistically update local store and unlock
      addLeadFn(leadDetails);
      useUnlocked.getState().unlock(brokerId);

      // Submit enquiry to backend in background
      submitEnquiry.mutate(
        { 
          propertyId: pid, 
          data: { name: leadDetails.name, mobile: leadDetails.mobile, message: leadDetails.message }, 
          token 
        },
        {
          onError: (err) => {
            console.warn('Enquiry background mutation error:', err.message);
          },
        }
      );

      toast.success('Contact unlocked!', {
        description: 'Broker details are now visible using your registered profile.',
      });

      // Now trigger the action after unlocking
      if (type === 'call') {
        window.location.href = `tel:+${formatted}`;
      } else {
        const msg = encodeURIComponent(`Hi, I am interested in your property "${p.title}" listed on Nagpur Prime Property.`);
        window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank', 'noopener,noreferrer');
      }
    }
  }, [pid, p, submitEnquiry]);

  return (
    <article
      style={{
        animation: 'fadeIn 0.35s ease-out forwards',
        animationDelay: `${Math.min(index * 0.04, 0.3)}s`,
        opacity: 0,
      }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant flex flex-col h-full"
    >
      {/* Media & Action Badges */}
      <div className="relative">
        <PropertyMedia
          images={p.images || p.photos || []}
          video={p.video}
          alt={p.title}
          aspectClassName="aspect-[5/4]"
          rounded="rounded-none"
        />
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-glow">
              <Sparkles className="h-3 w-3 animate-pulse" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
          {p.listingCategory && (
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-soft",
              (p.listingCategory === 'New' || p.listingCategory === 'New Launch')
                ? "bg-blue-600/90" 
                : p.listingCategory === 'Rental' 
                  ? "bg-sky-500/90" 
                  : "bg-amber-500/90"
            )}>
              {p.listingCategory === 'New' ? 'New Launch' : p.listingCategory}
            </span>
          )}
        </div>
        <button
          onClick={handleSaveToggle}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/95 backdrop-blur transition-all shadow-soft hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Save"
        >
          <Heart className={cn("h-4.5 w-4.5 transition-colors", liked ? "fill-primary text-primary" : "text-muted-foreground")} />
        </button>

        {/* Media Counts Overlay */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Camera className="h-3 w-3" /> {(p.images?.length || p.photos?.length || 1)}
          </span>
          {p.video && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <Video className="h-3 w-3" /> 1
            </span>
          )}
        </div>
      </div>

      {/* Info Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Price & Negotiability */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="text-xl font-extrabold tracking-tight text-primary flex items-center gap-1.5">
            {priceDisplay}
            {isNegotiable && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground border border-accent/20 uppercase tracking-wide">
                Negotiable
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {p.type || p.propertyType}
          </span>
        </div>

        {/* Dynamic Specifications Grid */}
        <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-2 gap-1.5 border-t border-b border-border/50 py-3 my-2 text-xs">
          {specs.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex flex-col items-center justify-center text-center p-1.5 rounded-xl bg-muted/30 border border-border/10">
                <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-primary/80 mb-1" />
                <span className="font-bold text-foreground truncate w-full text-[11px] sm:text-[10px] leading-tight">{s.value}</span>
                <span className="text-[9px] sm:text-[8px] font-semibold text-muted-foreground truncate w-full mt-0.5 leading-none">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Title */}
        <Link href={`/properties/${slug}`}>
          <h3 className="line-clamp-2 mt-1 font-display text-sm font-bold leading-snug text-foreground hover:text-primary transition-colors cursor-pointer min-h-[40px]">
            {p.title}
          </h3>
        </Link>

        {/* Description */}
        {p.description && (
          <p className="line-clamp-2 mt-1.5 text-xs text-muted-foreground leading-relaxed min-h-[32px]">
            {p.description}
          </p>
        )}

        {/* Locality Location */}
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground truncate">
          <MapPin className="h-3.5 w-3.5 text-primary/80 flex-shrink-0" /> {p.location || p.locality || 'Nagpur'}
        </p>

        {/* Action Call / WhatsApp Buttons */}
        <div className="mt-auto pt-3 flex gap-2 border-t border-border/40">
          <button
            onClick={(e) => handleActionWithUnlockCheck(e, 'call')}
            className="inline-flex flex-1 items-center justify-center h-9 rounded-xl border border-border bg-background hover:border-primary hover:text-primary transition-all active:scale-95 text-foreground cursor-pointer"
            title={isUnlocked ? 'Call Broker' : 'Unlock Contact'}
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleActionWithUnlockCheck(e, 'whatsapp')}
            className="inline-flex flex-1 items-center justify-center h-9 rounded-xl bg-whatsapp text-whatsapp-foreground hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            title="WhatsApp Broker"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <Link
            href={`/properties/${slug}`}
            className="inline-flex flex-1 items-center justify-center h-9 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-soft"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
})

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card shadow-soft overflow-hidden animate-pulse">
      {/* Media placeholder */}
      <div className="relative aspect-[5/4] bg-muted" />

      {/* Info details placeholder */}
      <div className="p-4 flex flex-col flex-grow space-y-4">
        {/* Price & Tag */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 bg-muted-foreground/15" />
          <Skeleton className="h-5 w-16 bg-muted-foreground/15 rounded-full" />
        </div>

        {/* Specs placeholder */}
        <div className="grid grid-cols-3 gap-1.5 border-y border-border/50 py-3 text-xs">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-muted/30 border border-border/10 space-y-1.5">
              <Skeleton className="h-4 w-4 bg-muted-foreground/15" />
              <Skeleton className="h-3 w-10 bg-muted-foreground/15" />
              <Skeleton className="h-2 w-8 bg-muted-foreground/10" />
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-muted-foreground/15" />
          <Skeleton className="h-4 w-2/3 bg-muted-foreground/15" />
        </div>

        {/* Description placeholder — matches the 2-line description in real card */}
        <div className="space-y-1.5 mt-1.5">
          <Skeleton className="h-3 w-full bg-muted-foreground/10" />
          <Skeleton className="h-3 w-4/5 bg-muted-foreground/10" />
        </div>

        {/* Locality */}
        <div className="flex items-center gap-1.5 pt-1">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-muted-foreground/15" />
          <Skeleton className="h-3.5 w-24 bg-muted-foreground/15" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-border/40">
          <Skeleton className="h-9 flex-1 bg-muted-foreground/15 rounded-xl" />
          <Skeleton className="h-9 flex-1 bg-muted-foreground/15 rounded-xl" />
          <Skeleton className="h-9 flex-1 bg-muted-foreground/15 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
