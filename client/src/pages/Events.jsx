// Events.jsx — Sprint 3
// Assessment requirement: Dynamic events listing page loaded from MongoDB
// Assessment requirement: search and filter functionality for community events
// Assessment requirement: responsive card grid — mobile (1 col), tablet (2 col), desktop (3 col)
// Assessment requirement: skeleton loading state while data is fetched from API
// Images stored as Base64 in MongoDB and displayed directly in event cards

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../services/api";

// ── Status colour map ──────────────────────────────────────────────────────────
// Visual badge colours for event status shown on each card
const STATUS_STYLES = {
  Upcoming:  "bg-slate-100 text-slate-600 border-slate-200",
  Full:      "bg-red-50 text-red-600 border-red-100",
  Completed: "bg-slate-100 text-slate-400 border-slate-200",
  Cancelled: "bg-red-50 text-red-400 border-red-100",
};

// ── Inline SVG icon components ─────────────────────────────────────────────────
// Self-contained SVG icons — no external icon library dependency on public pages
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function Events() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");

  // ── Fetch all events — GET /api/events ────────────────────────────────────
  // Assessment requirement: dynamic content loaded from MongoDB on page load
  // Public route — no authentication required
  useEffect(() => {
    fetch(`${BASE_URL}/events`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Status filter tabs — All shows every event regardless of status
  const statuses = ["All", "Upcoming", "Full", "Completed"];

  // Assessment requirement: search events by title or location
  // Filter by status tab and text search simultaneously
  const visible = events.filter((ev) => {
    const matchFilter = filter === "All" || ev.status === filter;
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                        (ev.location || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Page header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Community Events</h1>
          <p className="text-slate-500">Stay informed about the latest events, workshops and gatherings.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Search input + status filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search events..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  filter === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Result count — shown after loading completes */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-5">
            Showing <span className="font-semibold text-slate-600">{visible.length}</span> of {events.length} events
          </p>
        )}

        {/* Loading skeleton — assessment requirement: loading state while fetching from MongoDB */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          // Empty state — shown when search or filter returns no results
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold mb-1">No events found</p>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your search or filter</p>
            <button onClick={() => { setSearch(""); setFilter("All"); }}
              className="text-sm font-semibold text-slate-900 hover:underline">Clear filters</button>
          </div>
        ) : (
          // Events card grid — assessment requirement: responsive layout
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((evt, i) => (
              <EventCard key={evt._id || evt.id} evt={evt} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ── EventCard component ────────────────────────────────────────────────────────
// Assessment requirement: event cards with image, date, time, location and status
// "View Details" links to /events/:id for full event page and booking
// isFull based on status field — capacity display was removed from public portal
function EventCard({ evt, index }) {
  const eventId = evt._id || evt.id;
  const isFull  = evt.status === "Full";

  // Format date for Australian locale (e.g. "15 Jun 2026")
  const dateStr = evt.date
    ? new Date(evt.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "Date TBC";

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Event image — Base64 stored in MongoDB, displayed directly in src */}
      {evt.imageUrl ? (
        <div className="relative h-44 overflow-hidden">
          <img src={evt.imageUrl} alt={evt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-sm bg-white/90 ${STATUS_STYLES[evt.status] || STATUS_STYLES.Upcoming}`}>
              {evt.status || "Upcoming"}
            </span>
          </div>
          {/* Date chip overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg">
              <CalendarIcon />{dateStr}
            </span>
          </div>
        </div>
      ) : (
        // Placeholder — shown when no image has been uploaded for the event
        <div className="relative h-44 bg-slate-100 border-b border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{evt.category || "Event"}</p>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border ${STATUS_STYLES[evt.status] || STATUS_STYLES.Upcoming}`}>
              {evt.status || "Upcoming"}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
              <CalendarIcon />{dateStr}
            </span>
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {evt.category && (
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">{evt.category}</span>
        )}
        <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-slate-700 transition-colors line-clamp-2">
          {evt.title}
        </h3>

        {/* Event metadata — time and location (capacity removed from public display) */}
        <div className="space-y-1.5 mb-4 flex-1">
          {evt.time && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ClockIcon /><span>{evt.time}</span>
            </div>
          )}
          {evt.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPinIcon /><span className="truncate">{evt.location}</span>
            </div>
          )}
        </div>

        {/* View Details CTA — disabled with pointer-events-none when event is Full */}
        <Link
          to={`/events/${eventId}`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isFull
              ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {isFull ? "Event Full" : <><span>View Details</span><ArrowIcon /></>}
        </Link>
      </div>
    </div>
  );
}