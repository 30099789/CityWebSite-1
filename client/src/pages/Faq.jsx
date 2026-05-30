// Faq.jsx -- Sprint 3
// Loads FAQ questions from MongoDB (imported via XML Manager)
// Falls back to faq.xml if no DB records exist
// Admin uploads faq.xml via XML Manager to update questions without touching code

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getFaqData } from "../services/xmlService";
import BASE_URL from "../services/api";

const CATEGORY_ICONS = {
  "About the Portal":          "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "Account and Profile":       "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Account & Profile":         "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Events and Bookings":       "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "Events & Bookings":         "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "Privacy and Accessibility": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "Privacy & Accessibility":   "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
};
const DEFAULT_ICON = "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

export default function Faq() {
  const [categories, setCategories] = useState([]);
  const [openId, setOpenId]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [source, setSource]         = useState("");
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("all");

  useEffect(() => {
    async function load() {
      // Try MongoDB first -- admin may have imported faq.xml via XML Manager
      try {
        const res = await fetch(`${BASE_URL}/faqs`);
        if (res.ok) {
          const dbFaqs = await res.json();
          if (dbFaqs.length > 0) {
            // Group flat DB records into categories
            const grouped = {};
            dbFaqs.forEach((item) => {
              if (!grouped[item.category]) grouped[item.category] = [];
              grouped[item.category].push({ q: item.question, a: item.answer });
            });
            setCategories(
              Object.entries(grouped).map(([label, questions]) => ({ label, questions }))
            );
            setSource("db");
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fall back to faq.xml if DB has no records
      try {
        const xmlCats = await getFaqData();
        if (xmlCats && xmlCats.length > 0) {
          setCategories(xmlCats);
          setSource("xml");
        } else {
          setSource("none");
        }
      } catch {
        setSource("none");
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggle(id) { setOpenId((prev) => (prev === id ? null : id)); }

  // Normalise category data -- handles both DB grouped format and XML format
  const normalised = useMemo(() => {
    if (source === "db") return categories; // already normalised above
    return categories.map((cat) => {
      const label = cat["@_label"] || cat["@_name"] || cat.name || cat.label || "General";
      const rawQs = cat.question || cat.questions || cat.faq || [];
      const questions = (Array.isArray(rawQs) ? rawQs : [rawQs]).map((item) => ({
        q: item.q || item.question || "",
        a: item.a || item.answer   || "",
      }));
      return { label, questions };
    });
  }, [categories, source]);

  // Filter by active tab and search text
  const filtered = useMemo(() => {
    return normalised
      .filter((cat) => activeTab === "all" || cat.label === activeTab)
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter((item) =>
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [normalised, search, activeTab]);

  const totalResults = filtered.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Help Centre</span>
            {source === "db" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Database
              </span>
            )}
            {source === "xml" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                XML
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg max-w-2xl mb-6">Find answers to common questions about the CityLink portal.</p>

          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search questions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveTab("all"); }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {!loading && !search && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeTab === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              All Questions
            </button>
            {normalised.map((cat) => (
              <button key={cat.label} onClick={() => setActiveTab(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeTab === cat.label ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.label] || DEFAULT_ICON} />
                </svg>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {search && !loading && (
          <p className="text-sm text-slate-500 mb-5">
            {totalResults === 0 ? "No results found." : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${search}"`}
          </p>
        )}

        {loading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && totalResults === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 font-semibold mb-1">No questions found</p>
            <p className="text-slate-400 text-sm mb-4">Try different keywords or browse all categories</p>
            <button onClick={() => setSearch("")} className="text-sm font-semibold text-slate-900 hover:underline">Clear search</button>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {filtered.map((cat) => (
              <section key={cat.label}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.label] || DEFAULT_ICON} />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{cat.label}</h2>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat.questions.length}</span>
                </div>
                <div className="space-y-2">
                  {cat.questions.map((item, i) => {
                    const id = `${cat.label}-${i}`;
                    const isOpen = openId === id;
                    return (
                      <div key={id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-slate-300 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300"}`}>
                        <button onClick={() => toggle(id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                          aria-expanded={isOpen}>
                          <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-blue-700" : "text-slate-800"}`}>
                            {item.q}
                          </span>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? "bg-blue-700 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 border-t border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed mt-4">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
            <p className="text-slate-400 text-sm mb-5">Can not find what you are looking for? Our team is happy to assist.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/contact" className="px-5 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 transition">Contact Us</Link>
              <Link to="/feedback" className="px-5 py-2.5 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-600 transition">Submit Feedback</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}