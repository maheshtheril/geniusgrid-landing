import { useMemo, useState } from "react";

const BRAND = "GeniusGrid";              // change to SynapseERP if you prefer
const LOGO_SRC = "";                     // put "/brand.svg" (or .png) in /public; leave blank to use the inline logo

function BrandLogo({ className = "h-8 w-8" }) {
  if (LOGO_SRC) return <img src={LOGO_SRC} alt={BRAND} className={className} />;
  // Inline fallback logo (gradient orb)
  return (
    <svg viewBox="0 0 24 24" className={className}>
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

function Badge({ tone = "muted", children }) {
  const cls = tone === "green" ? "badge-green" : tone === "purple" ? "badge-purple" : "badge-muted";
  return <span className={cls}>{children}</span>;
}

function CategoryPill({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`chip ${active ? "ring-2 ring-cyan-300/40" : ""}`}>
      {children}
    </button>
  );
}

function ModuleCard({ m }) {
  return (
    <div className="glass rounded-xl p-4 hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl border border-slate-700 bg-slate-900">
          {m.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100">{m.name}</h3>
            {m.installed && <Badge tone="green">Installed</Badge>}
            {m.paid ? <Badge tone="purple">Paid</Badge> : <Badge>Free</Badge>}
          </div>
          <p className="text-sm text-slate-300/90 line-clamp-2 mt-0.5">{m.desc}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {m.tags?.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {m.installed ? (
          <button className="px-3 py-2 rounded-lg border border-slate-700 text-slate-200">Open</button>
        ) : (
          <button className="btn-gradient">Install</button>
        )}
        <button className="px-3 py-2 rounded-lg border border-slate-700 text-slate-200">Details</button>
        <div className="ml-auto text-xs text-slate-400">v{m.version}</div>
      </div>
    </div>
  );
}

export default function AppsLanding() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showInstalled, setShowInstalled] = useState(false);
  const [price, setPrice] = useState("all"); // all | free | paid
  const [sort, setSort] = useState("popular"); // popular | newest | az

  const categories = [
    { key: "all", label: "All" },
    { key: "crm", label: "CRM" },
    { key: "sales", label: "Sales" },
    { key: "inventory", label: "Inventory" },
    { key: "accounting", label: "Accounting" },
    { key: "hr", label: "HR" },
    { key: "projects", label: "Projects" },
    { key: "website", label: "Website" },
    { key: "marketing", label: "Marketing" },
    { key: "helpdesk", label: "Helpdesk" },
    { key: "manufacturing", label: "Manufacturing" },
    { key: "studio", label: "Studio" },
    { key: "settings", label: "Settings" },
  ];

  const modules = useMemo(() => [
    { id: "crm", name: "CRM", category: "crm", icon: "🤝", desc: "Leads, pipelines, AI scoring, next-action suggestions, activity timeline.", installed: true,  paid: false, tags: ["AI","Pipelines","Leads"], popularity: 99, updatedAt: "2025-08-01", version: "2.4.0" },
    { id: "sales", name: "Sales", category: "sales", icon: "🧾", desc: "Quotes to orders with e-sign, pricing rules, invoicing handoff.", installed: false, paid: false, tags: ["Quotations","Orders"], popularity: 92, updatedAt: "2025-07-18", version: "1.9.1" },
    { id: "inventory", name: "Inventory", category: "inventory", icon: "📦", desc: "Multi-warehouse, barcode, lots/serials, replenishment & MPS.", installed: false, paid: true,  tags: ["Logistics","Barcode"], popularity: 90, updatedAt: "2025-06-29", version: "3.1.0" },
    { id: "accounting", name: "Accounting", category: "accounting", icon: "📚", desc: "Invoicing, payments, bank sync, GST/VAT, reports, audit trail.", installed: false, paid: true,  tags: ["Finance","Compliance"], popularity: 96, updatedAt: "2025-07-30", version: "4.2.0" },
    { id: "hr", name: "HR", category: "hr", icon: "🧑‍💼", desc: "Employees, attendance, leaves, payroll export, approvals.", installed: true,  paid: false, tags: ["Approvals","Payroll"], popularity: 86, updatedAt: "2025-07-05", version: "1.6.0" },
    { id: "project", name: "Projects", category: "projects", icon: "📌", desc: "Kanban + Gantt, timesheets, milestones, client portal.", installed: false, paid: false, tags: ["Gantt","Timesheets"], popularity: 84, updatedAt: "2025-06-22", version: "2.0.3" },
    { id: "website", name: "Website", category: "website", icon: "🌐", desc: "Drag-and-drop builder with blog, forms, SEO tools.", installed: false, paid: false, tags: ["Builder","SEO"], popularity: 78, updatedAt: "2025-07-09", version: "1.3.1" },
    { id: "marketing_email", name: "Email Marketing", category: "marketing", icon: "✉️", desc: "Campaigns, segments, templates, UTM tracking, analytics.", installed: true,  paid: false, tags: ["Campaigns","Analytics"], popularity: 88, updatedAt: "2025-05-30", version: "1.8.0" },
    { id: "helpdesk", name: "Helpdesk", category: "helpdesk", icon: "🎧", desc: "Tickets, SLAs, live chat, knowledge base, CSAT.", installed: false, paid: false, tags: ["Support","Live Chat"], popularity: 81, updatedAt: "2025-06-12", version: "1.5.2" },
    { id: "mfg", name: "Manufacturing", category: "manufacturing", icon: "🏭", desc: "MRP, BOMs, work orders, quality, maintenance, OEE.", installed: false, paid: true,  tags: ["BOM","Quality"], popularity: 83, updatedAt: "2025-07-27", version: "3.0.0" },
    { id: "studio", name: "Studio", category: "studio", icon: "🧩", desc: "No-code app builder: fields, views, automations, actions.", installed: false, paid: true,  tags: ["No-code","Automation"], popularity: 76, updatedAt: "2025-07-11", version: "2.2.0" },
    { id: "settings", name: "Settings", category: "settings", icon: "⚙️", desc: "Tenant, companies, users, roles, permissions, integrations.", installed: true,  paid: false, tags: ["Security","RBAC"], popularity: 99, updatedAt: "2025-08-05", version: "2.7.0" },
  ], []);

  // Filtering + sorting
  const filtered = useMemo(() => {
    let list = [...modules];
    if (category !== "all") list = list.filter(m => m.category === category);
    if (showInstalled) list = list.filter(m => m.installed);
    if (price !== "all") list = list.filter(m => (price === "free" ? !m.paid : m.paid));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sort === "popular") list.sort((a,b) => b.popularity - a.popularity);
    if (sort === "newest")  list.sort((a,b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    if (sort === "az")      list.sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [modules, category, showInstalled, price, query, sort]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[55vh] blur-3xl opacity-60"
           style={{background:"radial-gradient(700px 700px at 30% 10%, rgba(139,92,246,.35), transparent 60%), radial-gradient(600px 600px at 70% 0%, rgba(110,231,249,.25), transparent 60%)"}}/>

      {/* Header */}
      <header className="sticky top-0 z-20 glass h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div className="text-lg font-extrabold tracking-tight">{BRAND}</div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a className="chip" href="#">Docs</a>
            <a className="chip" href="#">Pricing</a>
            <a className="btn-gradient" href="#">Start Free</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 pt-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Apps</h1>
        <p className="text-slate-300 max-w-2xl mt-1">
          Browse and install modules to power your {BRAND} workspace.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-5 mt-6 grid gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <CategoryPill key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
              {c.label}
            </CategoryPill>
          ))}
        </div>

        <div className="glass rounded-xl p-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] items-center">
          <div className="relative">
            <input
              className="w-full px-10 py-2 rounded-lg border border-slate-700 bg-slate-900 outline-none focus:ring-4 focus:ring-cyan-300/35"
              placeholder="Search apps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          </div>

          <div className="flex items-center gap-3 justify-self-start md:justify-self-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showInstalled} onChange={e => setShowInstalled(e.target.checked)} />
              Installed
            </label>

            <select className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800" value={price} onChange={e => setPrice(e.target.value)}>
              <option value="all">All</option><option value="free">Free</option><option value="paid">Paid</option>
            </select>

            <select className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Popular</option><option value="newest">Newest</option><option value="az">A–Z</option>
            </select>
          </div>

          <div className="text-sm text-slate-300 justify-self-start md:justify-self-end">
            {filtered.length} app{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-5 mt-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length ? (
            filtered.map((m) => <ModuleCard key={m.id} m={m} />)
          ) : (
            <div className="col-span-full text-center text-slate-300 py-16 glass rounded-xl">
              No apps match your filters.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Genius Infravision — All rights reserved.</div>
          <div className="flex gap-3 flex-wrap">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
