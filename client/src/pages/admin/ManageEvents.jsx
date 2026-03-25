import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { getEvents, saveEvents } from "../../data/mockData";

const STATUS_COLORS = {
  Upcoming:  "bg-blue-50 text-blue-700 border-blue-100",
  Full:      "bg-orange-50 text-orange-700 border-orange-100",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};

const BLANK = { title: "", date: "", time: "", location: "", capacity: "", status: "Upcoming", category: "" };

export default function ManageEvents() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [events, setEvents]     = useState(getEvents);
  const [form, setForm]         = useState(BLANK);
  const [editing, setEditing]   = useState(null); // id or null
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function openNew()    { setForm(BLANK); setEditing(null); setShowForm(true); }
  function openEdit(ev) { setForm({ ...ev, capacity: String(ev.capacity) }); setEditing(ev.id); setShowForm(true); }
  function cancel()     { setShowForm(false); setEditing(null); }

  function save(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) { alert("Title, date and location are required."); return; }
    let updated;
    if (editing) {
      updated = events.map((ev) => ev.id === editing ? { ...ev, ...form, capacity: Number(form.capacity) || 0 } : ev);
    } else {
      const newEv = { ...form, id: `evt-${Date.now()}`, booked: 0, capacity: Number(form.capacity) || 0 };
      updated = [...events, newEv];
    }
    saveEvents(updated);
    setEvents(updated);
    setShowForm(false);
    setEditing(null);
  }

  function remove(id) {
    if (!window.confirm("Delete this event?")) return;
    const updated = events.filter((ev) => ev.id !== id);
    saveEvents(updated);
    setEvents(updated);
  }

  const filtered = events.filter((ev) =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Events" back="/admin" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-sm text-slate-500">{events.length} total events</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
            + Add Event
          </button>
        </div>

        {/* Search */}
        <input
          type="text" placeholder="Search by title or location…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />

        {/* Add/Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">{editing ? "Edit Event" : "New Event"}</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *" value={form.title} onChange={(v) => update("title", v)} placeholder="Event name" full />
              <FormField label="Date *"  type="date" value={form.date}  onChange={(v) => update("date", v)} />
              <FormField label="Time"    value={form.time}  onChange={(v) => update("time", v)} placeholder="e.g. 9:00 AM – 12:00 PM" />
              <FormField label="Location *" value={form.location} onChange={(v) => update("location", v)} placeholder="Venue name" />
              <FormField label="Capacity" type="number" value={form.capacity} onChange={(v) => update("capacity", v)} placeholder="0" />
              <FormField label="Category" value={form.category} onChange={(v) => update("category", v)} placeholder="Community, Council…" />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20">
                  {["Upcoming","Full","Completed","Cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={cancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition">{editing ? "Save Changes" : "Create Event"}</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Capacity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400 text-sm">No events found.</td></tr>
              )}
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{ev.title}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{ev.date}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.location}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.booked}/{ev.capacity}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[ev.status] || "bg-slate-100 text-slate-600"}`}>{ev.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => openEdit(ev)} className="text-xs text-blue-600 hover:underline mr-3 font-semibold">Edit</button>
                    <button onClick={() => remove(ev.id)} className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
    </div>
  );
}

function AdminNav({ title, back }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={back || "/admin"} className="text-sm text-slate-500 hover:text-slate-900 transition">← Dashboard</Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <Link to="/" className="text-xs text-slate-400 hover:text-blue-600 transition">Public site →</Link>
      </div>
    </header>
  );
}