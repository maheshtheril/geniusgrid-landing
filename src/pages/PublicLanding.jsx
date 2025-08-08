import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import HeroScreens from "../components/HeroScreens.jsx";

/** ---------- Brand config (edit these) ---------- */
const BRAND = "GeniusGrid";
const LOGO_SRC = "/images/geniusgrid-logo.png";

/** ---------- Small helpers ---------- */
function BrandLogo({ className = "h-16 w-16" }) {
  if (LOGO_SRC) return <img src={LOGO_SRC} alt={BRAND} className={className} />;
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
      onClick={onClick}
      className={`chip ${active ? "ring-2 ring-slate-300 dark:ring-cyan-300/40" : ""}`}
    >
      {children}
    </button>
  );
}

function AppCard({ app }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="panel p-4 card-animated reveal">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {app.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{app.name}</h3>
            {app.paid ? <span className="badge-purple">Paid</span> : <span className="badge-muted">Free</span>}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300/90 mt-0.5">{app.desc}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {app.tags?.map((t) => (
              <span key={t} className="badge-muted">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a href="#learn-more" className="btn-ghost">Learn more</a>
        <button
          onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1200); }}
          className="btn-primary btn-shine"
          disabled={busy}
        >
          {busy ? "Launching…" : "Try demo"}
        </button>
        <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">v{app.version}</div>
      </div>
    </div>
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
          ₹{price.toLocaleString("en-IN")}
          <span className="ml-1 text-sm text-slate-500">{per}</span>
        </div>
      </div>
      <ul className="mt-3 text-sm space-y-1">
        {features.map((f) => <li key={f}>✓ {f}</li>)}
      </ul>
      <a href="#start" className="btn-primary btn-shine mt-4">Get {name}</a>
    </div>
  );
}

