'use client'
import React, { useMemo, useEffect, useState } from 'react';
import { BadgeCheck, Lock, MessageCircle, Phone, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUnlocked, useAuth, useLeads, getPersistedAuth, useHasHydrated } from "@/lib/stores";
import { useSubmitEnquiry, useSubmitCallEnquiry } from "@/lib/hooks/useEnquiry";
import { clientFetch } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BrokerCard = React.memo(function BrokerCard({ broker: initialBroker, propertyTitle, propertyId }) {
  const hydrated = useHasHydrated();
  const unlockedStore = useUnlocked((s) => s.isUnlocked(propertyId));
  const savedContact = useUnlocked((s) => s.getContact?.(propertyId));
  // Gate with hydrated so SSR (false) matches client first render
  const isUnlocked = hydrated && unlockedStore;
  const submitEnquiry = useSubmitEnquiry();
  const submitCallEnquiry = useSubmitCallEnquiry();
  const [isFetchingPhone, setIsFetchingPhone] = useState(false);

  const broker = useMemo(() => {
    if (!initialBroker && !savedContact) return null;
    const phone = savedContact?.phone || savedContact?.mobile || initialBroker?.phone || initialBroker?.mobile || '';
    const whatsapp = savedContact?.whatsapp || savedContact?.phone || savedContact?.mobile || initialBroker?.whatsapp || initialBroker?.phone || initialBroker?.mobile || '';
    const name = savedContact?.name || initialBroker?.name || 'Verified Broker';
    const agency = savedContact?.agency || initialBroker?.agency || 'Nagpur Prime Partner';
    const image = savedContact?.image || savedContact?.avatar || initialBroker?.image || initialBroker?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;

    return {
      ...(initialBroker || {}),
      ...(savedContact || {}),
      id: savedContact?.id || initialBroker?.id,
      name,
      agency,
      image,
      phone,
      whatsapp,
      verified: true,
    };
  }, [initialBroker, savedContact]);

  // If unlocked on client but phone number is not yet in props/store, fetch it using user auth token
  useEffect(() => {
    if (!isUnlocked || !propertyId) return;
    if (broker?.phone) return;

    const { token } = getPersistedAuth();
    if (!token) return;

    setIsFetchingPhone(true);
    clientFetch(`/api/properties/${propertyId}`, { auth: token })
      .then((res) => {
        const prop = res?.data || res;
        const b = prop?.brokerId || prop?.broker;
        const phone = b?.mobile || b?.phone || '';
        if (phone) {
          useUnlocked.getState().unlock(propertyId, {
            phone,
            whatsapp: phone,
            name: b?.name,
            agency: b?.agency || b?.city,
            image: b?.avatar || b?.profileImage,
          });
        }
      })
      .catch((err) => {
        console.warn("BrokerCard fetch error:", err.message);
      })
      .finally(() => {
        setIsFetchingPhone(false);
      });
  }, [isUnlocked, propertyId, broker?.phone]);

  if (!broker) return null;

  const rawPhone = broker.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10
    ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    : (cleanPhone.length === 12 && cleanPhone.startsWith('91'))
      ? `+91 ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`
      : (rawPhone ? (rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`) : '');

  const maskedPhone = cleanPhone.length >= 2
    ? `+91 ******** ${cleanPhone.slice(-2)}`
    : "+91 ******** XX";

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

    if (propertyId) {
      submitCallEnquiry.mutate({
        propertyId,
        token
      }, {
        onSuccess: (res) => {
          const brokerDetails = res?.brokerDetails || res?.data?.brokerDetails;
          const phone = brokerDetails?.mobile || brokerDetails?.phone || '';
          useUnlocked.getState().unlock(propertyId, {
            phone,
            whatsapp: phone,
            name: brokerDetails?.name || broker.name,
            agency: brokerDetails?.agency || brokerDetails?.city || broker.agency,
          });
          toast.success('Contact unlocked!', {
            description: 'You can now view broker details and call directly.',
          });
        },
        onError: (err) => {
          console.warn("Broker unlock call enquiry error:", err.message);
          useUnlocked.getState().unlock(propertyId);
          toast.success('Contact unlocked!');
        }
      });
    } else {
      submitEnquiry.mutate({
        propertyId: undefined,
        data: { name: leadDetails.name, mobile: leadDetails.mobile, message: leadDetails.message },
        token
      }, {
        onSuccess: (res) => {
          const brokerDetails = res?.brokerDetails || res?.data?.brokerDetails;
          const phone = brokerDetails?.mobile || brokerDetails?.phone || '';
          if (propertyId) {
            useUnlocked.getState().unlock(propertyId, {
              phone,
              whatsapp: phone,
              name: brokerDetails?.name || broker.name,
            });
          }
          toast.success('Contact unlocked!');
        },
        onError: (err) => {
          console.warn("Broker unlock enquiry error:", err.message);
        }
      });
    }
  };

  const handleCall = (e) => {
    e.preventDefault();
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const executeCall = (phoneNum) => {
      if (phoneNum) {
        const clean = phoneNum.replace(/\D/g, '');
        const formatted = clean.length === 10 ? `91${clean}` : clean;
        window.location.href = `tel:+${formatted}`;
      } else {
        toast.error('Broker phone number not available');
      }
    };

    if (propertyId) {
      submitCallEnquiry.mutate({ propertyId, token }, {
        onSuccess: (res) => {
          const brokerDetails = res?.brokerDetails || res?.data?.brokerDetails;
          const phone = brokerDetails?.mobile || brokerDetails?.phone || broker.phone;
          if (phone) {
            useUnlocked.getState().unlock(propertyId, {
              phone,
              whatsapp: phone,
              name: brokerDetails?.name || broker.name,
            });
          }
          executeCall(phone);
        },
        onError: (err) => {
          console.warn("Broker call enquiry error:", err.message);
          executeCall(broker.phone);
        }
      });
    } else {
      executeCall(broker.phone);
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const { token, user } = getPersistedAuth();
    if (!token || !user) { useAuth.getState().openAuth(); return; }

    const executeWhatsApp = (phoneNum) => {
      if (phoneNum) {
        const clean = phoneNum.replace(/\D/g, '');
        const formatted = clean.length === 10 ? `91${clean}` : clean;
        const msg = encodeURIComponent(`Hi, I am interested in "${propertyTitle || "your listing"}" listed on Nagpur Prime Property.`);
        window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Broker WhatsApp number not available');
      }
    };

    if (propertyId) {
      submitCallEnquiry.mutate({ propertyId, token }, {
        onSuccess: (res) => {
          const brokerDetails = res?.brokerDetails || res?.data?.brokerDetails;
          const phone = brokerDetails?.mobile || brokerDetails?.phone || broker.whatsapp || broker.phone;
          if (phone) {
            useUnlocked.getState().unlock(propertyId, {
              phone,
              whatsapp: phone,
              name: brokerDetails?.name || broker.name,
            });
          }
          executeWhatsApp(phone);
        },
        onError: (err) => {
          console.warn("Broker WhatsApp enquiry error:", err.message);
          executeWhatsApp(broker.whatsapp || broker.phone);
        }
      });
    } else {
      executeWhatsApp(broker.whatsapp || broker.phone);
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
            {isUnlocked ? (
              formattedPhone ? (
                formattedPhone
              ) : isFetchingPhone ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" /> Loading contact...
                </span>
              ) : (
                "+91 ••••• •••••"
              )
            ) : (
              maskedPhone
            )}
          </div>
        </div>

        {isUnlocked ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleCall}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 cursor-pointer transition-opacity"
            >
              <Phone className="h-4 w-4" /> Call Now
            </button>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-whatsapp py-2.5 text-sm font-semibold text-whatsapp-foreground hover:opacity-90 cursor-pointer transition-opacity"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
          </div>
        ) : (
          <Button
            onClick={handleUnlock}
            variant="hero"
            size="lg"
            className="mt-4 w-full cursor-pointer"
          >
            <Lock className="mr-2 h-4 w-4" /> View Contact to Unlock
          </Button>
        )}
      </div>
    </div>
  );
});

