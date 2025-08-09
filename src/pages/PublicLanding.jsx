/* 🔧 build marker (for Render verification) */
if (typeof window !== "undefined") {
  window.__PUBLIC_LANDING_BUILD__ = "PL-0909D";
  console.log("PUBLIC LANDING BUILD =", window.__PUBLIC_LANDING_BUILD__);
}
import { useEffect, useMemo, useState, lazy, Suspense, useRef } from "react";

/**
 * PublicLanding.jsx
 * World‑class, Odoo‑style module picker with polished visuals.
 * - Top bar “Start free” jumps to signup if any modules selected, else scrolls to #apps
 * - Module card uses single Add → ✓ Selected toggle (no checkbox inside the card)
 * - Sticky selection bar shows count + chosen chips + CTA
 * - All previous APIs and fallbacks preserved
 */

// ---------- Config ----------
const BRAND = "GeniusGrid";
const LOGO_SRC = "/images/geniusgrid-logo.png";
const API_BASE =
  import.meta.env.VITE_API_URL || "https://geniusgrid-auth-starter.onrender.com";

// ---------- Optional analytics hook ----------
function track(event, props = {}) {
  try {
    if (window.posthog?.capture) return window.posthog.capture(event, props);
    if (window.gtag) return window.gtag("event", event, props);
  } catch {}
}

// ---------- UI Primitives ----------
function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold leading-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };
  const variants = {
    primary:
      "bg-indigo-600 text-white shadow-sm hover:shadow-md hover:bg-indigo-700 active:bg-indigo-800",
    ghost:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
    quiet:
      "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function BrandLogo({ className = "h-16 w-16" }) {
  if (LOGO_SRC)
    return <img src={LOGO_SRC} width={64} height={64} alt={BRAND} className={className} />;
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
    <div
      className={`panel p-5 rounded-2xl card-animated reveal ${
        highlight ? "ring-2 ring-slate-200 dark:ring-cyan-300/30" : ""
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="text-3xl font-extrabold">
          ₹{Number(price || 0).toLocaleString("en-IN")}
          <span className="ml-1 text-sm text-slate-500">{per}</span>
        </div>
      </div>
      <ul className="mt-3 text-sm space-y-1">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <Button
        className="mt-4"
        onClick={() => document.querySelector("#start")?.scrollIntoView({ behavior: "smooth" })}
      >
        Get {name}
      </Button>
    </div>
  );
}

// ---------- Theme (Light ↔ Dark only) ----------
function useTheme() {
  const getInitial = () => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="md"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? "🌙" : "☀️"}
    </Button>
  );
}

// ---------- Effects ----------
function useRevealOnScroll(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("show");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const observeNow = (root = document) => {
      root.querySelectorAll(".reveal:not(.show)").forEach((el) => io.observe(el));
    };

    observeNow();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          if (n.matches?.(".reveal:not(.show)")) io.observe(n);
          n.querySelectorAll?.(".reveal:not(.show)").forEach((el) => io.observe(el));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, deps);
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
      menuRef.current?.querySelectorAll(
        'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
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

// ---------- Helpers: category + tag sanitize ----------
const CATEGORY_MAP = {
  sales: "sales",
  crm: "sales",
  website: "website",
  site: "website",
  marketing: "marketing",
  mkt: "marketing",
  finance: "finance",
  accounting: "finance",
  ops: "ops",
  inventory: "ops",
  people: "people",
  hr: "people",
  support: "support",
  helpdesk: "support",
  platform: "platform",
};
function normalizeCategory(raw) {
  const k = String(raw || "").toLowerCase().trim();
  return CATEGORY_MAP[k] || "other";
}
function toStrArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x.map((v) => String(v ?? "").trim()).filter(Boolean);
  return String(x)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// ---------- Card ----------
function AppCard({ app, selected, onToggle, onLearnMore }) {
  return (
    <article
      className="group relative rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden reveal"
      aria-label={`${app.name || "App"} card`}
    >
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(600px_300px_at_0%_-10%,black,transparent)] bg-[linear-gradient(120deg,rgba(99,102,241,0.10),transparent_30%),linear-gradient(240deg,rgba(34,211,238,0.10),transparent_30%)]" />

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-full border bg-white/70 backdrop-blur text-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-700">
          {app.cat || "other"}
        </span>
        <span className="px-2 py-0.5 rounded-full border bg-white/70 backdrop-blur text-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-700">
          v{app.version || "1.0.0"}
        </span>
      </div>

      <div className="p-4 sm:p-5 relative z-0">
        <div className="flex items-start gap-3">
          <div
            className="h-12 w-12 rounded-xl grid place-items-center text-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] group-hover:shadow-md transition-shadow"
            aria-hidden
          >
            {app.icon || "🧩"}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              {app.name || "Untitled"}
            </h3>
            {app.desc && (
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300/90 line-clamp-2">
                {app.desc}
              </p>
            )}
            {!!(app.tags && app.tags.length) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {app.tags.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-lg text-[11px] border border-slate-200 text-slate-600 bg-white/70 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-900/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="ghost" onClick={() => onLearnMore?.(app)}>
            Learn more
          </Button>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              app.paid
                ? "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-400/20"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20"
            }`}
          >
            {app.paid ? "Paid" : "Free"}
          </span>
          <Button
            className="ml-auto"
            aria-pressed={selected ? "true" : "false"}
            onClick={() => onToggle?.(app.id)}
          >
            {selected ? "✓ Selected" : "Add"}
          </Button>
        </div>
      </div>

      <div
        className={`absolute inset-0 rounded-2xl pointer-events-none transition-all ${
          selected ? "ring-2 ring-indigo-400/70 dark:ring-cyan-300/50" : "ring-0"
        }`}
      />
    </article>
  );
}

