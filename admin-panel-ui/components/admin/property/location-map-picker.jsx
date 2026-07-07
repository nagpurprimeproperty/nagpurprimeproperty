"use client"

/// <reference types="google.maps" />
import { useEffect, useRef, useCallback, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { MapPin, Search } from "lucide-react";
const NAGPUR_CENTER = { lat: 21.1458, lng: 79.0882 };
export function LocationMapPicker({ lat, lng, onFill, disabled }) {
    const loaded = useGoogleMaps();
    const mapRef = useRef(null);
    const inputRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    // Always hold latest onFill — prevents stale closure in map listeners
    const onFillRef = useRef(onFill);
    useEffect(() => { onFillRef.current = onFill; }, [onFill]);
    const [address, setAddress] = useState("");
    // ── Stable fillFromComponents ─────────────────────────────────────────────
    // useCallback with no deps so the reference never changes,
    // but reads onFillRef.current at call-time (always fresh).
    const fillFromComponents = useCallback((components, latVal, lngVal) => {
        const get = (type) => components.find((c) => c.types.includes(type))?.long_name ?? "";
        // Nagpur geocoding hierarchy:
        //   sublocality_level_1 → main neighbourhood ("Dhantoli", "Dharampeth") → Locality
        //   sublocality_level_2 → finer sub-area ("Dharampeth Nagar")           → Sub-locality
        //   locality            → city ("Nagpur") — too coarse, skipped
        const locality = get("sublocality_level_1") ||
            get("sublocality") ||
            get("neighborhood");
        const subLocality = get("sublocality_level_2") ||
            get("administrative_area_level_3");
        const landmark = get("point_of_interest") || get("establishment");
        const pinCode = get("postal_code");
        onFillRef.current({
            locality: locality || undefined,
            subLocality: subLocality || undefined,
            landmark: landmark || undefined,
            pinCode: pinCode || undefined,
            lat: latVal.toFixed(6),
            lng: lngVal.toFixed(6),
        });
    }, []); // stable — reads onFillRef.current at runtime
    // ── Stable reverseGeocode ─────────────────────────────────────────────────
    const reverseGeocode = useCallback((latVal, lngVal) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latVal, lng: lngVal } }, (results, status) => {
            if (status === "OK" && results?.[0]) {
                setAddress(results[0].formatted_address);
                fillFromComponents(results[0].address_components ?? [], latVal, lngVal);
            }
        });
    }, [fillFromComponents]); // fillFromComponents is stable so this is too
    // ── Init map ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !mapRef.current)
            return;
        const center = lat && lng
            ? { lat: parseFloat(lat), lng: parseFloat(lng) }
            : NAGPUR_CENTER;
        const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });
        const marker = new google.maps.Marker({
            position: center,
            map,
            draggable: true,
            title: "Property Location",
        });
        // Closures now capture stable `reverseGeocode` — never stale
        marker.addListener("dragend", () => {
            const pos = marker.getPosition();
            reverseGeocode(pos.lat(), pos.lng());
        });
        map.addListener("click", (e) => {
            if (!e.latLng)
                return;
            marker.setPosition(e.latLng);
            reverseGeocode(e.latLng.lat(), e.latLng.lng());
        });
        mapInstance.current = map;
        markerRef.current = marker;
    }, [loaded, reverseGeocode]); // reverseGeocode is stable → runs only once
    // ── Init autocomplete ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !inputRef.current)
            return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "in" },
            fields: ["address_components", "geometry", "formatted_address"],
        });
        ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            if (!place.geometry?.location)
                return;
            const loc = place.geometry.location;
            mapInstance.current?.panTo(loc);
            mapInstance.current?.setZoom(16);
            markerRef.current?.setPosition(loc);
            setAddress(place.formatted_address ?? "");
            fillFromComponents(place.address_components ?? [], loc.lat(), loc.lng());
        });
    }, [loaded, fillFromComponents]); // fillFromComponents is stable → runs only once
    if (!loaded) {
        return (<div className="h-64 rounded-xl border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>);
    }
    return (<div className="space-y-3">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"/>
        <input ref={inputRef} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Search address or landmark…" disabled={disabled} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"/>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-64 rounded-xl border overflow-hidden"/>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3"/>
        Search or click/drag the pin to set location. Fields below will auto-fill.
      </p>
    </div>);
}
