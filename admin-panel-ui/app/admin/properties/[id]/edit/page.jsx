"use client"

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, AlertCircle, Loader2, Building2, MapPin, User, ImageIcon, Tag, DollarSign, Sparkles, Check, } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProperty, useUpdateProperty } from "@/hooks/use-property-queries";
import { usePropertyForm } from "@/hooks/use-property-form";
import { BrokerSearch } from "@/components/admin/property/broker-search";
import { AmenitiesPicker } from "@/components/admin/property/aminities-picker";
import { BasicInfoSection, DetailsSection, PricingSection, } from "@/components/admin/property/form-sections";
import { LazyLocationSection, LazyPhotoUploader, } from "@/components/admin/property/property-wizard-lazy";
import PropertyListedByPicker from "@/components/admin/property/property-listed-by-picker";
const STEPS = [
    { id: "basic", label: "Basic Info", description: "Title, type & category", icon: Building2 },
    { id: "location", label: "Location", description: "Address & area details", icon: MapPin },
    { id: "broker", label: "Broker", description: "Assign a broker", icon: User },
    { id: "details", label: "Details", description: "BHK, area & features", icon: Tag },
    { id: "pricing", label: "Pricing", description: "Price & payment terms", icon: DollarSign },
    { id: "amenities", label: "Amenities", description: "Facilities & extras", icon: Sparkles },
    { id: "photos", label: "Media", description: "Photos & video", icon: ImageIcon },
];
function FormSkeleton() {
    return (<div className="max-w-4xl mx-auto space-y-6">
      {/* Header */} 
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg"/>
        <div className="space-y-2">
          <Skeleton className="h-5 w-36"/>
          <Skeleton className="h-4 w-64"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar skeleton */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/40">
            <Skeleton className="h-3 w-20"/>
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <Skeleton className="h-7 w-7 rounded-lg shrink-0"/>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32"/>
                  <Skeleton className="h-3 w-40"/>
                </div>
                <Skeleton className="h-4 w-6 rounded-md shrink-0"/>
              </div>))}
          </div>
          <div className="px-4 pb-4 pt-2 space-y-2">
            <Skeleton className="h-1.5 w-full rounded-full"/>
            <Skeleton className="h-3 w-36"/>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b bg-muted/20">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0"/>
            <div className="space-y-2">
              <Skeleton className="h-5 w-44"/>
              <Skeleton className="h-4 w-56"/>
            </div>
            <div className="ml-auto">
              <Skeleton className="h-6 w-16 rounded-md"/>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24"/>
                  <Skeleton className="h-10 w-full rounded-md"/>
                </div>))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/10">
            <Skeleton className="h-9 w-24 rounded-md"/>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (<Skeleton key={i} className="h-1.5 w-1.5 rounded-full"/>))}
            </div>
            <Skeleton className="h-9 w-28 rounded-md"/>
          </div>
        </div>
      </div>
    </div>);
}
function EditForm({ property, id, }) {
    const router = useRouter();
    const { toast } = useToast();
    const { mutate: updateProperty, isPending } = useUpdateProperty(id);
    const { form, set, errors, toggleAmenity, setAmenities, validateStepAndSet, validate, buildPayload, seedFromRecord, } = usePropertyForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(new Set());
    const [seeded, setSeeded] = useState(false);
    // Seed form from existing property record
    useEffect(() => {
        if (property && !seeded) {
            seedFromRecord(property);
            setSeeded(true);
        }
    }, [property, seeded, seedFromRecord]);
    const isLastStep = currentStep === STEPS.length - 1;
    const markComplete = (step) => setCompleted((prev) => new Set(prev).add(step));
    const goNext = () => {
        const valid = validateStepAndSet(currentStep);
        if (!valid)
            return;
        markComplete(currentStep);
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    };
    const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));
    const goToStep = (idx) => {
        if (idx <= currentStep || completed.has(idx - 1) || idx === 0)
            setCurrentStep(idx);
    };
    const handleSave = () => {
        const lastValid = validateStepAndSet(currentStep);
        if (!lastValid)
            return;
        const error = validate();
        if (error) {
            toast({ title: "Validation error", description: error, variant: "destructive" });
            return;
        }
        if (form.photos.length === 0) {
            toast({ title: "Validation error", description: "At least one photo is required", variant: "destructive" });
            return;
        }
        // buildPayload returns plain JSON with URL string arrays
        const payload = buildPayload();
        updateProperty(payload, {
            onSuccess: () => router.push(`/admin/properties/${id}`),
        });
    };
    if (!seeded)
        return <FormSkeleton />;
    const StepIcon = STEPS[currentStep].icon;
    return (<div className="mx-auto pb-16">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href={`/admin/properties/${id}`}><ArrowLeft className="h-4 w-4"/></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Edit Property</h1>
          <p className="text-sm text-muted-foreground line-clamp-1">{property.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* ── Step Sidebar ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</p>
            </div>
            <div className="p-2">
              {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isDone = completed.has(idx);
            const hasErr = isDone && isActive && Object.keys(errors).length > 0;
            const isLocked = idx > currentStep && !completed.has(idx - 1) && idx !== 0;
            return (<button key={step.id} type="button" onClick={() => goToStep(idx)} disabled={isLocked} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
                      ${isActive
                    ? hasErr
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary text-primary-foreground shadow-sm"
                    : isDone
                        ? "hover:bg-muted/60 text-foreground cursor-pointer"
                        : isLocked
                            ? "opacity-40 cursor-not-allowed text-muted-foreground"
                            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors
                      ${isActive
                    ? hasErr ? "bg-destructive/20" : "bg-primary-foreground/20"
                    : isDone ? "bg-green-500/10"
                        : "bg-muted"}`}>
                      {isDone && !isActive
                    ? <Check className="h-3.5 w-3.5 text-green-600"/>
                    : hasErr
                        ? <AlertCircle className="h-3.5 w-3.5 text-destructive"/>
                        : <Icon className={`h-3.5 w-3.5 ${isActive && !hasErr ? "text-primary-foreground" : ""}`}/>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium leading-none mb-0.5
                        ${isActive && !hasErr ? "text-primary-foreground" : ""}
                        ${hasErr ? "text-destructive" : ""}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs leading-none truncate
                        ${isActive && !hasErr ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {step.description}
                      </p>
                    </div>
                    <span className={`text-xs font-mono shrink-0
                      ${isActive && !hasErr ? "text-primary-foreground/60" : "text-muted-foreground/50"}`}>
                      {idx + 1}
                    </span>
                  </button>);
        })}
            </div>
            <div className="px-4 pb-4 pt-2">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completed.size / STEPS.length) * 100}%` }}/>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {completed.size} of {STEPS.length} sections reviewed
              </p>
            </div>
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="min-w-0">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">

            <div className="flex items-center gap-3 px-6 py-5 border-b bg-muted/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <StepIcon className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <h2 className="font-semibold">{STEPS[currentStep].label}</h2>
                <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
              </div>
              <div className="ml-auto shrink-0">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {currentStep + 1} / {STEPS.length}
                </span>
              </div>
            </div>

            <div className="p-6">
              {currentStep === 0 && (<BasicInfoSection form={form} set={set} errors={errors} disabled={isPending}/>)}
              {currentStep === 1 && (<LazyLocationSection form={form} set={set} errors={errors} disabled={isPending}/>)}
              {currentStep === 2 && (<>
                  <PropertyListedByPicker form={form} set={set} errors={errors} disabled={isPending}/>
                    {
                      errors.propertyListedBy && (<p className="flex items-center gap-1.5 text-xs text-destructive mt-3">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0"/>
                          {errors.propertyListedBy}
                        </p>)}
                  <BrokerSearch selectedId={form.brokerId} selectedName={form.brokerName} onSelect={(bId, name) => { set("brokerId", bId); set("brokerName", name); }} onClear={() => { set("brokerId", ""); set("brokerName", ""); }} disabled={isPending}/>
                  {errors.brokerId && (<p className="flex items-center gap-1.5 text-xs text-destructive mt-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0"/>
                      {errors.brokerId}
                    </p>)}
                </>)}
              {currentStep === 3 && (<DetailsSection form={form} set={set} errors={errors} disabled={isPending}/>)}
              {currentStep === 4 && (<PricingSection form={form} set={set} errors={errors} disabled={isPending}/>)}
              {currentStep === 5 && (<>
                  <AmenitiesPicker selected={form.amenities} onAmenitiesChange={setAmenities} onToggle={toggleAmenity} disabled={isPending}/>
                  {errors.amenities && (<p className="flex items-center gap-1.5 text-xs text-destructive mt-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0"/>
                      {errors.amenities}
                    </p>)}
                </>)}
              {currentStep === 6 && (<>
                  {/*
              PhotoUploader now works purely with URL strings.
              - Uploading a new photo → immediate S3 upload → URL added to form.photos
              - Removing a photo → immediate S3 delete → URL removed from form.photos
              - Same for video via form.videoUrl
              No file blobs reach the submit handler.
            */}
                  <LazyPhotoUploader value={form.photos} videoUrl={form.videoUrl} onChange={(urls) => set("photos", urls)} onVideoChange={(url) => set("videoUrl", url)} disabled={isPending}/>
                  {errors.photos && (<p className="flex items-center gap-1.5 text-xs text-destructive mt-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0"/>
                      {errors.photos}
                    </p>)}
                </>)}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/10">
              <Button type="button" variant="outline" onClick={goPrev} disabled={currentStep === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4"/>Back
              </Button>

              <div className="flex items-center gap-1.5">
                {STEPS.map((_, idx) => (<button key={idx} type="button" onClick={() => goToStep(idx)} className={`h-1.5 rounded-full transition-all duration-300
                      ${idx === currentStep
                ? "w-6 bg-primary"
                : completed.has(idx)
                    ? "w-1.5 bg-green-500"
                    : "w-1.5 bg-muted-foreground/25"}`}/>))}
              </div>

              {isLastStep ? (<Button type="button" onClick={handleSave} disabled={isPending} className="gap-2 min-w-36">
                  {isPending
                ? <><Loader2 className="h-4 w-4 animate-spin"/>Saving…</>
                : <><Check className="h-4 w-4"/>Save Changes</>}
                </Button>) : (<Button type="button" onClick={goNext} className="gap-2">
                  Next<ArrowRight className="h-4 w-4"/>
                </Button>)}
            </div>

          </div>
        </div>
      </div>
    </div>);
}
export default function EditPropertyPage({ params }) {
    const { id } = use(params);
    const { data: property, isLoading, isError } = useProperty(id);
    if (isLoading)
        return <FormSkeleton />;
    if (isError || !property) {
        return (<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive"/>
        </div>
        <h3 className="text-lg font-semibold">Property Not Found</h3>
        <p className="text-sm text-muted-foreground">Could not load this property for editing.</p>
        <Button asChild><Link href="/admin/properties">Back to Properties</Link></Button>
      </div>);
    }
    return <EditForm property={property} id={id}/>;
}