// ---------- Sticky Selection Bar ----------
function SelectionBar({ selectedIds, onRemove, onStart, allApps }) {
  if (!selectedIds.size) return null;
  const chosen = allApps.filter((a) => selectedIds.has(a.id));
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-5xl w-[94%] sm:w-auto">
      <div className="panel border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-lg backdrop-blur bg-white/80 dark:bg-slate-900/80 p-3 sm:p-4 flex items-center gap-3">
        <div className="text-sm font-semibold whitespace-nowrap">
          {selectedIds.size} selected
        </div>
        <div className="hidden sm:flex flex-wrap gap-2 max-w-[52ch]">
          {chosen.slice(0, 6).map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border bg-white/70 dark:bg-slate-800/70"
            >
              {a.name}
              <button
                className="opacity-70 hover:opacity-100"
                aria-label={`Remove ${a.name}`}
                onClick={() => onRemove?.(a.id)}
              >
                ×
              </button>
            </span>
          ))}
          {selectedIds.size > 6 && (
            <span className="text-xs text-slate-500">
              +{selectedIds.size - 6} more
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Review
          </Button>
          <Button onClick={onStart}>Continue to signup</Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function PublicLanding() {
  useRevealOnScroll([]);

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

  // Preconnect to API
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

  // Fetch modules
  useEffect(() => {
    let cancelled = false;

    const normalize = (data) => {
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.modules)
        ? data.modules
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      return arr.map((m, idx) => {
        const name = m?.name || m?.title || m?.code || `App ${idx + 1}`;
        const id =
          m?.id ||
          m?.code ||
          name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        return {
          id,
          name,
          cat: normalizeCategory(m?.category ?? m?.cat),
          icon: m?.icon || "🧩",
          desc: m?.description || m?.desc || "",
          tags: toStrArray(m?.tags),
          paid: !!(m?.paid ?? m?.is_paid),
          version: m?.version || "1.0.0",
          popularity: Number(m?.popularity ?? 50) || 0,
          updatedAt:
            m?.updatedAt || m?.updated_at || new Date().toISOString().slice(0, 10),
        };
      });
    };

    const url = `${API_BASE}/api/public/v1/modules`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort("timeout"), 10000);

    (async () => {
      try {
        console.log("modules: fetching", url);
        const r = await fetch(url, {
          signal: ctrl.signal,
          credentials: "omit",
          headers: { Accept: "application/json" },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error("invalid-json");
        }
        const list = normalize(json);
        console.log("modules: received", list.length, "items");
        if (!cancelled) setApiModules({ loading: false, list, error: null });
      } catch (e) {
        console.warn("modules: fetch failed", e?.message || e);
        if (!cancelled)
          setApiModules({
            loading: false,
            list: [],
            error: e?.message || "fetch-failed",
          });
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      ctrl.abort("cleanup");
    };
  }, []);

  // Fallback APPS
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

  // Filtered list (guards)
  const filtered = useMemo(() => {
    let list = [...APPS];

    if (cat !== "all") list = list.filter((a) => (a?.cat || "other") === cat);
    if (price !== "all") list = list.filter((a) => (price === "free" ? !a?.paid : !!a?.paid));

    if (q && q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((a) => {
        const name = String(a?.name || "").toLowerCase();
        const desc = String(a?.desc || "").toLowerCase();
        const tags = Array.isArray(a?.tags) ? a.tags : [];
        const tagHit = tags.some((t) => String(t || "").toLowerCase().includes(s));
        return name.includes(s) || desc.includes(s) || tagHit;
      });
    }

    if (sort === "popular")
      list.sort((a, b) => Number(b?.popularity || 0) - Number(a?.popularity || 0));
    if (sort === "az")
      list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    if (sort === "newest")
      list.sort((a, b) => Date.parse(b?.updatedAt || 0) - Date.parse(a?.updatedAt || 0));

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
      try {
        sessionStorage.setItem("selectedModules", JSON.stringify(Array.from(n)));
      } catch {}
      return n;
    });

  const removeSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      try {
        sessionStorage.setItem("selectedModules", JSON.stringify(Array.from(n)));
      } catch {}
      return n;
    });

  const startSignup = () => {
    const chosen = Array.from(selected);
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

  // Restore selection if coming back from signup "Add modules"
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("selectedModules") || "[]");
      if (Array.isArray(saved) && saved.length) setSelected(new Set(saved));
    } catch {}
    if (sessionStorage.getItem("returnToModules") === "1") {
      sessionStorage.removeItem("returnToModules");
      setTimeout(() => goTo("#apps"), 50);
    }
  }, []);

  const logoRow = [
    "Asteria",
    "NovaTech",
    "BluePeak",
    "Zenlytics",
    "Quanta",
    "Skylark",
    "Vertex",
    "Nimbus",
  ];

  const debug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

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
            <a className="chip" href="#apps" onClick={(e) => (e.preventDefault(), goTo("#apps"))}>
              Apps
            </a>
            <a
              className="chip"
              href="#features"
              onClick={(e) => (e.preventDefault(), goTo("#features"))}
            >
              Features
            </a>
            <a
              className="chip"
              href="#pricing"
              onClick={(e) => (e.preventDefault(), goTo("#pricing"))}
            >
              Pricing
            </a>

            <ThemeToggleButton />

            {/* IMPORTANT: if selected > 0 go straight to signup */}
            <Button onClick={() => (selected.size ? startSignup() : goTo("#apps"))}>
              Start free{selected.size ? ` (${selected.size})` : ""}
            </Button>
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
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            ref={menuRef}
            className="fixed inset-x-0 top-16 z-50 md:hidden panel p-4 border-t border-slate-200 dark:border-slate-700"
          >
            <nav className="grid gap-3" aria-label="Mobile">
              <button
                type="button"
                className="chip text-left"
                onClick={() => (setMenuOpen(false), goTo("#apps"))}
              >
                Apps
              </button>
              <button
                type="button"
                className="chip text-left"
                onClick={() => (setMenuOpen(false), goTo("#features"))}
              >
                Features
              </button>
              <button
                type="button"
                className="chip text-left"
                onClick={() => (setMenuOpen(false), goTo("#pricing"))}
              >
                Pricing
              </button>

              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-sm text-slate-600 dark:text-slate-300">Theme</span>
                <ThemeToggleButton />
              </div>

              <Button onClick={() => (setMenuOpen(false), selected.size ? startSignup() : goTo("#apps"))}>
                Start free{selected.size ? ` (${selected.size})` : ""}
              </Button>
            </nav>
          </div>
        </>
      )}

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 pt-14 pb-8 grid md:grid-cols-2 gap-8 items-center">
        <div className="reveal">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Run your business on one AI-native platform.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl">
            {BRAND} brings Sales, Website, Finance, Ops, People, Support, and a no-code Studio
            together. Built for speed, security, and scale.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => (selected.size ? startSignup() : goTo("#apps"))}>
              Start free{selected.size ? ` (${selected.size})` : ""}
            </Button>
            <Button variant="ghost" onClick={() => goTo("#apps")}>
              Browse apps
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            No credit card. Cancel anytime.
          </p>
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
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">
            Apps
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">Pick the apps you need</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Install one or all — they work better together.
          </p>
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

          <div className="panel p-3 md:p-4 grid gap-3 md:grid-cols-[1fr_auto_auto] items-center reveal rounded-2xl">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel p-4 animate-pulse rounded-2xl">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="mt-2 h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="mt-6 h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                selected={selected.has(app.id)}
                onToggle={toggleSelect}
                onLearnMore={(a) => window.alert(`More about ${a.name} coming soon`)}
              />
            ))}
          </div>
        ) : (
          <div className="panel p-6 text-center rounded-2xl">
            <div className="text-lg font-semibold mb-2">No apps match your filters</div>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Try clearing search or switching category/price.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setCat("all");
                setPrice("all");
                setSort("popular");
              }}
            >
              Reset filters
            </Button>
          </div>
        )}

        {/* Bulk start free */}
        <div className="flex justify-center mt-5">
          <Button
            onClick={() => startSignup()}
            disabled={selected.size === 0}
            title={selected.size === 0 ? "Select one or more apps above" : "Continue to signup"}
          >
            Start free{selected.size ? ` (${selected.size})` : ""}
          </Button>
        </div>

        {/* API error hint */}
        {apiModules.error && apiModules.list.length === 0 && (
          <div className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">
            Couldn’t reach modules API (using fallback). Check CORS/URL:{" "}
            <code>{API_BASE}/api/public/v1/modules</code>
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
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            From first click to scale-up, it just works.
          </p>
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
            <div key={title} className="panel p-4 card-animated reveal rounded-2xl">
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
          <div className="panel p-1 inline-flex gap-1 rounded-2xl">
            {["monthly", "yearly"].map((v) => (
              <Button
                key={v}
                variant={billing === v ? "primary" : "ghost"}
                onClick={() => setBilling(v)}
              >
                {v === "monthly" ? "Monthly" : "Yearly (save ~16%)"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PriceCard
            name="Starter"
            m={999}
            y={9990}
            billing={billing}
            features={["Up to 5 users", "CRM + Website", "Email support"]}
          />
          <PriceCard
            name="Growth"
            m={2999}
            y={29990}
            billing={billing}
            highlight
            features={["Up to 25 users", "AI scoring + analytics", "Priority support"]}
          />
          <PriceCard
            name="Enterprise"
            m={7999}
            y={79990}
            billing={billing}
            features={["Unlimited users", "SSO + Audit logs", "Dedicated manager"]}
          />
        </div>
      </section>

      {/* CTA stripe */}
      <section
        id="start"
        className="scroll-mt-24 text-center py-12 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-slate-700 dark:from-cyan-300/10 dark:to-purple-500/10"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold reveal">Ready to get started?</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1 reveal">
          Start free today — no credit card required.
        </p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <Button onClick={() => (selected.size ? startSignup() : goTo("#apps"))}>
            Start free{selected.size ? ` (${selected.size})` : ""}
          </Button>
          <Button variant="ghost" onClick={() => goTo("#apps")}>
            Pick apps
          </Button>
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
              onClick={(e) => (e.preventDefault(), window.alert("Privacy coming soon"))}
            >
              Privacy
            </a>
            <a
              href="#terms"
              onClick={(e) => (e.preventDefault(), window.alert("Terms coming soon"))}
            >
              Terms
            </a>
            <a
              href="#security"
              onClick={(e) => (e.preventDefault(), window.alert("Security coming soon"))}
            >
              Security
            </a>
            <a
              href="#"
              onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>

      {/* Back to top floater */}
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

      {/* Sticky selection bar */}
      <SelectionBar
        selectedIds={selected}
        onRemove={removeSelect}
        onStart={startSignup}
        allApps={APPS}
      />

      {/* tiny debug overlay */}
      {debug && (
        <div className="fixed bottom-2 left-2 text-xs px-2 py-1 rounded bg-black/70 text-white z-50">
          mods:{APPS.length} filtered:{filtered.length} loading:{String(apiModules.loading)}
        </div>
      )}
    </div>
  );
}
