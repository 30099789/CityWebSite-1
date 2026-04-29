import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEventsXML } from "../services/xmlService";
import { getEvents } from "../data/mockData";

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