'use client'
import React from 'react';
import { BadgeCheck, Lock, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { useUnlocked, useAuth, useLeads, getPersistedAuth, useHasHydrated } from "@/lib/stores";
import { useSubmitEnquiry } from "@/lib/hooks/useEnquiry";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BrokerCard = React.memo(function BrokerCard({ broker, propertyTitle } ) {
  const hydrated = useHasHydrated();
  const unlockedStore = useUnlocked((s) => s.isUnlocked(broker.id));
  // Gate with hydrated so SSR (false) matches client first render
  const isUnlocked = hydrated && unlockedStore;
  const submitEnquiry = useSubmitEnquiry();

  const maskedPhone = "+91 ******** " + broker.phone.slice(-2);

  const handleUnlock = () => {
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const leadDetails = {
      name: user.name || 'Verified User',
      mobile: user.mobile || '9876543210',
      message: `Requested contact for broker: ${broker.name} regarding property: ${propertyTitle || 'General Listing'}`,
      brokerId: broker.id,
    };

    useLeads.getState().add(leadDetails);
    useUnlocked.getState().unlock(broker.id);

    submitEnquiry.mutate({
      propertyId: undefined,
      data: { name: leadDetails.name, mobile: leadDetails.mobile, message: leadDetails.message },
      token
    }, {
      onError: (err) => {
        console.warn("Broker unlock enquiry error:", err.message);
      }
    });

    toast.success('Contact unlocked!', {
      description: 'You can now view broker details and call directly.',
    });
  };


  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-card shadow-elegant">
      <div className="bg-gradient-primary px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
        {isUnlocked ? "Verified Broker" : "Listed By"}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={broker.image}
              alt={broker.name}
              width={64}
              height={64}
              className={`rounded-full object-cover ring-2 ring-primary/30 ${isUnlocked ? "" : "blur-md"}`}
            />
            {broker.verified && isUnlocked && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 fill-primary text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className={`font-display text-base font-bold ${isUnlocked ? "" : "blur-sm select-none"}`}>
                {isUnlocked ? broker.name : "Rajesh •••••"}
              </h3>
              {isUnlocked && broker.verified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                  Verified
                </span>
              )}
            </div>
            <p className={`text-xs text-muted-foreground ${isUnlocked ? "" : "blur-sm select-none"}`}>
              {isUnlocked ? broker.agency : "Agency Name Hidden"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {broker.experience}+ years experience
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Phone Number
          </div>
          <div className={`mt-0.5 font-mono text-base font-semibold ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
            {isUnlocked ? broker.phone : maskedPhone}
          </div>
        </div>

        {isUnlocked ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={`tel:${broker.phone}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              <Phone className="h-4 w-4" /> Call Now
            </a>
            <a
              href={`https://wa.me/${broker.whatsapp.replace(/\D/g, "")}?text=Hi%2C%20interested%20in%20${encodeURIComponent(propertyTitle || "your listing")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-whatsapp py-2.5 text-sm font-semibold text-whatsapp-foreground hover:opacity-90 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        ) : (
          <Button
            onClick={handleUnlock}
            variant="hero"
            size="lg"
            className="mt-4 w-full"
          >
            <Lock className="mr-2 h-4 w-4" /> View Contact to Unlock
          </Button>
        )}
      </div>
    </div>
  );
})
