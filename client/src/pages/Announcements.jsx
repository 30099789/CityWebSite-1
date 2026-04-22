// Announcements.jsx — Kate / Caio
// Sprint 2: Reads from public/xml/announcements.xml via xmlService
// Falls back to mockData.js if XML is unavailable
import { useEffect, useState } from "react";
import { getAnnouncementsXML } from "../services/xmlService";
import { getAnnouncements } from "../data/mockData";

const PRIORITY_STYLES = {
  Alert:  "bg-red-50 text-red-700 border-red-200",
  Update: "bg-blue-50 text-blue-700 border-blue-200",
  Notice: "bg-amber-50 text-amber-700 border-amber-200",
  high:   "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low:    "bg-slate-100 text-slate-500 border-slate-200",
};

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("xml");

  useEffect(() => {
    async function load() {
      // Try to load from XML first
      const xmlData = await getAnnouncementsXML();
      if (xmlData && xmlData.length > 0) {
        // Normalise XML fields to match display
        const normalised = xmlData.map((a) => ({
          id:       a["@_id"] || a.id || Math.random(),
          title:    a.title,
          summary:  a.summary,
          priority: a.priority || "Notice",
          date:     a.date,
          category: a.category,
          audience: a.audience,
          author:   a.author,
          status:   a.status || "Published",
        }));
        setItems(normalised);
        setSource("xml");
      } else {
        // Fallback to mock data
        const mock = getAnnouncements().filter((a) => a.status === "Published");
        setItems(mock);
        setSource("mock");
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Announcements
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Stay up to date with the latest news and notices from CityLink Initiatives.
        </p>
        {source === "xml" && (
          <p className="text-xs text-slate-400 mt-2">
            Content loaded from <code>public/xml/announcements.xml</code>
          </p>
        )}
      </section>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading announcements…
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No announcements at the moment.</p>
      ) : (
        <section className="space-y-4">
          {items.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </main>
  );
}

function AnnouncementCard({ item }) {
  const [open, setOpen] = useState(false);
  const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Notice;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} announcement: ${item.title}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityStyle}`}
              aria-label={`${item.priority} priority announcement`}
            >
              {item.priority}
            </span>
            {item.category && (
              <span className="text-xs text-slate-400">{item.category}</span>
            )}
            {item.date && (
              <span className="text-xs text-slate-400">{item.date}</span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{item.summary}</p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform mt-1 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && item.content && (
        <div className="px-6 pb-5 border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed mt-4">{item.content}</p>
          {item.author && (
            <p className="text-xs text-slate-400 mt-3">— {item.author}</p>
          )}
        </div>
      )}
    </div>
  );
}
