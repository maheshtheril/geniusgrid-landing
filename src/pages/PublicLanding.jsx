import { useEffect, useMemo, useState, lazy, Suspense, useRef } from "react";

// ---------- Config ----------
const BRAND = "GeniusGrid";
const LOGO_SRC = "/images/geniusgrid-logo.png"; // optional; falls back to SVG mark
const API_BASE = import.meta.env.VITE_API_URL || "https://geniusgrid-auth-starter.onrender.com";

// ---------- Optional analytics hook ----------
function track(event, props = {}) {
  try {
    if (window.posthog?.capture) return window.posthog.capture(event, props);
    if (window.gtag) return window.gtag("event", event, props);
  } catch {}
}

// ---------- Small atoms ----------
function BrandLogo({ className = "h-16 w-16" }) {
  if (LOGO_SRC) return <img src={LOGO_SRC} width={64} height={64} alt={BRAND} className={className} />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6EE7F9" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#g)" />
      <path d="M7 12h10M7 9h10M7 15h10" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? "ring-2 ring-slate-300 dark:ring-cyan-300/40" : ""}`}
      aria-pressed={!!active}
    >
      {children}
    </button>
  );
}

function PriceCard({ name, m, y, features, billing, highlight = false }) {
  const price = billing === "yearly" ? y : m;
  const per = billing === "yearly" ? "/yr" : "/mo";
  return (
    <div className={`panel p-5 card-animated reveal ${highlight ? "ring-2 ring-slate-200 dark:ring-cyan-300/30" : ""}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="text-3xl font-extrabold">
          ₹{price.toLocaleString("en-IN")}<span className="ml-1 text-sm text-slate-500">{per}</span>
        </div>
      </div>
      <ul className="mt-3 text-sm space-y-1">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <a
        href="#start"
        className="btn-primary btn-shine mt-4"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#start")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Get {name}
      </a>
    </div>
  );
}

function AppCard({ app, onStartFree, selectable, selected, onToggle }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="panel p-4 card-animated reveal">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {app.icon || "🧩"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{app.name}</h3>
            {app.paid ? <span className="badge-purple">Paid</span> : <span className="badge-muted">Free</span>}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300/90 mt-0.5">{app.desc}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(app.tags || []).map((t) => (
              <span key={t} className="badge-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a href="#learn-more" className="btn-ghost">
          Learn more
        </a>
        <button
          type="button"
          onClick={() => {
            setBusy(true);
            setTimeout(() => setBusy(false), 800);
          }}
          className="btn-ghost"
          disabled={busy}
          aria-disabled={busy}
          aria-busy={busy}
        >
          {busy ? "Launching…" : "Try demo"}
        </button>

        {selectable && (
          <button
            type="button"
            onClick={() => onToggle?.(app.id)}
            className={`btn-ghost ${selected ? "ring-2 ring-slate-200 dark:ring-cyan-300/40" : ""}`}
            aria-pressed={selected}
            title={selected ? "Remove from selection" : "Add to selection"}
          >
            {selected ? "✓ Selected" : "Add"}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            track("start_free_module", { module: app.id });
            onStartFree?.([app.id]);
          }}
          className="btn-primary btn-shine"
        >
          Start free
        </button>

        <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">v{app.version || "1.0.0"}</div>
      </div>
    </div>
  );
}

// ---------- Effects ----------
function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("show");
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ---------- Lazy hero (perf) ----------
const HeroScreens = lazy(() => import("../components/HeroScreens.jsx"));

