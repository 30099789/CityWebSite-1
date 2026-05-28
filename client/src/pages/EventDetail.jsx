// EventDetail.jsx — Sprint 3 Week 8
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BASE_URL from "../services/api";

const STATUS_COLORS = {
  Upcoming:  "bg-blue-50 text-blue-700 border-blue-200",
  Full:      "bg-orange-50 text-orange-700 border-orange-200",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function EventDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [booked, setBooked]       = useState(false);
  const [booking, setBooking]     = useState(false);
  const [bookError, setBookError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if user already has a booking for this event on load
  useEffect(() => {
    if (!user || !id) return;
    fetch(`${BASE_URL}/bookings/my?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((bookings) => {
        const alreadyBooked = bookings.some((b) => b.eventId === id || b.eventId?._id === id);
        if (alreadyBooked) setBooked(true);
      })
      .catch(() => {});
  }, [user, id]);

  async function handleBook() {
    if (!user) { navigate("/login"); return; }
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId:     event._id,
          eventTitle:  event.title,
          userName:    user.name,
          userEmail:   user.email,
          bookingDate: new Date().toISOString().slice(0, 10),
          status:      "Confirmed",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setBooked(true);
    } catch (err) {
      // 409 = already booked — show as booked state rather than error
      if (err.message === "You have already booked this event.") {
        setBooked(true);
      } else {
        setBookError(err.message);
      }
    } finally {
      setBooking(false);
    }
  }

  if (loading) return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">Loading event…</main>
  );

  if (error) return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/events" className="text-blue-600 hover:underline text-sm">← Back to Events</Link>
    </main>
  );

  const isFull      = event.status === "Full";
  const dateDisplay = event.date
    ? new Date(event.date).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Date TBC";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/events" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6 transition">
        ← Back to Events
      </Link>

      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title}
          className="w-full h-56 object-cover rounded-2xl mb-6 border border-slate-200" />
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[event.status] || "bg-slate-100 text-slate-600"}`}>
          {event.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <MetaItem icon={<Calendar size={18} className="text-slate-500" />} label="Date"     value={dateDisplay} />
        <MetaItem icon={<Clock    size={18} className="text-slate-500" />} label="Time"     value={event.time || "Time TBC"} />
        <MetaItem icon={<MapPin   size={18} className="text-slate-500" />} label="Location" value={event.location} />
        <MetaItem icon={<Tag      size={18} className="text-slate-500" />} label="Category" value={event.category || "General"} />
      </div>

      {event.description && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">About this event</h2>
          <p className="text-slate-600 leading-relaxed">{event.description}</p>
        </div>
      )}

      {event.status !== "Cancelled" && event.status !== "Completed" && (
        <div className="space-y-3">
          {booked ? (
            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl">
              ✓ You're registered — see you there!
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button onClick={handleBook} disabled={isFull || booking}
                className={`px-6 py-3 text-sm font-semibold rounded-xl transition ${
                  isFull
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
                }`}>
                {booking ? "Booking…" : isFull ? "Event Full" : user ? "Book My Spot" : "Sign In to Book"}
              </button>
              <Link to="/events" className="px-5 py-3 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Browse Other Events
              </Link>
            </div>
          )}
          {bookError && <p className="text-sm text-red-600">{bookError}</p>}
          {!user && !booked && (
            <p className="text-xs text-slate-400">
              You need to <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to book a spot.
            </p>
          )}
        </div>
      )}
    </main>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}