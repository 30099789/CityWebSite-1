// Faq.jsx — Caio
// Sprint 2: Reads from public/xml/faq.xml via xmlService
// Falls back to hardcoded defaults if XML unavailable
import { useEffect, useState } from "react";
import { getFaqData } from "../services/xmlService";

// Fallback FAQ data if XML fails to load
const FALLBACK_FAQ = [
  {
    name: "General",
    faq: [
      { question: "What is the CityLink Smart Community Portal?", answer: "The CityLink Portal is a digital platform for community members to access local government services, events, announcements, and more." },
      { question: "Who can use the portal?", answer: "The portal is open to all community members. Public pages are available without an account. Booking events and submitting feedback requires a free account." },
    ],
  },
  {
    name: "Account & Profile",
    faq: [
      { question: "How do I create an account?", answer: "Click Sign Up in the top navigation bar and fill in your name, email, and password." },
      { question: "How do I reset my password?", answer: "Click Log In, then Forgot Password and enter your email. A reset link will be sent to your inbox." },
    ],
  },
];

export default function Faq() {
  const [categories, setCategories] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("xml");

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

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Find answers to common questions. Can't find what you're looking for?{" "}
          <a href="/contact" className="text-blue-600 hover:underline">Contact us</a>.
        </p>
        {source === "xml" && (
          <p className="text-xs text-slate-400 mt-2">
            Content loaded from <code>public/xml/faq.xml</code>
          </p>
        )}
      </section>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading FAQ…
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catName = cat["@_name"] || cat.name || "General";
            const faqs    = Array.isArray(cat.faq) ? cat.faq : cat.faq ? [cat.faq] : [];

            return (
              <section key={catName}>
                <h2 className="text-lg font-bold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                  {catName}
                </h2>
                <div className="space-y-3">
                  {faqs.map((item, i) => {
                    const id  = `${catName}-${i}`;
                    const q   = item.question || item.q || "";
                    const a   = item.answer   || item.a || "";
                    const isOpen = openId === id;

                    return (
                      <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                          onClick={() => toggle(id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm font-semibold text-slate-800">{q}</span>
                          <svg
                            className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 border-t border-slate-100">
                            <p className="text-sm text-slate-500 leading-relaxed mt-3">{a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
