import { useMemo, useState } from "react";

function LogoMark({ className = "" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" className={className}>
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

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="text-center mb-7">
      {eyebrow && (
        <div className="uppercase tracking-widest text-xs text-muted font-semibold">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold">{title}</h2>
      {desc && <p className="text-muted max-w-2xl mx-auto mt-2">{desc}</p>}
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="glass rounded-xl p-4 shadow-lg">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="text-muted mt-1">{text}</p>
    </div>
  );
}

function PriceCard({ name, priceMonthly, priceYearly, features, highlight, activePlan }) {
  const price = activePlan === "yearly" ? priceYearly : priceMonthly;
  const per = activePlan === "yearly" ? "yr" : "mo";
  return (
    <div className={`glass rounded-xl p-5 shadow-xl ${highlight ? "ring-2 ring-purple-400/40" : ""}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-muted">₹</span>
          <span className="text-4xl font-extrabold">{price.toLocaleString("en-IN")}</span>
          <span className="text-muted">/{per}</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <button className="mt-4 w-full rounded-lg py-2 font-semibold text-bg bg-gradient-to-br from-cyan-300 to-purple-500">
        Start {name}
      </button>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium">{q}</span>
        <span className="text-xl">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-muted">{a}</div>}
    </div>
  );
}

export default function GeniusGridLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pricingPlan, setPricingPlan] = useState("monthly");

  const featureList = useMemo(
    () => [
      { title: "AI Insights", text: "Lead scoring, next actions, call sentiment.", icon: "🤖" },
      { title: "Realtime CRM", text: "Pipelines, notes, calls, tasks, notifications.", icon: "⚡" },
      { title: "Multi-Tenant & RBAC", text: "Companies, roles, permissions, audit logs.", icon: "🏢" },
      { title: "Analytics & Reports", text: "Dashboards, KPIs, CSV/PDF exports.", icon: "📊" },
      { title: "Custom Fields", text: "Dynamic fields per tenant & module.", icon: "🧩" },
      { title: "API-First", text: "Clean REST, JWT/session auth.", icon: "🛠️" },
    ],
    []
  );

  const faqs = [
    { q: "Is it really multi-tenant?", a: "Yes. Isolated tenant data, menus, modules, and settings with company switching and RBAC." },
    { q: "AI on calls and deals?", a: "Transcripts, summaries, tags, sentiment; plus AI scoring and next actions." },
    { q: "Migration support?", a: "CSV importers, mapping helpers, and APIs; assisted onboarding available." },
    { q: "Free trial?", a: "Starter has a free trial; yearly plans include ~2 months free." },
  ];

  const logos = ["Asteria", "NovaTech", "BluePeak", "Zenlytics", "Quanta", "Skylark"];

  function onSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    alert(`Thanks! We’ll reach out at ${email}`);
    setEmail("");
  }

  return (
    <div className="relative overflow-x-hidden">
      {/* Soft radial background */}
      <div className="pointer-events-none absolute -inset-x-1 -top-40 h-[60vh] blur-3xl opacity-60"
           style={{
             background:
               "radial-gradient(700px 700px at 30% 10%, rgba(139,92,246,.35), transparent 60%), radial-gradient(600px 600px at 70% 0%, rgba(110,231,249,.25), transparent 60%)",
           }} />

      {/* NAV */}
      <header className="sticky top-0 z-20 glass h-16 flex items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2 font-extrabold">
          <LogoMark />
          <span>GeniusGrid</span>
        </a>

        <nav className={`hidden md:flex items-center gap-5`}>
          <a href="#features">Features</a>
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="#contact" className="btn ghost px-3 py-2 rounded-lg glass">Contact</a>
        </nav>

        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* mobile menu */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-16 md:hidden glass p-4 border-t border-border">
            <div className="grid gap-3">
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg glass text-center">Contact</a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-[clamp(32px,5.2vw,56px)] leading-tight font-extrabold">
              The AI-Powered SaaS ERP <br /> your team actually loves.
            </h1>
            <p className="text-muted mt-3">
              GeniusGrid combines CRM, calls, deals, analytics, notifications, and RBAC into a blazing-fast, AI-first workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-[220px] rounded-lg border border-border bg-[#0f0f17] px-3 py-2 outline-none focus:ring-4 focus:ring-cyan-300/35"
              />
              <button className="rounded-lg px-4 py-2 font-semibold text-bg bg-gradient-to-br from-cyan-300 to-purple-500">
                Get early access
              </button>
            </form>
            <div className="text-xs text-muted mt-2">No spam. Cancel anytime. Free trial on Starter.</div>
          </div>

          {/* mock preview */}
          <div className="glass rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-10 border-b border-border bg-[#191926]" />
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div className="grid gap-3">
                <div className="h-24 rounded-xl border border-border bg-gradient-to-br from-[#1a1a2b] to-[#181828]" />
                <div className="h-24 rounded-xl border border-border bg-gradient-to-br from-[#1a1a2b] to-[#181828]" />
                <div className="h-24 rounded-xl border border-border bg-gradient-to-br from-[#1a1a2b] to-[#181828]" />
              </div>
              <div className="grid gap-3">
                <div className="h-40 rounded-xl border border-border bg-[radial-gradient(120px_60px_at_40%_20%,rgba(110,231,249,.25),transparent_55%)]" />
                <div className="h-24 rounded-xl border border-border bg-gradient-to-b from-white/5 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS */}
        <section className="border-y border-white/10 py-4">
          <div className="max-w-6xl mx-auto px-5 grid grid-flow-col auto-cols-max gap-10 overflow-x-auto no-scrollbar">
            {["Asteria","NovaTech","BluePeak","Zenlytics","Quanta","Skylark"].map((n) => (
              <div key={n} className="text-muted whitespace-nowrap">{n}</div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="max-w-6xl mx-auto px-5 py-16">
          <SectionTitle
            eyebrow="Why GeniusGrid"
            title="Everything you need—fast, secure, AI-smart."
            desc="From first contact to closed deal and beyond, GeniusGrid keeps your teams aligned."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureList.map((f) => (
              <Feature key={f.title} icon={f.icon} title={f.title} text={f.text} />
            ))}
          </div>
        </section>

        {/* PRODUCT */}
        <section id="product" className="max-w-6xl mx-auto px-5 pb-16">
          <SectionTitle
            eyebrow="See it in action"
            title="Realtime CRM + AI insights"
            desc="Kanban, cards, and tables with live updates. AI scores leads and suggests next actions."
          />
          <div className="grid gap-4">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="h-10 bg-[#191926] border-b border-border" />
              <div className="grid lg:grid-cols-[2fr_1fr] gap-4 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["New","Qualified","Won"].map((pill) => (
                    <div key={pill} className="grid gap-2">
                      <div className="inline-block px-3 py-1 rounded-full border border-border text-muted text-xs">{pill}</div>
                      <div className="h-16 rounded-lg border border-border bg-gradient-to-br from-[#181828] to-[#1a1a2b]" />
                      <div className="h-16 rounded-lg border border-border bg-gradient-to-br from-[#181828] to-[#1a1a2b]" />
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
                  <div className="h-24 rounded-lg border border-border bg-[radial-gradient(80px_50px_at_30%_20%,rgba(139,92,246,.22),transparent_60%)]" />
                  <div className="h-24 rounded-lg border border-border bg-[radial-gradient(80px_50px_at_70%_30%,rgba(110,231,249,.22),transparent_60%)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="max-w-6xl mx-auto px-5 pb-16">
          <SectionTitle
            eyebrow="Simple pricing"
            title="Pick a plan and scale"
            desc="Switch between monthly and yearly. Annual saves ~16%."
          />

          <div className="flex justify-center gap-2 mb-4">
            <button
              className={`px-3 py-2 rounded-lg glass ${pricingPlan === "monthly" ? "ring-2 ring-cyan-300/40" : ""}`}
              onClick={() => setPricingPlan("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-2 rounded-lg glass ${pricingPlan === "yearly" ? "ring-2 ring-cyan-300/40" : ""}`}
              onClick={() => setPricingPlan("yearly")}
            >
              Yearly
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <PriceCard
              name="Starter"
              priceMonthly={999}
              priceYearly={9990}
              activePlan={pricingPlan}
              features={["Up to 5 users", "CRM + Deals + Calls", "AI summaries (basic)", "Email support"]}
            />
            <PriceCard
              name="Growth"
              priceMonthly={2999}
              priceYearly={29990}
              activePlan={pricingPlan}
              highlight
              features={["Up to 25 users", "AI scoring + next actions", "Dashboards & exports", "Priority support"]}
            />
            <PriceCard
              name="Enterprise"
              priceMonthly={7999}
              priceYearly={79990}
              activePlan={pricingPlan}
              features={["Unlimited users", "SAML/SSO + Audit logs", "Custom SLAs & onboarding", "Dedicated manager"]}
            />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-6xl mx-auto px-5 pb-16">
          <SectionTitle eyebrow="Loved by modern teams" title="What our customers say" />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["We replaced three tools with GeniusGrid. AI insights alone paid for the switch.", "— Aisha K., Sales Lead"],
              ["Our pipeline is real-time and clean. The audit trail keeps ops and IT happy.", "— Rahul S., RevOps"],
              ["Setup took a day. The team actually enjoys using the CRM now.", "— Maria P., COO"],
            ].map(([q, by]) => (
              <div key={by} className="glass rounded-xl p-4">
                <div>“{q}”</div>
                <div className="text-muted text-sm mt-2">{by}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto px-5 pb-16">
          <SectionTitle eyebrow="FAQ" title="Answers to common questions" />
          <div className="grid gap-3">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="text-center py-16 border-t border-white/10 bg-gradient-to-b from-cyan-300/10 to-purple-500/10">
          <h2 className="text-3xl font-extrabold">Ready to see GeniusGrid in action?</h2>
          <p className="text-muted mt-1">Book a demo or start your free trial today.</p>
          <div className="flex gap-3 justify-center mt-3 flex-wrap">
            <a href="#home" className="rounded-lg px-4 py-2 font-semibold text-bg bg-gradient-to-br from-cyan-300 to-purple-500">Start free trial</a>
            <a href="mailto:hello@geniusinfravision.example" className="rounded-lg px-4 py-2 glass">Book a demo</a>
          </div>
        </section>
      </main>

      <footer className="flex flex-col sm:flex-row gap-3 justify-between items-center px-5 py-6 border-t border-white/10 text-muted">
        <div>© {new Date().getFullYear()} Genius Infravision — All rights reserved.</div>
        <div className="flex gap-3 flex-wrap">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#security">Security</a>
        </div>
      </footer>
    </div>
  );
}
