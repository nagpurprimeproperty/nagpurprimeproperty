"use client"

import { useState } from "react";
import Image from "next/image";

import { Wrench, Calendar, Bell, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Info } from "lucide-react";

// ─── Format date cleanly ──────────────────────────────────────────────────────
function formatLiveDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return date.toLocaleDateString('en-IN', options);
}

export default function MaintenanceClientPage({ settings }) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onNotify = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "maintenance" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setErrorMsg(data.message || "Failed to register. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Something went wrong. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const liveAtFormatted = formatLiveDate(settings.maintenanceLiveAt);

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 flex flex-col justify-between">
            
            {/* TOP HEADER */}
            <header className="border-b border-[var(--border)]/60 bg-[var(--background)]/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display font-bold text-lg">
                        <Image
                            src="/logo.jpeg"
                            alt="Nagpur Prime Property Logo"
                            width={36}
                            height={36}
                            className="rounded-xl object-cover shadow-[var(--shadow-soft)]"
                        />
                        <span>Nagpur Prime Property</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 px-3 py-1.5 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Scheduled Maintenance
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="relative overflow-hidden flex-1 flex items-center py-16">
                <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-glow pointer-events-none" />

                <div className="relative mx-auto max-w-3xl px-6 text-center animate-fade-up">
                    
                    {/* Spin Icon */}
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-500 shadow-[var(--shadow-soft)] mb-8 relative">
                        <Wrench className="h-10 w-10 animate-spin" style={{ animationDuration: '4s' }} />
                        <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                    </div>

                    {/* Title */}
                    <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-tight">
                        {settings.maintenanceTitle || "Under Maintenance"}
                    </h1>
                    
                    <p className="mt-4 text-lg text-[var(--foreground)]/80 max-w-xl mx-auto leading-relaxed">
                        We're currently polishing the engine and updating listings to serve you better. We'll be back online in just a bit.
                    </p>

                    {/* WHAT IS COMING IN THE UPDATE */}
                    {settings.maintenanceDescription && (
                        <div className="mt-10 max-w-xl mx-auto rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 text-left shadow-[var(--shadow-soft)] relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-xl"></div>
                            <h3 className="font-display font-semibold text-base flex items-center gap-2 text-primary">
                                <Info className="h-4.5 w-4.5" />
                                What's coming in this update:
                            </h3>
                            <p className="mt-2 text-sm text-[var(--foreground)]/85 leading-relaxed whitespace-pre-wrap">
                                {settings.maintenanceDescription}
                            </p>
                        </div>
                    )}

                    {/* EXPECTED LIVE TIME */}
                    {liveAtFormatted && (
                        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Estimated completion: <strong>{liveAtFormatted}</strong></span>
                        </div>
                    )}

                    {/* NOTIFY WAITING FORM */}
                    <div className="mt-12 max-w-md mx-auto">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Get notified when we go live:</h4>
                        <form onSubmit={onNotify} className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-2.5 flex flex-col sm:flex-row gap-2 shadow-[var(--shadow-soft)] focus-within:border-primary/50 transition">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                disabled={loading || submitted}
                                className="flex-1 bg-transparent px-4 py-3 outline-none text-sm disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || submitted}
                                className="rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground px-5 py-3 font-semibold text-sm hover:opacity-95 transition whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-75"
                            >
                                {submitted ? "✓ Registered" : loading ? "Loading..." : <><Bell className="h-4 w-4" /> Notify Me</>}
                            </button>
                        </form>
                        
                        {submitted && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1 justify-center">
                                <ShieldCheck className="h-3.5 w-3.5" /> Thank you! We will email you the moment the platform goes live.
                            </p>
                        )}

                        {errorMsg && (
                            <p className="mt-2 text-xs text-destructive">{errorMsg}</p>
                        )}
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]/80">
                <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                    <div>
                        © 2026 Nagpur Prime Property. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-amber-500 font-medium">Currently undergoing maintenance</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
