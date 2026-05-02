// AccessibilityWidget.jsx — WCAG accessibility toolbar, bottom left
// Features: font size, contrast, grayscale, highlight links, pause animations
import { useState, useEffect } from "react";

const DEFAULTS = {
  fontSize:       0,    // -1, 0, 1, 2
  highContrast:   false,
  grayscale:      false,
  highlightLinks: false,
  pauseAnimations: false,
  dyslexicFont:   false,
};

function loadPrefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("a11y_prefs") || "{}") }; }
  catch { return DEFAULTS; }
}

export default function AccessibilityWidget() {
  const [open, setOpen]   = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);

  // Apply preferences to <html> element
  useEffect(() => {
    const html = document.documentElement;

    // Font size — add px offset to root
    const sizes = [-2, 0, 2, 4];
    html.style.fontSize = prefs.fontSize !== 0 ? `calc(1rem + ${sizes[prefs.fontSize + 1]}px)` : "";

    // High contrast
    if (prefs.highContrast) {
      html.style.filter = prefs.grayscale ? "contrast(2) grayscale(1)" : "contrast(2)";
    } else if (prefs.grayscale) {
      html.style.filter = "grayscale(1)";
    } else {
      html.style.filter = "";
    }

    // Pause animations
    if (prefs.pauseAnimations) {
      html.style.setProperty("--animation-duration", "0s");
      const style = document.getElementById("a11y-pause-anim") || document.createElement("style");
      style.id = "a11y-pause-anim";
      style.textContent = "*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }";
      document.head.appendChild(style);
    } else {
      document.getElementById("a11y-pause-anim")?.remove();
    }

    // Highlight links
    const linkStyle = document.getElementById("a11y-links") || document.createElement("style");
    linkStyle.id = "a11y-links";
    if (prefs.highlightLinks) {
      linkStyle.textContent = "a { outline: 2px solid #f59e0b !important; outline-offset: 2px !important; text-decoration: underline !important; }";
      document.head.appendChild(linkStyle);
    } else {
      linkStyle.remove();
    }

    // Dyslexic font
    const fontStyle = document.getElementById("a11y-font") || document.createElement("style");
    fontStyle.id = "a11y-font";
    if (prefs.dyslexicFont) {
      fontStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap');
        body, * { font-family: 'Lexend', sans-serif !important; letter-spacing: 0.05em !important; }
      `;
      document.head.appendChild(fontStyle);
    } else {
      fontStyle.remove();
    }

    // Save to localStorage
    localStorage.setItem("a11y_prefs", JSON.stringify(prefs));
  }, [prefs]);

  function update(key, val) {
    setPrefs((p) => ({ ...p, [key]: val }));
  }

  function reset() {
    setPrefs(DEFAULTS);
    document.documentElement.style.fontSize  = "";
    document.documentElement.style.filter    = "";
    document.getElementById("a11y-pause-anim")?.remove();
    document.getElementById("a11y-links")?.remove();
    document.getElementById("a11y-font")?.remove();
    localStorage.removeItem("a11y_prefs");
  }

  const Toggle = ({ label, value, onChange, icon }) => (
    <button onClick={() => onChange(!value)} aria-pressed={value}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
        value
          ? "bg-blue-700 text-white border-blue-700"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
      }`}>
      <span className="flex items-center gap-2">{icon} {label}</span>
      <span className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-white/30" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? "left-4" : "left-0.5"}`} />
      </span>
    </button>
  );

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">

      {/* Panel */}
      {open && (
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white text-sm font-semibold">Accessibility</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition" aria-label="Close accessibility panel">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">

            {/* Font size */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Text Size</p>
              <div className="flex items-center gap-2">
                <button onClick={() => update("fontSize", Math.max(-1, prefs.fontSize - 1))}
                  aria-label="Decrease text size"
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition text-base flex items-center justify-center">
                  A<span className="text-xs">−</span>
                </button>
                <div className="flex-1 flex gap-1">
                  {[-1, 0, 1, 2].map((v) => (
                    <button key={v} onClick={() => update("fontSize", v)}
                      className={`flex-1 h-2 rounded-full transition ${prefs.fontSize >= v ? "bg-blue-700" : "bg-slate-200"}`}
                      aria-label={`Text size ${v + 2}`} />
                  ))}
                </div>
                <button onClick={() => update("fontSize", Math.min(2, prefs.fontSize + 1))}
                  aria-label="Increase text size"
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition text-base flex items-center justify-center">
                  A<span className="text-xs">+</span>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Display</p>

              <Toggle label="High Contrast" value={prefs.highContrast} onChange={(v) => update("highContrast", v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>} />

              <Toggle label="Grayscale" value={prefs.grayscale} onChange={(v) => update("grayscale", v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>} />

              <Toggle label="Highlight Links" value={prefs.highlightLinks} onChange={(v) => update("highlightLinks", v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>} />

              <Toggle label="Pause Animations" value={prefs.pauseAnimations} onChange={(v) => update("pauseAnimations", v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>} />

              <Toggle label="Dyslexia-friendly Font" value={prefs.dyslexicFont} onChange={(v) => update("dyslexicFont", v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>} />
            </div>

            {/* Reset */}
            <button onClick={reset}
              className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition">
              Reset to Default
            </button>

            <p className="text-xs text-slate-400 text-center">WCAG 2.1 AA Compliant</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close accessibility options" : "Open accessibility options"}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-blue-700 text-white shadow-xl hover:bg-blue-800 transition-all flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </button>
    </div>
  );
}