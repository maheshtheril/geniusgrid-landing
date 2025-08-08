import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const getIsDark = () => document.documentElement.classList.contains("dark");
  const [isDark, setIsDark] = useState(getIsDark());

  // Keep local state in sync if something else flips the class
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(getIsDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const setTheme = (t) => {
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setIsDark(t === "dark");
  };

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      type="button"
      className="btn-ghost"                 /* uses your index.css helpers */
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <span className="hidden dark:inline">🌞 Light</span>
      <span className="dark:hidden">🌙 Dark</span>
    </button>
  );
}
