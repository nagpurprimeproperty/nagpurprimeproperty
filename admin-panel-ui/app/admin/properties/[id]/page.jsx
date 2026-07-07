"use client"

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Building2, User, Phone, Mail, Star, StarOff, Trash2, Pencil, AlertCircle, Settings2, Loader2, Tag, DollarSign, Sparkles, Info, Calendar, Home, Layers, CheckCircle2, XCircle, Clock, TrendingUp, Shield, } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProperty, useUpdatePropertyStatus, useToggleFeatured, useDeleteProperty, } from "@/hooks/use-property-queries";
import { UpdateStatusDialog } from "@/components/admin/property/update-status-dialog";
import { PermissionGate } from "@/components/utils/permission-gate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, } from "@/components/ui/alert-dialog";
import { InfoRow, MediaSlider, StatTile } from "@/components/admin/property/property-detail-primitives";
import { formatInr } from "@/lib/formatters";
// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Active: { variant: "default", icon: CheckCircle2, color: "text-green-600" },
    Sold: { variant: "outline", icon: TrendingUp, color: "text-blue-600" },
    Inactive: { variant: "destructive", icon: XCircle, color: "text-red-600" },
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(property) {
    const p = property.pricing;
    const raw = p?.totalPrice ?? p?.monthlyRent ?? p?.startingPrice;
    if (!raw)
        return "Price TBD";
    const fmt = formatInr(raw);
    return property.listingCategory === "Rental" ? `${fmt}/mo` : fmt;
}
function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}
// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "details", label: "Details", icon: Tag },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "amenities", label: "Amenities", icon: Sparkles },
];
// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
    return (<div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Skeleton className="h-8 w-44 rounded-md"/>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md"/>
          <Skeleton className="h-9 w-24 rounded-md"/>
          <Skeleton className="h-9 w-24 rounded-md"/>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left / main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Media */}
          <Skeleton className="h-[380px] w-full rounded-2xl"/>

          {/* Title + price */}
          <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full"/>
              <Skeleton className="h-6 w-24 rounded-full"/>
              <Skeleton className="h-6 w-20 rounded-full"/>
              <Skeleton className="h-6 w-24 rounded-full"/>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-6 w-80"/>
                <Skeleton className="h-4 w-64"/>
              </div>
              <div className="space-y-2 sm:text-right">
                <Skeleton className="h-8 w-32 sm:ml-auto"/>
                <Skeleton className="h-3 w-24 sm:ml-auto"/>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="rounded-xl border bg-muted/10 p-3 space-y-2">
                  <Skeleton className="h-3 w-16"/>
                  <Skeleton className="h-4 w-20"/>
                </div>))}
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="flex border-b bg-muted/20">
              {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="px-4 py-3.5">
                  <Skeleton className="h-4 w-20"/>
                </div>))}
            </div>
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-40"/>
              <Skeleton className="h-3 w-full"/>
              <Skeleton className="h-3 w-11/12"/>
              <Skeleton className="h-3 w-10/12"/>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-muted/30 flex items-center gap-2">
                <Skeleton className="h-3 w-24"/>
              </div>
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((__, j) => (<div key={j} className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3 w-24"/>
                    <Skeleton className="h-3 w-28"/>
                  </div>))}
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PropertyDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const { data: property, isLoading, isError } = useProperty(id);
    const [activeTab, setActiveTab] = useState("overview");
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { mutate: updateStatus, isPending: statusPending } = useUpdatePropertyStatus();
    const { mutate: toggleFeatured, isPending: featurePending } = useToggleFeatured();
    const { mutate: deleteProperty, isPending: deletePending } = useDeleteProperty();
    const handleToggleFeatured = () => property && toggleFeatured({ id: property._id, featured: !property.featured });
    const handleDelete = () => {
        if (!property)
            return;
        deleteProperty(property, { onSuccess: () => router.push("/admin/properties") });
        setDeleteOpen(false);
    };
    const handleStatusChange = (id, status) => {
        updateStatus({ id, status });
    };
    if (isLoading)
        return <PageSkeleton />;
    if (isError || !property) {
        return (<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive"/>
        </div>
        <h3 className="text-lg font-semibold">Property Not Found</h3>
        <p className="text-sm text-muted-foreground">This property doesn't exist or failed to load.</p>
        <Button asChild><Link href="/admin/properties">Back to Properties</Link></Button>
      </div>);
    }
    const broker = property.brokerId;
    const details = (property.details ?? {});
    const pricing = (property.pricing ?? {});
    const statusCfg = STATUS_CONFIG[property.status] ?? STATUS_CONFIG.Inactive;
    return (<div className="space-y-6 pb-12">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-2 w-fit" asChild>
          <Link href="/admin/properties"><ArrowLeft className="h-4 w-4"/>Back to Properties</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate module="properties" action="write">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/properties/${id}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5"/>Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleToggleFeatured} disabled={featurePending}>
              {property.featured
            ? <><StarOff className="mr-1.5 h-3.5 w-3.5"/>Unfeature</>
            : <><Star className="mr-1.5 h-3.5 w-3.5"/>Feature</>}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-1.5 h-3.5 w-3.5"/>Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleStatusChange(property._id, "Active")} disabled={property.status === "Active"} className="gap-2 cursor-pointer text-green-600 focus:text-green-600">
                  <CheckCircle2 className="h-4 w-4"/>Activate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(property._id, "Inactive")} disabled={property.status === "Inactive"} className="gap-2 cursor-pointer">
                  <XCircle className="h-4 w-4"/>Deactivate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange(property._id, "Sold")} disabled={property.status === "Sold"} className="gap-2 cursor-pointer text-blue-600 focus:text-blue-600">
                  <TrendingUp className="h-4 w-4"/>Mark Sold
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGate>
          <PermissionGate module="properties" action="delete">
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:border-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5"/>Delete
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left / main column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Media slider — images + video unified */}
          <MediaSlider photos={property.photos ?? []} videoUrl={property.video ?? undefined} title={property.title}/>

          {/* Title + price card */}
          <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusCfg.variant} className="gap-1">
                <statusCfg.icon className={`h-3 w-3 ${statusCfg.color}`}/>
                {property.status}
              </Badge>
              {property.featured && (<Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20 gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500"/>Featured
                </Badge>)}
              <Badge variant="outline">{property.listingCategory}</Badge>
              <Badge variant="secondary">{property.propertyType}</Badge>
            </div>

            {/* Title + price */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <h1 className="text-xl font-bold leading-snug">{property.title}</h1>
              <div className="sm:text-right shrink-0">
                <p className="text-2xl font-bold text-primary">{formatPrice(property)}</p>
                {pricing.pricePerSqft && (<p className="text-xs text-muted-foreground mt-0.5">
                    ₹{Number(pricing.pricePerSqft).toLocaleString("en-IN")}/sq.ft
                  </p>)}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70"/>
              <span>
                {[property.location?.subLocality, property.location?.locality, "Nagpur"]
            .filter(Boolean).join(", ")}
                {property.location?.pinCode ? ` — ${property.location.pinCode}` : ""}
                {property.location?.landmark ? ` · Near ${property.location.landmark}` : ""}
              </span>
            </div>

            {/* Quick stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <StatTile icon={Building2} label="Type" value={property.propertyType}/>
              {details.bhk != null && <StatTile icon={Bed} label="BHK" value={String(details.bhk)}/>}
              {details.bathrooms != null && <StatTile icon={Bath} label="Bathrooms" value={String(details.bathrooms)}/>}
              {(details.carpetArea ?? details.plotAreaSqFt ?? details.areaAcres) != null && (<StatTile icon={Maximize} label="Area" value={details.carpetArea ? `${details.carpetArea} sq.ft`
                : details.plotAreaSqFt ? `${details.plotAreaSqFt} sq.ft`
                    : details.areaAcres ? `${details.areaAcres} acres`
                        : "—"}/>)}
              {details.floorNumber != null && <StatTile icon={Layers} label="Floor" value={`${details.floorNumber}/${details.totalFloors ?? "?"}`}/>}
              {details.furnishing && <StatTile icon={Home} label="Furnishing" value={details.furnishing}/>}
              {pricing.possessionTimeline && <StatTile icon={Clock} label="Possession" value={pricing.possessionTimeline}/>}
              {details.ageOfProperty && <StatTile icon={Calendar} label="Age" value={details.ageOfProperty}/>}
            </div>
          </div>

          {/* Tabbed detail card */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex overflow-x-auto border-b bg-muted/20">
              {TABS.map(({ id: tabId, label, icon: Icon }) => (<button key={tabId} type="button" onClick={() => setActiveTab(tabId)} className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${activeTab === tabId
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  <Icon className="h-3.5 w-3.5"/>
                  {label}
                </button>))}
            </div>

            {/* Tab body */}
            <div className="p-6">

              {/* ── Overview ── */}
              {activeTab === "overview" && (<div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-foreground">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {property.description || "No description provided."}
                    </p>
                  </div>
                  {property.rejectedReason && (<div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-1">
                      <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4"/>Rejection Reason
                      </p>
                      <p className="text-sm text-muted-foreground">{property.rejectedReason}</p>
                    </div>)}
                </div>)}

              {/* ── Details ── */}
              {activeTab === "details" && (<div>
                  {Object.keys(details).length === 0 ? (<p className="text-sm text-muted-foreground">No property details available.</p>) : (<div className="grid sm:grid-cols-2 gap-x-10">
                      {Object.entries(details)
                    .filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0))
                    .map(([k, v]) => (<InfoRow key={k} label={formatLabel(k)} value={v}/>))}
                    </div>)}
                </div>)}

              {/* ── Pricing ── */}
              {activeTab === "pricing" && (<div>
                  {Object.keys(pricing).length === 0 ? (<p className="text-sm text-muted-foreground">No pricing details available.</p>) : (<div className="grid sm:grid-cols-2 gap-x-10">
                      {Object.entries(pricing)
                    .filter(([, v]) => v != null && v !== "")
                    .map(([k, v]) => (<InfoRow key={k} label={formatLabel(k)} value={v}/>))}
                    </div>)}
                </div>)}

              {/* ── Amenities ── */}
              {activeTab === "amenities" && (<div>
                  {!property.amenities?.length ? (
                    <p className="text-sm text-muted-foreground">No amenities listed.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {property.amenities?.map((a) => (
                        <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-muted/40 text-foreground">
                          <Sparkles className="h-3 w-3 text-primary/60"/>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>)}

            </div>
          </div>
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Property meta */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-muted/30 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground"/>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property Info</p>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="ID" value={property._id}/>
              <InfoRow label="Status" value={property.status}/>
              <InfoRow label="Category" value={property.listingCategory}/>
              <InfoRow label="Type" value={property.propertyType}/>
              <InfoRow label="Locality" value={property.location?.locality}/>
              {property.location?.pinCode && <InfoRow label="Pincode" value={property.location.pinCode}/>}
              <InfoRow label="Photos" value={`${property.photos?.length ?? 0} photo${property.photos?.length !== 1 ? "s" : ""}${property.video ? " + 1 video" : ""}`}/>
              <InfoRow label="Listed" value={new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}/>
              <InfoRow label="Updated" value={new Date(property.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}/>
            </div>
          </div>

          {/* Broker card */}
          {broker && (<div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-muted/30 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground"/>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listed By</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  {broker.avatar ? (<Image src={broker.avatar} alt={broker.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-border" loading="lazy"/>) : (<div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0 ring-2 ring-border">
                      <span className="text-sm font-bold text-primary">
                        {broker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>)}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{broker.name}</p>
                    <p className="text-xs text-muted-foreground">{broker.area ?? broker.city ?? "Nagpur"}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {broker.mobile && (<a href={`tel:${broker.mobile}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors"/>
                      </span>
                      {broker.mobile}
                    </a>)}
                  {broker.email && (<a href={`mailto:${broker.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Mail className="h-3.5 w-3.5 group-hover:text-primary transition-colors"/>
                      </span>
                      <span className="truncate">{broker.email}</span>
                    </a>)}
                </div>
              </div>
            </div>)}

          {/* Quick actions card */}
          <PermissionGate module="properties" action="write">
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
              </div>
              <div className="p-4 space-y-2">
                <Button className="w-full justify-start gap-2" size="sm" asChild>
                  <Link href={`/admin/properties/${id}/edit`}>
                    <Pencil className="h-3.5 w-3.5"/>Edit Property
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => setStatusDialogOpen(true)}>
                  <Settings2 className="h-3.5 w-3.5"/>Update Status
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={handleToggleFeatured} disabled={featurePending}>
                  {property.featured
            ? <><StarOff className="h-3.5 w-3.5"/>Remove Featured</>
            : <><Star className="h-3.5 w-3.5"/>Mark as Featured</>}
                </Button>
                <PermissionGate module="properties" action="delete">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5"/>Delete Property
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </PermissionGate>

        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <UpdateStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} propertyId={property._id} propertyTitle={property.title} currentStatus={property.status}/>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Property</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>&quot;{property.title}&quot;</strong>?
            All photos and video will also be removed. This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletePending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Deleting…</>
            : "Delete Property"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
