// Announcements.jsx — Sprint 3 Week 10
// Assessment requirement: XML primary source, merged with DB
// Loads from both announcements.xml AND MongoDB, merges results
import { useEffect, useState } from "react";
import { getAnnouncementsXML } from "../services/xmlService";
import { fetchAnnouncements } from "../services/announcementService";

const PRIORITY_CONFIG = {
  high:   { bar: "bg-red-500",   badge: "bg-red-50 text-red-700 border-red-200",       label: "High"   },
  medium: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium" },
  low:    { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500 border-slate-200", label: "Low"   },
  Alert:  { bar: "bg-red-500",   badge: "bg-red-50 text-red-700 border-red-200",       label: "Alert"  },
  Update: { bar: "bg-blue-500",  badge: "bg-blue-50 text-blue-700 border-blue-200",    label: "Update" },
  Notice: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Notice" },
};

const DEFAULT_PRIORITY = { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500 border-slate-200", label: "Notice" };

export default function Announcements() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [source, setSource]   = useState(null); // "xml" | "db" | "xml+db"
  const [filter, setFilter]   = useState("All");

  useEffect(() => {
    async function load() {
      try {
        // ── Load from both XML and MongoDB simultaneously ──────────────────
        // Assessment requirement: XML integration + live DB data
        // Both sources are merged so admin-created announcements always appear
        const [xmlItems, dbItems] = await Promise.all([
          getAnnouncementsXML().catch(() => []),
          fetchAnnouncements().catch(() => []),
        ]);

        // Filter published from both sources (case-insensitive status check)
        const xml = (xmlItems || []).filter((a) => a.status?.toLowerCase() === "published");
        const db  = (dbItems  || []).filter((a) => a.status?.toLowerCase() === "published");

        // Merge — DB items first (newest admin entries), then XML items
        setItems([...db, ...xml]);
        setSource(
          xml.length > 0 && db.length > 0 ? "xml+db" :
          xml.length > 0 ? "xml" : "db"
        );
      } catch {
        setError("Could not load announcements. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const priorities = ["All", "high", "medium", "low"];
  const visible = filter === "All" ? items : items.filter((a) => a.priority === filter);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Page header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Announcements</h1>
          <p className="text-slate-500">Stay up to date with the latest news and notices from CityLink Initiatives.</p>
          {/* Source badge — satisfies assessment evidence of XML integration */}
          {source && (
            <span className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              source === "xml" || source === "xml+db"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${source === "xml" || source === "xml+db" ? "bg-emerald-500" : "bg-slate-400"}`} />
              {source === "xml+db" ? "Content loaded from XML and database" :
               source === "xml"    ? "Content loaded from announcements.xml" :
               "Content loaded from database"}
            </span>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {priorities.map((p) => {
            const cfg = PRIORITY_CONFIG[p] || DEFAULT_PRIORITY;
            return (
              <button key={p} onClick={() => setFilter(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                  filter === p
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{p === "All" ? "All" : cfg.label}</button>
            );
          })}
          {!loading && (
            <span className="ml-auto text-xs text-slate-400">
              {visible.length} {visible.length === 1 ? "announcement" : "announcements"}
            </span>
          )}
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex gap-3 mb-3">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-5 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold mb-1">No announcements found</p>
            <button onClick={() => setFilter("All")} className="text-sm font-semibold text-slate-900 hover:underline mt-2">Clear filter</button>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="space-y-4">
            {visible.map((item, i) => (
              <AnnouncementCard key={item._id || item.id || i} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AnnouncementCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY_CONFIG[item.priority] || DEFAULT_PRIORITY;
  const dateDisplay = item.date
    ? new Date(item.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`h-1 w-full ${cfg.bar}`} />

      {item.imageUrl && (
        <div className="relative h-44 overflow-hidden">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-sm bg-white/90 ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {!item.imageUrl && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
            )}
            {item.category && (
              <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">{item.category}</span>
            )}
            {dateDisplay && <span className="text-xs text-slate-400 ml-auto">{dateDisplay}</span>}
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
        </div>
        <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 mt-1 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100">
          {item.content ? (
            <p className="text-sm text-slate-600 leading-relaxed mt-4">{item.content}</p>
          ) : (
            <p className="text-sm text-slate-400 italic mt-4">No additional details available.</p>
          )}
          {item.author && <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">— {item.author}</p>}
        </div>
      )}
    </div>
  );
}