/** ---------- Effects ---------- */
function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** ---------- Page ---------- */
export default function PublicLanding() {
  useRevealOnScroll();

  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled(y > 6);
      setShowTop(y > 400); // show "Top" after 400px
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pricing billing state
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"

  // Smooth-scroll to a section and move keyboard focus there
  const goToSection = (hash) => {
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

  // Catalog (Odoo-style categories)
  const APPS = useMemo(
    () => [
      { id: "crm",        name: "CRM",             cat: "sales",     icon: "🤝", desc: "Track leads, manage pipelines, and close deals faster with AI scoring & next actions.", tags: ["Leads","Pipeline","AI"], paid: false, version: "2.4.0", popularity: 99, updatedAt: "2025-08-01" },
      { id: "sales",      name: "Sales",           cat: "sales",     icon: "🧾", desc: "Quotations to orders with e-sign, price lists, and invoicing handoff.",                  tags: ["Quotes","Orders"],       paid: false, version: "1.9.1", popularity: 92, updatedAt: "2025-07-18" },
      { id: "website",    name: "Website",         cat: "website",   icon: "🌐", desc: "Drag-and-drop site builder with blog, forms, and SEO tools.",                          tags: ["Builder","SEO"],         paid: false, version: "1.3.1", popularity: 78, updatedAt: "2025-07-09" },
      { id: "ecommerce",  name: "eCommerce",       cat: "website",   icon: "🛒", desc: "Products, cart, payments, taxes, and order management in one place.",                  tags: ["Store","Payments"],      paid: true,  version: "2.1.0", popularity: 85, updatedAt: "2025-07-22" },
      { id: "accounting", name: "Accounting",      cat: "finance",   icon: "📚", desc: "Invoices, payments, bank sync, GST/VAT, and financial reports.",                      tags: ["GST","Reports"],         paid: true,  version: "4.2.0", popularity: 96, updatedAt: "2025-07-30" },
      { id: "inventory",  name: "Inventory",       cat: "ops",       icon: "📦", desc: "Multi-warehouse, barcode, batches/serials, putaway, and replenishment.",              tags: ["Barcode","WMS"],         paid: true,  version: "3.1.0", popularity: 90, updatedAt: "2025-06-29" },
      { id: "mfg",        name: "Manufacturing",   cat: "ops",       icon: "🏭", desc: "MRP, BOMs, work orders, quality, maintenance, and OEE dashboards.",                    tags: ["BOM","Quality"],         paid: true,  version: "3.0.0", popularity: 83, updatedAt: "2025-07-27" },
      { id: "hr",         name: "HR",              cat: "people",    icon: "🧑‍💼", desc: "Employees, attendance, leaves, payroll export, approvals and policies.",             tags: ["HRIS","Approvals"],      paid: false, version: "1.6.0", popularity: 86, updatedAt: "2025-07-05" },
      { id: "projects",   name: "Projects",        cat: "people",    icon: "📌", desc: "Kanban + Gantt, timesheets, milestones, and client portal for delivery teams.",        tags: ["Gantt","PM"],            paid: false, version: "2.0.3", popularity: 84, updatedAt: "2025-06-22" },
      { id: "helpdesk",   name: "Helpdesk",        cat: "support",   icon: "🎧", desc: "Tickets, SLAs, live chat, knowledge base, and CSAT analytics.",                       tags: ["Support","Chat"],        paid: false, version: "1.5.2", popularity: 81, updatedAt: "2025-06-12" },
      { id: "email_mark", name: "Email Marketing", cat: "marketing", icon: "✉️", desc: "Campaigns, segments, templates, UTM tracking, and deliverability analytics.",         tags: ["Campaigns","UTM"],       paid: false, version: "1.8.0", popularity: 88, updatedAt: "2025-05-30" },
      { id: "studio",     name: "Studio",          cat: "platform",  icon: "🧩", desc: "No-code builder for fields, views, automations, and server actions.",                  tags: ["No-code","Automation"],  paid: true,  version: "2.2.0", popularity: 76, updatedAt: "2025-07-11" },
    ],
    []
  );

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
  ];

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular"); // popular | az | newest
  const [price, setPrice] = useState("all");   // all | free | paid

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
    if (sort === "popular") list.sort((a, b) => b.popularity - a.popularity);
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") list.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return list;
  }, [APPS, q, cat, sort, price]);

  const logoRow = ["Asteria", "NovaTech", "BluePeak", "Zenlytics", "Quanta", "Skylark", "Vertex", "Nimbus"];

  return (
    <div className="relative min-h-screen">
      {/* Live gradient blob (utility in index.css) */}
      <div className="bg-blob" />

      {/* NAV */}
      <header
        className={`sticky top-0 z-20 backdrop-blur ${
          scrolled ? "shadow-sm border-slate-200 dark:border-slate-700" : "border-transparent"
        } border-b bg-white/70 dark:bg-slate-950/70`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-3"
            onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); }}
          >
            <BrandLogo />
            <span className="brand-name text-lg font-extrabold tracking-tight">{BRAND}</span>
          </a>
          <nav className="hidden md:flex items-center gap-3">
            <a className="chip" href="#apps"     onClick={(e)=>{e.preventDefault(); goToSection("#apps");}}>Apps</a>
            <a className="chip" href="#features" onClick={(e)=>{e.preventDefault(); goToSection("#features");}}>Features</a>
            <a className="chip" href="#pricing"  onClick={(e)=>{e.preventDefault(); goToSection("#pricing");}}>Pricing</a>
            <a className="btn-primary btn-shine" href="#start" onClick={(e)=>{e.preventDefault(); goToSection("#start");}}>Start free</a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 pt-14 pb-8 grid md:grid-cols-2 gap-8 items-center">
        <div className="reveal">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Run your business on one AI-native platform.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl">
            {BRAND} brings Sales, Website, Finance, Ops, People, Support, and a no-code Studio together.
            Built for speed, security, and scale.
          </p>
          <div className="mt-4 flex gap-2">
            <a href="#start" className="btn-primary btn-shine" onClick={(e)=>{e.preventDefault(); goToSection("#start");}}>Start free</a>
            <a href="#apps" className="btn-ghost" onClick={(e)=>{e.preventDefault(); goToSection("#apps");}}>Browse apps</a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">No credit card. Cancel anytime.</p>
        </div>

        {/* live carousel */}
        <div className="reveal">
          <HeroScreens />
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section aria-label="Trusted by" className="py-6 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-5">
          <div className="marquee">
            <div className="marquee-track">
              {logoRow.map((n) => (
                <div key={n} className="text-slate-500 dark:text-slate-300 whitespace-nowrap">{n}</div>
              ))}
              {logoRow.map((n) => (
                <div key={n + "-2"} className="text-slate-500 dark:text-slate-300 whitespace-nowrap">{n}</div>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 max-w-7xl mx-auto px-5 py-12">
        <div className="text-center mb-6 reveal">
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">Why {BRAND}</div>
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
          <div className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-300/90 font-semibold">Pricing</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">Simple pricing for every stage</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Switch billing anytime.</p>
        </div>

        {/* toggle */}
        <div className="flex justify-center gap-2 mb-6 reveal">
          <div className="panel p-1 inline-flex gap-1">
            {["monthly","yearly"].map((v) => (
              <button
                key={v}
                onClick={() => setBilling(v)}
                className={`px-3 py-1.5 rounded-lg ${billing === v ? "btn-primary" : "btn-ghost"}`}
              >
                {v === "monthly" ? "Monthly" : "Yearly (save ~16%)"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PriceCard
            name="Starter"
            m={999}
            y={9990}
            billing={billing}
            features={["Up to 5 users","CRM + Website","Email support"]}
          />
          <PriceCard
            name="Growth"
            m={2999}
            y={29990}
            billing={billing}
            highlight
            features={["Up to 25 users","AI scoring + analytics","Priority support"]}
          />
          <PriceCard
            name="Enterprise"
            m={7999}
            y={79990}
            billing={billing}
            features={["Unlimited users","SSO + Audit logs","Dedicated manager"]}
          />
        </div>
      </section>

      {/* CTA stripe */}
      <section id="start" className="scroll-mt-24 text-center py-12 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-slate-700 dark:from-cyan-300/10 dark:to-purple-500/10">
        <h2 className="text-2xl sm:text-3xl font-extrabold reveal">Ready to get started?</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1 reveal">Start free today — no credit card required.</p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <a href="#start" className="btn-primary btn-shine" onClick={(e)=>{e.preventDefault(); goToSection("#start");}}>Start free</a>
          <a href="#contact" className="btn-ghost" onClick={(e)=>{e.preventDefault(); goToSection("#contact");}}>Talk to sales</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="scroll-mt-24 border-t border-slate-200 py-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Genius Infravision — All rights reserved.</div>
          <div className="flex gap-3 flex-wrap">
            <a href="#privacy"  onClick={(e)=>{e.preventDefault(); goToSection("#contact");}}>Privacy</a>
            <a href="#terms"    onClick={(e)=>{e.preventDefault(); goToSection("#contact");}}>Terms</a>
            <a href="#security" onClick={(e)=>{e.preventDefault(); goToSection("#contact");}}>Security</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" });}}>Back to top</a>
          </div>
        </div>
      </footer>

      {/* Floating "Back to Top" button */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 right-5 z-30 rounded-full px-4 py-3 shadow-lg border
                     bg-slate-900 text-white border-slate-800
                     dark:bg-cyan-400 dark:text-slate-900 dark:border-cyan-300
                     hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-cyan-300/40"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}
