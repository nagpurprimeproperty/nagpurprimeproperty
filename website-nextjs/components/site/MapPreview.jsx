'use client';

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { MapPin, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAGPUR_CENTER = { lat: 21.1458, lng: 79.0882 };

// Faux map pins as fallback
const FALLBACK_PINS = [
  { top: "20%", left: "30%", label: "Dighori" },
  { top: "55%", left: "55%", label: "MIHAN" },
  { top: "35%", left: "70%", label: "Wardha Road" },
  { top: "70%", left: "25%", label: "Manish Nagar" },
];

export function MapPreview({
  properties = [],
  highlight,
  onSelectLocality,
  onExpandMap,
  className,
  height = "aspect-[16/9]",
  caption = "Tap property marker or drag map",
}) {
  const loaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Check if API Key is configured and Maps SDK loaded successfully
  const useRealMap = loaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // ─── Real Google Map Initialization ──────────────────────────────────────────
  useEffect(() => {
    if (!useRealMap || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: NAGPUR_CENTER,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });
    mapInstance.current = map;

    // Handle map click to resolve locality and notify parent filter
    map.addListener("click", (e) => {
      if (!e.latLng) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          let sublocality = '';
          for (const res of results) {
            const comps = res.address_components || [];
            const get = (type) => comps.find((c) => c.types.includes(type))?.long_name ?? '';
            sublocality = get('sublocality_level_1') || get('sublocality') || get('neighborhood');
            if (sublocality) {
              break;
            }
          }
          
          if (sublocality) {
            onSelectLocality?.(sublocality);
          }
        }
      });
    });
  }, [useRealMap]);

  // Update markers and adjust map bounds whenever properties or highlight search changes
  useEffect(() => {
    if (!useRealMap || !mapInstance.current) return;

    const map = mapInstance.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidPoints = false;

    properties.forEach((p) => {
      // coordinates contains [longitude, latitude]
      if (Array.isArray(p.coordinates) && p.coordinates.length === 2) {
        const lng = p.coordinates[0];
        const lat = p.coordinates[1];

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const pos = { lat: Number(lat), lng: Number(lng) };
          const marker = new google.maps.Marker({
            position: pos,
            map,
            title: p.title,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              fillColor: "#e11d48", // primary brand color
              fillOpacity: 0.9,
              strokeWeight: 1,
              strokeColor: "#ffffff",
              scale: 6,
            },
          });

          marker.addListener("click", () => {
            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="padding: 4px; font-family: sans-serif; min-width: 140px;">
                <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1e293b;">${p.title}</h4>
                <p style="margin: 0; font-size: 11px; color: #0284c7; font-weight: bold;">${p.totalPrice || "Price on request"}</p>
                <a href="/properties/${p.slug || p._id}" style="display: inline-block; margin-top: 6px; font-size: 10px; color: #ffffff; background-color: #0f172a; padding: 4px 8px; border-radius: 4px; text-decoration: none;">View details</a>
              </div>`,
            });
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(pos);
          hasValidPoints = true;
        }
      }
    });

    if (highlight && highlight.trim()) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: `${highlight}, Nagpur, Maharashtra, India` }, (results, status) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          map.setCenter(loc);
          map.setZoom(14);
        }
      });
    } else if (hasValidPoints) {
      map.fitBounds(bounds);
      if (properties.length === 1) {
        map.setZoom(15);
      }
    } else {
      map.setCenter(NAGPUR_CENTER);
      map.setZoom(12);
    }
  }, [useRealMap, properties, highlight]);

  if (useRealMap) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-muted", height, className)}>
        <div ref={mapRef} className="h-full w-full" />
        {onExpandMap && (
          <button
            type="button"
            onClick={onExpandMap}
            className="absolute top-3 right-3 z-20 rounded-xl bg-primary hover:bg-primary-glow text-primary-foreground px-3.5 py-2 text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-primary/20"
          >
            <Maximize2 className="h-4 w-4" /> Full Screen Map
          </button>
        )}
        <div className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground z-10 pointer-events-none">
          {caption}
        </div>
      </div>
    );
  }

  // ─── Fallback Faux Map (Clickable Pins) ──────────────────────────────────────
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-border bg-muted", height, className)}
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklch, var(--accent) 70%, white) 0%, color-mix(in oklch, var(--secondary) 80%, white) 100%)",
      }}
    >
      {onExpandMap && (
        <button
          type="button"
          onClick={onExpandMap}
          className="absolute top-3 right-3 z-20 rounded-xl bg-primary hover:bg-primary-glow text-primary-foreground px-3.5 py-2 text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-primary/20"
        >
          <Maximize2 className="h-4 w-4" /> Full Screen Map
        </button>
      )}
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 400 225" preserveAspectRatio="none">
        <path d="M0,120 C90,140 180,60 400,110" stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
        <path d="M60,0 C100,80 220,160 260,225" stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
        <path d="M0,40 L400,200" stroke="hsl(var(--border))" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      </svg>

      {FALLBACK_PINS.map((p) => {
        const active =
          highlight &&
          (highlight.toLowerCase().includes(p.label.toLowerCase()) ||
            p.label.toLowerCase().includes(highlight.toLowerCase()));
        return (
          <button
            key={p.label}
            type="button"
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-all hover:scale-105"
            style={{ top: p.top, left: p.left }}
            onClick={() => onSelectLocality?.(p.label)}
          >
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-soft",
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-background text-foreground"
              )}
            >
              <MapPin className="h-3 w-3" /> {p.label}
            </div>
            <div
              className={cn(
                "mx-auto h-2 w-2 rotate-45",
                active ? "bg-primary" : "bg-background"
              )}
            />
          </button>
        );
      })}

      <div className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {caption}
      </div>
    </div>
  );
}
