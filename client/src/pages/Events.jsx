import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/events";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Upcoming Events
        </h1>

        <p className="text-slate-500 text-lg max-w-2xl mb-6">
          Stay informed about the latest community events, workshops, and
          gatherings happening in your city.
        </p>

        {loading ? (
          <p className="text-slate-400">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-400">No events available at the moment.</p>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <EventCard key={evt._id || evt.id} evt={evt} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

function EventCard({ evt }) {
  const eventId = evt._id || evt.id;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col">
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        {evt.title}
      </h2>

      <p className="text-slate-600 text-sm flex-grow mb-5">
        {evt.description}
      </p>

      <p className="text-slate-500 text-sm mb-1">
        <strong>Date:</strong>{" "}
        {evt.date ? new Date(evt.date).toLocaleDateString() : "Not available"}
      </p>

      <p className="text-slate-500 text-sm mb-3">
        <strong>Time:</strong> {evt.time || "Not available"}
      </p>

      <p className="text-slate-500 text-sm mb-5">
        <strong>Location:</strong> {evt.location || "Not available"}
      </p>

      <p className="text-slate-500 text-sm mb-5">
        <strong>Category:</strong> {evt.category || "General"}
      </p>

      <p className="text-slate-500 text-sm mb-5">
        <strong>Status:</strong> {evt.status || "Open"}
      </p>

      <Link
        to={`/events/${eventId}`}
        className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
      >
        Click to View Details
      </Link>
    </div>
  );
}
