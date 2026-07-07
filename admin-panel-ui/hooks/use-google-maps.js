// hooks/use-google-maps.ts
import { useEffect, useState } from "react";
const SCRIPT_ID = "google-maps-script";
export function useGoogleMaps() {
    const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && !!window.google);
    useEffect(() => {
        if (window.google) {
            setLoaded(true);
            return;
        }
        if (document.getElementById(SCRIPT_ID)) {
            // Script tag exists but not yet loaded — wait for it
            const existing = document.getElementById(SCRIPT_ID);
            existing.addEventListener("load", () => setLoaded(true));
            return;
        }
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);
    }, []);
    return loaded;
}
