import { useEffect, useRef, useState } from "react";

// Respect Vite base path
const p = (file) => `${import.meta.env.BASE_URL}screens/${file}`;

// Screens + AI overlay data
const SCREENS = [
  {
    src: p("crm.png"),
    alt: "CRM pipeline dashboard",
    title: "CRM",
    badge: "AI lead scoring",
    stats: [{ k: "Win Rate", v: "↑12%" }, { k: "Next Action", v: "Call – 3 pm" }],
    accent: "from-cyan-400 to-violet-500",
  },
  {
    src: p("sales.png"),
    alt: "Sales quotes & orders",
    title: "Sales",
    badge: "Dynamic pricing (AI)",
    stats: [{ k: "Quote → Order", v: "67%" }, { k: "Best Offer", v: "–4.3%" }],
    accent: "from-emerald-400 to-cyan-400",
  },
  {
    src: p("analytics.png"),
    alt: "Analytics charts & KPIs",
    title: "Analytics",
    badge: "Forecast engine",
    stats: [{ k: "Rev Forecast", v: "₹1.2Cr" }, { k: "Anomaly Risk", v: "Low" }],
    accent: "from-fuchsia-400 to-purple-500",
  },
  {
    src: p("inventory.png"),
    alt: "Inventory stock overview",
    title: "Inventory",
    badge: "Smart replenishment",
    stats: [{ k: "Stockouts", v: "–31%" }, { k: "Reorder", v: "7 SKUs" }],
    accent: "from-amber-400 to-rose-400",
  },
];

export default function HeroScreens({ interval = 4500 }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(() => SCREENS.map(() => false));
  const [failed, setFailed] = useState(() => SCREENS.map(() => false));
  const [sweep, setSweep] = useState(false);
  const t = useRef(null);

  // autoplay
  useEffect(() => {
    if (paused) return;
    t.current = setInterval(() => setI((p) => (p + 1) % SCREENS.length), interval);
    return () => clearInterval(t.current);
  }, [paused, interval]);

  // preload
  useEffect(() => {
    SCREENS.forEach((s, idx) => {
      const img = new Image();
      img.onload = () => setLoaded((a) => (a[idx] = true, [...a]));
      img.onerror = () => setFailed((a) => (a[idx] = true, [...a]));
      img.src = s.src;
    });
  }, []);

  // light sweep when slide changes
  useEffect(() => {
    setSweep(true);
    const h = setTimeout(() => setSweep(false), 500);
    return () => clearTimeout(h);
  }, [i]);

  const go = (dir) => setI((p) => (p + dir + SCREENS.length) % SCREENS.length);

  return (
    <div
      className="panel overflow-hidden shadow-md relative aspect-[16/10] sm:aspect-[16/9] scanline"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      tabIndex={0}
      aria-label="Product screenshots carousel"
    >
      {/* window chrome */}
      <div className="h-9 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 flex items-center gap-2 px-3">
        <span className="inline-flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
        </span>
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{SCREENS[i].title}</span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-400">AI ACTIVE</span>
      </div>

      {/* slides */}
      <div className="relative h-[calc(100%-36px)]">
        {SCREENS.map((s, idx) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === i ? "opacity-100" : "opacity-0"}`}
          >
            {/* Base image / skeleton / fallback */}
            {!failed[idx] && (
              <img
                src={s.src}
                alt={s.alt}
                className={`w-full h-full object-cover ${loaded[idx] ? "" : "opacity-0"}`}
                onLoad={() => setLoaded((a) => (a[idx] = true, [...a]))}
                onError={() => setFailed((a) => (a[idx] = true, [...a]))}
              />
            )}
            {!loaded[idx] && !failed[idx] && (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
            )}
            {failed[idx] && (
              <div className="w-full h-full grid place-items-center bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900">
                <div className="text-center">
                  <div className="text-4xl">🖼️</div>
                  <div className="mt-1 font-semibold">{s.title}</div>
                  <div className="text-xs text-slate-500">Missing: <code>/public/screens/{s.title.toLowerCase()}.png</code></div>
                </div>
              </div>
            )}

            {/* Futuristic AI overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {/* subtle grid */}
              <div className="absolute inset-0 dotgrid" />
              {/* neon ribbon */}
              <div className={`absolute -top-6 -right-16 w-[60%] h-24 rotate-12 blur-2xl bg-gradient-to-r ${s.accent} opacity-30`} />
              {/* AI badge top-right */}
              <div className="absolute right-3 top-3 ai-hud px-2 py-1 text-[10px] uppercase tracking-wider">
                <span className="neon">{s.badge}</span>
              </div>
              {/* Metrics card bottom-left */}
              <div className="absolute left-3 bottom-3 ai-hud px-3 py-2 text-xs">
                <div className="font-semibold mb-1">{s.title} Insights</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {s.stats.map(({ k, v }) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
                      <span className="text-slate-500 dark:text-slate-400">{k}:</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Animated connective line (bottom-right) */}
              <svg className="absolute right-3 bottom-3" width="140" height="80" viewBox="0 0 140 80" fill="none">
                <path d="M2 78 C 40 40, 80 60, 138 6" className="dash" stroke="url(#g1)" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="g1" x1="0" y1="80" x2="140" y2="0">
                    <stop offset="0" stopColor="#22d3ee" stopOpacity=".7" />
                    <stop offset="1" stopColor="#a78bfa" stopOpacity=".5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ))}
        {/* edge mask */}
        <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent,black_8%,black_92%,transparent)]" />
        {/* sweep on change */}
        <div className={`sweep ${sweep ? "show" : ""}`} style={{"--x":"50%"}} />
      </div>

      {/* controls */}
      <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 btn-ghost px-2 py-1" aria-label="Previous">‹</button>
      <button onClick={() => go(1)}  className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost px-2 py-1" aria-label="Next">›</button>

      {/* dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {SCREENS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === i ? "bg-indigo-900 dark:bg-cyan-300 w-6" : "bg-slate-300/70 dark:bg-slate-600/70 w-2"}`}
          />
        ))}
      </div>
    </div>
  );
}
