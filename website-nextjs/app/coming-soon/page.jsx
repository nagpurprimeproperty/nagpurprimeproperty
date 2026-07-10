"use client"

import { useState } from "react";
import Image from "next/image";

import {
  Home, MapPin, Bell, CheckCircle2, Wrench, Search, Building2, Clock,
  Phone, Mail, ArrowRight,
} from "lucide-react";

const features = [
  { icon: Home, title: "Verified Properties", desc: "Explore residential & commercial properties across Nagpur, fully verified." },
  { icon: MapPin, title: "Location Insights", desc: "Find schools, hospitals, malls and nearby amenities at a glance." },
  { icon: Bell, title: "Smart Alerts", desc: "Get instant updates for new listings and market activity." },
];

const progress = [
  { icon: CheckCircle2, label: "UI / UX Design", status: "Done", pct: 100 },
  { icon: Wrench, label: "Platform Development", status: "In progress", pct: 70 },
  { icon: Search, label: "Location Search Integration", status: "In progress", pct: 55 },
  { icon: Building2, label: "Property Listing Management", status: "In progress", pct: 45 },
  { icon: Clock, label: "Launch Preparation", status: "Upcoming", pct: 20 },
];

export default function ComingSoonPage() {
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
        body: JSON.stringify({ email, source: "coming-soon" }),
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

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
      {/* UNDER DEVELOPMENT BANNER */}
      <div className="relative z-50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-center py-2.5 px-4 text-sm font-medium border-b border-amber-200/50 dark:border-amber-900/30">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          This website is currently under development — launching soon. Join the waitlist below.
        </span>
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-display font-bold text-lg">
            <Image
              src="/logo.jpeg"
              alt="Nagpur Prime Property Logo"
              width={36}
              height={36}
              className="rounded-xl object-cover shadow-[var(--shadow-soft)]"
            />
            <span>Nagpur Prime Property</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--muted-foreground)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition">Features</a>
            <a href="#progress" className="hover:text-[var(--foreground)] transition">Progress</a>
            <a href="#notify" className="hover:text-[var(--foreground)] transition">Notify</a>
            <a href="#contact" className="hover:text-[var(--foreground)] transition">Contact</a>
          </nav>
          <a href="#notify" className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition">
            Notify Me <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-glow" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl animate-glow" />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary/40 bg-primary/15 px-5 py-2 text-base font-semibold text-primary backdrop-blur shadow-[var(--shadow-soft)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Launching Soon — Under Development
            </span>
            <h1 className="mt-6 font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
              Discover{" "}
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Prime Properties
              </span>{" "}
              in Nagpur
            </h1>
            <p className="mt-6 text-lg text-[var(--foreground)]/80 max-w-xl leading-relaxed">
              We're building a smarter way for brokers and buyers to explore, compare, and discover premium properties across Nagpur. <strong>Coming soon — join the waitlist.</strong>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#notify" className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition">
                Notify Me <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-7 py-3.5 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition shadow-[var(--shadow-soft)]">
                Contact Us
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <div><span className="font-display text-2xl font-bold text-[var(--foreground)]">500+</span><div>Properties soon</div></div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div><span className="font-display text-2xl font-bold text-[var(--foreground)]">50+</span><div>Trusted brokers</div></div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div><span className="font-display text-2xl font-bold text-[var(--foreground)]">Nagpur</span><div>City-focused</div></div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-up">
            <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-elegant)] border border-[var(--border)]/60">
              <img src="/nagpur-skyline.jpg" alt="Nagpur skyline illustration" className="w-full h-auto" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/40 via-transparent to-transparent" />
            </div>

            {/* Coming Soon Ribbon */}
            <div className="absolute top-6 right-6 z-10 rounded-full bg-[var(--secondary)]/90 backdrop-blur-xl border-2 border-primary/50 px-5 py-2 shadow-[var(--shadow-elegant)] animate-float">
              <span className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Coming Soon
              </span>
            </div>

            {/* Floating property card */}
            <div className="absolute -bottom-8 -left-6 w-64 rounded-2xl bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] p-4 shadow-[var(--shadow-elegant)] animate-float">
              <div className="aspect-video rounded-xl bg-[image:var(--gradient-primary)] opacity-90 mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">Civil Lines Villa</div>
                  <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><MapPin className="h-3 w-3" /> Nagpur</div>
                </div>
                <div className="text-sm font-bold text-primary">₹2.4Cr</div>
              </div>
            </div>

            <div className="absolute -top-6 -right-4 rounded-2xl bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] px-4 py-3 shadow-[var(--shadow-elegant)] animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium">3 new listings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-[image:var(--gradient-warm)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">A smarter property experience</h2>
            <p className="mt-4 text-[var(--muted-foreground)] text-lg">Planned features for launch — everything we're building to help you discover, evaluate and choose your next home or investment in Nagpur.</p>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="group relative rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRESS */}
      <section id="progress" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Behind the scenes</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Building Something Better</h2>
            <p className="mt-4 text-[var(--muted-foreground)] text-lg">We're crafting every detail to deliver Nagpur's most trusted property platform. Here's where we are right now.</p>

            <div className="mt-10 rounded-3xl bg-[var(--secondary)] text-[var(--secondary-foreground)] p-8 shadow-[var(--shadow-elegant)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--secondary-foreground)]/70">Overall Platform Progress</span>
                  <span className="font-display text-3xl font-bold">65%</span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]" style={{ width: "65%" }} />
                </div>
                <p className="mt-4 text-sm text-[var(--secondary-foreground)]/70">Estimated launch — Q3 2026</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {progress.map((p) => (
              <div key={p.label} className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] hover:border-primary/40 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-primary">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{p.status}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{p.pct}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-1000" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTIFY */}
      <section id="notify" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-[image:var(--gradient-primary)] p-10 md:p-16 shadow-[var(--shadow-elegant)]">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-[var(--secondary)]/30 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center text-primary-foreground">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-medium">
                  <Bell className="h-3.5 w-3.5" /> Early Access
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold">Be First to Know</h2>
                <p className="mt-3 text-primary-foreground/90 text-lg">Get notified when Nagpur Prime Property goes live.</p>
              </div>

              <div>
                <form onSubmit={onNotify} className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 p-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading || submitted}
                    className="flex-1 bg-transparent placeholder:text-white/70 text-white px-4 py-3 outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || submitted}
                    className="rounded-xl bg-[var(--secondary)] text-[var(--secondary-foreground)] px-6 py-3 font-semibold hover:bg-[var(--secondary)]/90 transition whitespace-nowrap disabled:opacity-70"
                  >
                    {submitted ? "✓ You're in!" : loading ? "Registering..." : "Notify Me on Launch"}
                  </button>
                </form>
                {errorMsg && (
                  <p className="mt-2 text-sm text-red-200 bg-red-900/40 px-3 py-1.5 rounded-lg border border-red-500/20">{errorMsg}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-[image:var(--gradient-warm)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Get in touch</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Have a question? Reach out.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Location", value: "Nagpur, Maharashtra" },
              { icon: Phone, label: "Phone", value: "+91 9011111504" },
              { icon: Mail, label: "Email", value: "hello@nagpurprimeproperty.com" },
            ].map((c) => (
              <div key={c.label} className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8 text-center shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition" style={{ contentVisibility: "auto" }}>
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
                  <c.icon className="h-7 w-7" />
                </div>
                <div className="mt-5 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">{c.label}</div>
                <div className="mt-1 font-semibold text-lg">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold">
            <Image
              src="/logo.jpeg"
              alt="Nagpur Prime Property Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            Nagpur Prime Property
          </div>
          <div className="text-sm text-[var(--secondary-foreground)]/70 text-center md:text-left">
            © 2026 Nagpur Prime Property. All rights reserved.
            <span className="block md:inline md:ml-2 text-primary/80 font-medium">Currently under development.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
