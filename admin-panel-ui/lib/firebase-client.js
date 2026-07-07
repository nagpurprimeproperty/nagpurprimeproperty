"use client"

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
function getFirebaseConfig() {
    const requiredKeys = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
    ];
    const missing = requiredKeys.filter((k) => !process.env[k]);
    if (missing.length > 0) {
        console.warn(`Missing Firebase config: ${missing.join(", ")}`);
        return null;
    }
    
    return {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
}

let messaging = null;
let initAttempted = false;

export function initFirebaseClient() {
    // Lazy initialization - only initialize when config is available
    if (messaging === null && !initAttempted) {
        initAttempted = true;
        
        if (typeof window === "undefined") {
            messaging = null;
        } else {
            const firebaseConfig = getFirebaseConfig();
            if (!firebaseConfig) {
                console.warn("Firebase config not available, skipping initialization");
                return null;
            }
            
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            try {
                messaging = getMessaging(app);
            } catch (err) {
                console.error("initFirebaseClient: getMessaging failed", err);
                messaging = null;
            }
        }
    }
    
    return messaging;
}

export async function requestFcmToken() {
    try {
        const msg = initFirebaseClient();
        if (!msg)
            return null;
        const reg = await navigator.serviceWorker?.ready;
        if (!reg) {
            console.warn("No service worker registration available for FCM");
            return null;
        }
        const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
            serviceWorkerRegistration: reg,
        });
        return token || null;
    }
    catch (err) {
        console.error("FCM token error:", err);
        return null;
    }
}
export function onForegroundMessage(handler) {
    const msg = initFirebaseClient();
    if (!msg)
        return () => { };
    return onMessage(msg, handler);
}
