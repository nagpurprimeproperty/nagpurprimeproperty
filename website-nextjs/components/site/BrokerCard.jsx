'use client'
import React from 'react';
import { BadgeCheck, Lock, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { useUnlocked, useAuth, useLeads, getPersistedAuth, useHasHydrated } from "@/lib/stores";
import { useSubmitEnquiry, useSubmitCallEnquiry } from "@/lib/hooks/useEnquiry";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BrokerCard = React.memo(function BrokerCard({ broker, propertyTitle, propertyId }) {
  const hydrated = useHasHydrated();
  const unlockedStore = useUnlocked((s) => s.isUnlocked(broker?.id));
  // Gate with hydrated so SSR (false) matches client first render
  const isUnlocked = hydrated && unlockedStore;
  const submitEnquiry = useSubmitEnquiry();
  const submitCallEnquiry = useSubmitCallEnquiry();

  if (!broker) return null;

  const maskedPhone = broker.phone ? "+91 ******** " + broker.phone.slice(-2) : "+91 ******** XX";
  const firstName = broker.name ? broker.name.split(' ')[0] : 'Broker';
  const displayName = isUnlocked ? broker.name : `${firstName} •••••`;

  const handleUnlock = () => {
    // Read directly from localStorage — 100% reliable, no Zustand hydration involved
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const leadDetails = {
      name: user.name || 'Verified User',
      mobile: user.mobile || '',
      message: `Requested contact for broker: ${broker.name} regarding property: ${propertyTitle || 'General Listing'}`,
      brokerId: broker.id,
      propertyId,
    };

    useLeads.getState().add(leadDetails);
    useUnlocked.getState().unlock(broker.id);

    if (propertyId) {
      submitCallEnquiry.mutate({
        propertyId,
        token
      }, {
        onError: (err) => {
          console.warn("Broker unlock call enquiry error:", err.message);
        }
      });
    } else {
      submitEnquiry.mutate({
        propertyId: undefined,
        data: { name: leadDetails.name, mobile: leadDetails.mobile, message: leadDetails.message },
        token
      }, {
        onError: (err) => {
          console.warn("Broker unlock enquiry error:", err.message);
        }
      });
    }

    toast.success('Contact unlocked!', {
      description: 'You can now view broker details and call directly.',
    });
  };

  const handleCall = (e) => {
    e.preventDefault();
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    if (propertyId) {
      submitCallEnquiry.mutate({ propertyId, token }, {
        onError: (err) => console.warn("Broker call enquiry error:", err.message)
      });
    }

    if (broker.phone) {
      const clean = broker.phone.replace(/\D/g, '');
      const formatted = clean.length === 10 ? `91${clean}` : clean;
      window.location.href = `tel:+${formatted}`;
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    if (propertyId) {
      submitCallEnquiry.mutate({ propertyId, token }, {
        onError: (err) => console.warn("Broker WhatsApp enquiry error:", err.message)
      });
    }

    const raw = broker.whatsapp || broker.phone || '';
    if (raw) {
      const clean = raw.replace(/\D/g, '');
      const formatted = clean.length === 10 ? `91${clean}` : clean;
      const msg = encodeURIComponent(`Hi, I am interested in "${propertyTitle || "your listing"}" listed on Nagpur Prime Property.`);
      window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank', 'noopener,noreferrer');
    }
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
              alt={broker.name || "Broker Image"}
              width={64}
              height={64}
              className={`rounded-full object-cover ring-2 ring-primary/30 ${isUnlocked ? "" : "blur-md"}`}
              unoptimized
            />
            {broker.verified && isUnlocked && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 fill-primary text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className={`font-display text-base font-bold ${isUnlocked ? "" : "blur-sm select-none"}`}>
                {displayName}
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
            <button
              onClick={handleCall}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              <Phone className="h-4 w-4" /> Call Now
            </button>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-whatsapp py-2.5 text-sm font-semibold text-whatsapp-foreground hover:opacity-90 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
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
});
