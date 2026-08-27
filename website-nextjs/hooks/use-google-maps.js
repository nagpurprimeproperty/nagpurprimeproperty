// hooks/use-google-maps.js
import { useEffect, useState } from "react";

const SCRIPT_ID = "google-maps-script";
let cachedKey = null;
let fetchPromise = null;

async function getApiKey() {
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
        return process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    }
    if (cachedKey) {
        return cachedKey;
    }
    if (fetchPromise) {
        return fetchPromise;
    }

    fetchPromise = (async () => {
        try {
            const res = await fetch("/api/maps/key");
            if (res.ok) {
                const data = await res.json();
                cachedKey = data.key || (data.data && data.data.key) || "";
                return cachedKey;
            }
        } catch (err) {
            console.error("Failed to fetch map key from server endpoint:", err);
        }
        return "";
    })();

    return fetchPromise;
}

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
            // Script tag exists — check if already loaded, otherwise wait for it
            if (window.google) {
                setLoaded(true);
                return;
            }
            const handleLoad = () => setLoaded(true);
            existing.addEventListener("load", handleLoad);
            return () => {
                existing.removeEventListener("load", handleLoad);
            };
        }

        let isMounted = true;

        getApiKey().then((apiKey) => {
            if (!isMounted) return;

            if (!apiKey) {
                console.warn("⚠️ NEXT_PUBLIC_GOOGLE_MAPS_KEY is not defined in environment variables or runtime server config");
                return;
            }

            if (window.google) {
                setLoaded(true);
                return;
            }

            const existingScript = document.getElementById(SCRIPT_ID);
            if (existingScript) {
                // Another hook instance created the script while we were fetching the key
                // Add a load listener to track when it finishes loading
                const handleLoad = () => {
                    if (isMounted) setLoaded(true);
                };
                existingScript.addEventListener("load", handleLoad);
                // Also check if it already loaded between our check and adding the listener
                if (window.google) {
                    setLoaded(true);
                    existingScript.removeEventListener("load", handleLoad);
                }
                return;
            }

            const script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
            script.async = true;
            script.onload = () => {
                if (isMounted) setLoaded(true);
            };
            script.onerror = (err) => {
                console.error("Failed to load Google Maps SDK script:", err);
            };
            document.head.appendChild(script);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    return loaded;
}

