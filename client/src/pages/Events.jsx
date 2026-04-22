// Events.jsx — Caio
// Sprint 2: Uses mock data from mockData.js (no backend needed)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEventsXML } from "../services/xmlService";
import { getEvents } from "../data/mockData";

const CATEGORY_COLORS = {
  Community: "bg-blue-50 text-blue-700 border-blue-200",
  Council:   "bg-violet-50 text-violet-700 border-violet-200",
  Education: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Market:    "bg-amber-50 text-amber-700 border-amber-200",
};
const STATUS_COLORS = {
  Upcoming:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Full:      "bg-red-50 text-red-600 border-red-200",
  Completed: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [source, setSource] = useState("xml");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (source === "xml") {
          const eventsData = await getEventsXML();
          setEvents(eventsData);
        } else {
          setEvents(getEvents());
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [source]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Upcoming Events
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Stay informed about the latest community events, workshops, and
          gatherings happening in your city.
        </p>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <p className="text-slate-400">No events available at the moment.</p>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <EventCard key={evt.id} evt={evt} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

function EventCard({ evt }) {
  const spotsLeft = evt.capacity - evt.booked;
  const isFull = evt.status === "Full" || spotsLeft <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Card header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[evt.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {evt.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[evt.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
            {evt.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-3">{evt.title}</h3>

        <div className="space-y-1.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{evt.date} · {evt.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>{evt.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>{isFull ? "Fully booked" : `${spotsLeft} spots left`}</span>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 pb-5">
        {isFull ? (
          <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
            Fully Booked
          </button>
        ) : evt.status === "Completed" ? (
          <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
            Event Ended
          </button>
        ) : (
          <Link to="/login" className="block w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors text-center">
            Book a Spot
          </Link>
        )}
      </div>
    </div>
  );
}