// ---------- Accessible mobile menu with focus trap ----------
function useMobileMenu(aOpen, close) {
  const menuRef = useRef(null);
  useEffect(() => {
    if (!aOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      menuRef.current?.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const fs = focusables();
      if (!fs || fs.length === 0) return;
      const first = fs[0];
      const last = fs[fs.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const t = setTimeout(() => {
      const fs = focusables();
      fs?.[0]?.focus();
    }, 10);

    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [aOpen, close]);
  return menuRef;
}

// ---------- Page ----------
export default function PublicLanding() {
  useRevealOnScroll();

  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useMobileMenu(menuOpen, () => setMenuOpen(false));

  const [billing, setBilling] = useState("monthly");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [price, setPrice] = useState("all");

  const [selected, setSelected] = useState(() => new Set());
  const [apiModules, setApiModules] = useState({ loading: true, list: [], error: null });

  // Scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled(y > 6);
      setShowTop(y > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Preconnect to API for faster first fetch
  useEffect(() => {
    try {
      const u = new URL(API_BASE);
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = `${u.protocol}//${u.host}`;
      document.head.appendChild(link);
      return () => document.head.removeChild(link);
    } catch {}
  }, []);

  // Fetch modules (versioned endpoint) and normalize
  useEffect(() => {
    const ctrl = new AbortController();
    const url = `${API_BASE}/api/public/v1/modules`;
    fetch(url, { credentials: "omit", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid payload");
        const normalized = data.map((m) => ({
          id: m.id || m.code,
          name: m.name,
          cat: m.category || m.cat || "other",
          icon: m.icon,
          desc: m.description || m.desc || "",
          tags: Array.isArray(m.tags) ? m.tags : (m.tags ? String(m.tags).split(",") : []),
          paid: !!(m.paid ?? m.is_paid),
          version: m.version || "1.0.0",
          popularity: m.popularity ?? 50,
          updatedAt: m.updatedAt || m.updated_at || new Date().toISOString().slice(0, 10),
        }));
        setApiModules({ loading: false, list: normalized, error: null });
      })
      .catch((err) => {
        console.warn("modules fetch failed → fallback", err?.message || err);
        setApiModules({ loading: false, list: [], error: err?.message || "fetch-failed" });
      });
    return () => ctrl.abort();
  }, []);

  // Fallback APPS if API is empty/failed
  const fallbackAPPS = useMemo(
    () => [
      {
        id: "crm",
        name: "CRM",
        cat: "sales",
        icon: "🤝",
        desc: "Leads & pipeline",
        tags: ["Leads", "Pipeline", "AI"],
        paid: false,
        version: "2.4.0",
        popularity: 99,
        updatedAt: "2025-08-01",
      },
      {
        id: "accounting",
        name: "Accounting",
        cat: "finance",
        icon: "📚",
        desc: "Invoicing & ledger",
        tags: ["GST", "Reports"],
        paid: true,
        version: "4.2.0",
        popularity: 96,
        updatedAt: "2025-07-30",
      },
      {
        id: "inventory",
        name: "Inventory",
        cat: "ops",
        icon: "📦",
        desc: "Stock & warehouses",
        tags: ["WMS", "Barcode"],
        paid: true,
        version: "3.1.0",
        popularity: 90,
        updatedAt: "2025-06-29",
      },
    ],
    []
  );

  const APPS = apiModules.list.length ? apiModules.list : fallbackAPPS;

  // Categories
  const CATEGORIES = [
    { key: "all", label: "All" },
    { key: "sales", label: "Sales" },
    { key: "website", label: "Website" },
    { key: "marketing", label: "Marketing" },
    { key: "finance", label: "Finance" },
    { key: "ops", label: "Operations" },
    { key: "people", label: "People" },
    { key: "support", label: "Support" },
    { key: "platform", label: "Platform" },
    { key: "other", label: "Other" },
  ];

  // Filtering
  const filtered = useMemo(() => {
    let list = [...APPS];
    if (cat !== "all") list = list.filter((a) => a.cat === cat);
    if (price !== "all") list = list.filter((a) => (price === "free" ? !a.paid : a.paid));
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.desc.toLowerCase().includes(s) ||
          a.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }
    if (sort === "popular") list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") list.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return list;
  }, [APPS, q, cat, sort, price]);

  // Helpers
  const goTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    window.history.pushState(null, "", hash);
    el.setAttribute("tabindex", "-1");
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      el.focus({ preventScroll: true });
      el.removeAttribute("tabindex");
    }, 250);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const startSignup = (ids) => {
    const chosen = ids && ids.length ? ids : Array.from(selected);
    if (!chosen.length) {
      goTo("#apps");
      return;
    }
    const mods = encodeURIComponent(chosen.join(","));
    track("start_free", { modules_count: chosen.length, modules: chosen });
    try {
      sessionStorage.setItem("selectedModules", JSON.stringify(chosen));
    } catch {}
    window.location.href = `${API_BASE}/api/public/start-signup?modules=${mods}&plan=free`;
  };

  // If coming back from signup “Add modules”, jump to apps
  useEffect(() => {
    if (sessionStorage.getItem("returnToModules") === "1") {
      sessionStorage.removeItem("returnToModules");
      setTimeout(() => goTo("#apps"), 50);
    }
  }, []);

  const logoRow = ["Asteria", "NovaTech", "BluePeak", "Zenlytics", "Quanta", "Skylark", "Vertex", "Nimbus"];

  return (
    <div className="relative min-h-screen">
      {/* Skip link */}
      <a
        href="#apps"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to Apps
      </a>

      {/* Decorative background */}
      <div className="bg-blob" />

      {/* NAV */}
      <header
        className={`sticky top-0 z-30 backdrop-blur ${
          scrolled ? "shadow-sm border-slate-200 dark:border-slate-700" : "border-transparent"
        } border-b bg-white/70 dark:bg-slate-950/70`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-3"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <BrandLogo />
            <span className="brand-name text-lg font-extrabold tracking-tight">{BRAND}</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3" aria-label="Primary">
            <a
              className="chip"
              href="#apps"
              onClick={(e) => {
                e.preventDefault();
                goTo("#apps");
              }}
            >
              Apps
            </a>
            <a
              className="chip"
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                goTo("#features");
              }}
            >
              Features
            </a>
            <a
              className="chip"
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                goTo("#pricing");
              }}
            >
              Pricing
            </a>
            <button type="button" className="btn-primary btn-shine" onClick={() => goTo("#apps")}>
              Start free{selected.size ? ` (${selected.size})` : ""}
            </button>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            className="md:hidden text-2xl px-2 py-1 rounded-lg"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden bg-black/40" onClick={() => setMenuOpen(false)} />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            ref={menuRef}
            className="fixed inset-x-0 top-16 z-50 md:hidden panel p-4 border-t border-slate-200 dark:border-slate-700"
          >
            <nav className="grid gap-3" aria-label="Mobile">
              <button type="button" className="chip text-left" onClick={() => (setMenuOpen(false), goTo("#apps"))}>
                Apps
              </button>
              <button type="button" className="chip text-left" onClick={() => (setMenuOpen(false), goTo("#features"))}>
                Features
              </button>
              <button type="button" className="chip text-left" onClick={() => (setMenuOpen(false), goTo("#pricing"))}>
                Pricing
              </button>
              <button type="button" className="btn-primary btn-shine" onClick={() => (setMenuOpen(false), goTo("#apps"))}>
                Start free{selected.size ? ` (${selected.size})` : ""}
              </button>
            </nav>
          </div>
        </>
      )}

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 pt-14 pb-8 grid md:grid-cols-2 gap-8 items-center">
        <div className="reveal">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Run your business on one AI-native platform.</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl">
            {BRAND} brings Sales, Website, Finance, Ops, People, Support, and a no-code Studio together. Built for speed,
            security, and scale.
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-primary btn-shine" onClick={() => goTo("#apps")}>
              Start free{selected.size ? ` (${selected.size})` : ""}
            </button>
            <button type="button" className="btn-ghost" onClick={() => goTo("#apps")}>
              Browse apps
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">No credit card. Cancel anytime.</p>
        </div>

        <div className="reveal">
          <Suspense fallback={<div className="panel p-6">Loading…</div>}>
            <HeroScreens />
          </Suspense>
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section aria-label="Trusted by" className="py-6 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-5">
          <div className="marquee">
            <div className="marquee-track">
              {logoRow.map((n) => (
                <div key={n} className="text-slate-500 dark:text-slate-300 whitespace-nowrap">
                  {n}
                </div>
              ))}
              {logoRow.map((n) => (
                <div key={`${n}-2`} className="text-slate-500 dark:text-slate-300 whitespace-nowrap">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section id="apps" className="scroll-mt-24 max-w-7xl mx-auto px-5 py-10">
        <div className="text-center mb-6 reveal">
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">Apps</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">Pick the apps you need</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Install one or all — they work better together.</p>
        </div>

        {/* Filters */}
        <div className="grid gap-3 mb-4">
          <div className="flex flex-wrap gap-2 justify-center reveal">
            {CATEGORIES.map((c) => (
              <CategoryPill key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
                {c.label}
              </CategoryPill>
            ))}
          </div>

          <div className="panel p-3 grid gap-3 md:grid-cols-[1fr_auto_auto] items-center reveal">
            <div className="relative">
              <input
                className="w-full px-10 py-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-cyan-300/40"
                placeholder="Search apps…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search apps"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            </div>

            <select
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-label="Price filter"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            <select
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort apps"
            >
              <option value="popular">Popular</option>
              <option value="az">A–Z</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Apps grid */}
        {apiModules.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel p-4 animate-pulse">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="mt-2 h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="mt-6 h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                selectable
                selected={selected.has(app.id)}
                onToggle={toggleSelect}
                onStartFree={(ids) => startSignup(ids)}
              />
            ))}
          </div>
        ) : (
          <div className="panel p-6 text-center">
            <div className="text-lg font-semibold mb-2">No apps match your filters</div>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Try clearing search or switching category/price.
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQ("");
                setCat("all");
                setPrice("all");
                setSort("popular");
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Bulk start free */}
        <div className="flex justify-center mt-5">
          <button
            type="button"
            className="btn-primary btn-shine"
            onClick={() => startSignup()}
            disabled={selected.size === 0}
            title={selected.size === 0 ? "Select one or more apps above" : "Continue to signup"}
          >
            Start free{selected.size ? ` (${selected.size})` : ""}
          </button>
        </div>

        {/* API error hint */}
        {apiModules.error && apiModules.list.length === 0 && (
          <div className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">
            Couldn’t reach modules API (using fallback). Check CORS/URL: <code>{API_BASE}/api/public/v1/modules</code>
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 max-w-7xl mx-auto px-5 py-12">
        <div className="text-center mb-6 reveal">
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">
            Why {BRAND}
          </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">Fast. Secure. AI-smart.</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">From first click to scale-up, it just works.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["🤖", "AI where it matters", "Lead scoring, summaries, and next actions that actually help."],
            ["🔐", "Enterprise-grade security", "SSO/SAML, audit trail, and fine-grained permissions."],
            ["⚡", "Lightning performance", "Vite + React + optimized APIs for instant responses."],
            ["🧩", "Modular by design", "Turn on only the apps you need; add more anytime."],
            ["📊", "Built-in analytics", "Dashboards, KPIs, CSV/PDF exports, and sharing."],
            ["🌍", "Global-ready", "Multi-company, multi-currency, and localization."],
          ].map(([icon, title, text]) => (
            <div key={title} className="panel p-4 card-animated reveal">
              <div className="text-2xl">{icon}</div>
              <h3 className="font-semibold mt-2">{title}</h3>
              <p className="text-slate-600 dark:text-slate-300/90 text-sm mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 max-w-7xl mx-auto px-5 py-14">
        <div className="text-center mb-6 reveal">
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">Simple pricing for every stage</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Switch billing anytime.</p>
        </div>

        <div className="flex justify-center gap-2 mb-6 reveal">
          <div className="panel p-1 inline-flex gap-1">
            {["monthly", "yearly"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setBilling(v)}
                className={`px-3 py-1.5 rounded-lg ${billing === v ? "btn-primary" : "btn-ghost"}`}
              >
                {v === "monthly" ? "Monthly" : "Yearly (save ~16%)"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PriceCard name="Starter" m={999} y={9990} billing={billing} features={["Up to 5 users", "CRM + Website", "Email support"]} />
          <PriceCard name="Growth" m={2999} y={29990} billing={billing} highlight features={["Up to 25 users", "AI scoring + analytics", "Priority support"]} />
          <PriceCard name="Enterprise" m={7999} y={79990} billing={billing} features={["Unlimited users", "SSO + Audit logs", "Dedicated manager"]} />
        </div>
      </section>

      {/* CTA stripe */}
      <section
        id="start"
        className="scroll-mt-24 text-center py-12 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-slate-700 dark:from-cyan-300/10 dark:to-purple-500/10"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold reveal">Ready to get started?</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1 reveal">Start free today — no credit card required.</p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <button type="button" className="btn-primary btn-shine" onClick={() => startSignup()}>
            Start free{selected.size ? ` (${selected.size})` : ""}
          </button>
          <button type="button" className="btn-ghost" onClick={() => goTo("#apps")}>
            Pick apps
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="scroll-mt-24 border-t border-slate-200 py-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400"
      >
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Genius Infravision — All rights reserved.</div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                window.alert("Privacy coming soon");
              }}
            >
              Privacy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                window.alert("Terms coming soon");
              }}
            >
              Terms
            </a>
            <a
              href="#security"
              onClick={(e) => {
                e.preventDefault();
                window.alert("Security coming soon");
              }}
            >
              Security
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 right-5 z-30 rounded-full px-4 py-3 shadow-lg border bg-slate-900 text-white border-slate-800 dark:bg-cyan-400 dark:text-slate-900 dark:border-cyan-300 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-cyan-300/40"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}
