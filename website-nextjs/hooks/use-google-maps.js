// hooks/use-google-maps.js
import { useEffect, useState } from "react";

const SCRIPT_ID = "google-maps-script";

export function useGoogleMaps() {
    const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && !!window.google);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (window.google) {
            setLoaded(true);
            return;
        }

        const existing = document.getElementById(SCRIPT_ID);
        if (existing) {
            // Script tag exists but not yet loaded — wait for it
            const handleLoad = () => setLoaded(true);
            existing.addEventListener("load", handleLoad);
            return () => {
                existing.removeEventListener("load", handleLoad);
            };
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
        if (!apiKey) {
            console.warn("⚠️ NEXT_PUBLIC_GOOGLE_MAPS_KEY is not defined in environment variables");
            return;
        }

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);
    }, []);

    return loaded;
}
