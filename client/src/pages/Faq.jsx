// Faq.jsx — Sprint 3 (redesigned)
// Reads from public/xml/faq.xml, falls back to hardcoded defaults
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getFaqData } from "../services/xmlService";

const FALLBACK_FAQ = [
  {
    "@_label": "About the Portal",
    question: [
      { q: "What is the CityLink Smart Community Portal?", a: "The CityLink Portal is a digital platform for community members to access local government services, events, announcements, and more." },
      { q: "Who can use the portal?", a: "The portal is open to all community members. Public pages are available without an account. Booking events and submitting feedback requires a free account." },
      { q: "Is the portal free to use?", a: "Yes — completely free for all community members. No subscription fees or charges for any public-facing features." },
    ],
  },
  {
    "@_label": "Account and Profile",
    question: [
      { q: "How do I create an account?", a: "Click Sign Up in the top navigation bar and fill in your name, email, and password." },
      { q: "How do I reset my password?", a: "Click Log In, then Forgot Password and enter your email. A reset link will be sent to your inbox." },
      { q: "How do I update my profile?", a: "Log in and click your name in the top nav, then select My Profile. Update your details and click Save Changes." },
    ],
  },
  {
    "@_label": "Events and Bookings",
    question: [
      { q: "How do I book a community event?", a: "Go to the Events page, click on an event, then click Book My Spot. You must be logged in to book." },
      { q: "Can I cancel my booking?", a: "Yes. Log in and go to My Profile → Bookings tab. Click Cancel next to the event you wish to cancel." },
      { q: "How do I know if an event is full?", a: "Each event shows remaining spots. If full, the button shows Event Full. Check back later as cancellations can free up spots." },
    ],
  },
  {
    "@_label": "Privacy and Accessibility",
    question: [
      { q: "How does CityLink protect my information?", a: "All personal information is handled in accordance with the Australian Privacy Principles (APPs). We never sell your data to third parties." },
      { q: "Is the portal accessible to people with disabilities?", a: "Yes. The portal meets WCAG 2.1 Level AA standards — keyboard navigation, screen reader support, and sufficient colour contrast." },
      { q: "Which browsers does the portal support?", a: "Chrome, Firefox, Safari and Edge (latest versions). Fully responsive on desktops, tablets and smartphones." },
    ],
  },
];

const CATEGORY_ICONS = {
  "About the Portal":      "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "Account and Profile":   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Account & Profile":     "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Events and Bookings":   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "Events & Bookings":     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "Privacy and Accessibility": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "Privacy & Accessibility":   "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
};

const DEFAULT_ICON = "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

export default function Faq() {
  const [categories, setCategories] = useState([]);
  const [openId, setOpenId]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [source, setSource]         = useState("xml");
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("all");

  useEffect(() => {
    getFaqData().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        setSource("xml");
      } else {
        setCategories(FALLBACK_FAQ);
        setSource("fallback");
      }
      setLoading(false);
    });
  }, []);

  function toggle(id) { setOpenId((prev) => (prev === id ? null : id)); }

  // Normalise category data from XML or fallback
  const normalised = useMemo(() => categories.map((cat) => {
    const label = cat["@_label"] || cat["@_name"] || cat.name || "General";
    const rawQs = cat.question || cat.faq || [];
    const questions = (Array.isArray(rawQs) ? rawQs : [rawQs]).map((item) => ({
      q: item.q || item.question || "",
      a: item.a || item.answer   || "",
    }));
    return { label, questions };
  }), [categories]);

  // Filter by search and active tab
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

      {/* Page header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Help Centre</span>
            {source === "xml" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                XML
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mb-6">
            Find answers to common questions about the CityLink portal.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveTab("all"); }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Category tabs */}
        {!loading && !search && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}>
              All Questions
            </button>
            {normalised.map((cat) => (
              <button key={cat.label} onClick={() => setActiveTab(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeTab === cat.label
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.label] || DEFAULT_ICON} />
                </svg>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Search results count */}
        {search && !loading && (
          <p className="text-sm text-slate-500 mb-5">
            {totalResults === 0
              ? "No results found."
              : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${search}"`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && totalResults === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold mb-1">No questions found</p>
            <p className="text-slate-400 text-sm mb-4">Try different keywords or browse all categories</p>
            <button onClick={() => setSearch("")} className="text-sm font-semibold text-slate-900 hover:underline">
              Clear search
            </button>
          </div>
        )}

        {/* FAQ categories */}
        {!loading && (
          <div className="space-y-8">
            {filtered.map((cat) => (
              <section key={cat.label}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.label] || DEFAULT_ICON} />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{cat.label}</h2>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {cat.questions.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cat.questions.map((item, i) => {
                    const id     = `${cat.label}-${i}`;
                    const isOpen = openId === id;

                    return (
                      <div key={id}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isOpen ? "border-slate-300 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                        }`}>
                        <button
                          onClick={() => toggle(id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                          aria-expanded={isOpen}>
                          <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? "text-blue-700" : "text-slate-800"}`}>
                            {/* Highlight search term */}
                            {search ? highlightText(item.q, search) : item.q}
                          </span>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isOpen ? "bg-blue-700 text-white rotate-180" : "bg-slate-100 text-slate-400"
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 border-t border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed mt-4">
                              {search ? highlightText(item.a, search) : item.a}
                            </p>
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

        {/* Still need help */}
        {!loading && (
          <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
            <p className="text-slate-400 text-sm mb-5">
              Can't find what you're looking for? Our team is happy to assist.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/contact"
                className="px-5 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 transition">
                Contact Us
              </Link>
              <Link to="/feedback"
                className="px-5 py-2.5 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-600 transition">
                Submit Feedback
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Highlight matching search text
function highlightText(text, search) {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? <mark key={i} className="bg-amber-100 text-amber-900 rounded px-0.5">{part}</mark>
      : part
  );
}