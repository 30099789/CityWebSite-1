import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AdminNav from "../../components/AdminNav";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from "../../services/eventService";

const STATUS_COLORS = {
  Upcoming:  "bg-blue-50 text-blue-700 border-blue-100",
  Full:      "bg-orange-50 text-orange-700 border-orange-100",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};

const BLANK = { title: "", date: "", time: "", location: "", capacity: "", status: "Upcoming", category: "", imageUrl: "" };

export default function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState(BLANK);
  const [editing, setEditing]           = useState(null); // _id or null
  const [showForm, setShowForm]         = useState(false);
  const [search, setSearch]             = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError]     = useState("");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      showToast("Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function openNew() {
    setForm(BLANK); setEditing(null);
    setImagePreview(""); setImageError("");
    setShowForm(true);
  }

  function openEdit(ev) {
    setForm({ ...ev, capacity: String(ev.capacity) });
    setEditing(ev._id);
    setImagePreview(ev.imageUrl || "");
    setImageError("");
    setShowForm(true);
  }

  function cancel() { setShowForm(false); setEditing(null); setImagePreview(""); }

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImageError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024)    { setImageError("Image must be under 2 MB."); return; }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview("");
    update("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) {
      showToast("Title, date and location are required.", "error");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      // If a new file was selected, upload it first
      if (fileInputRef.current?.files[0]) {
        const result = await uploadEventImage(fileInputRef.current.files[0]);
        imageUrl = result.imageUrl;
      }

      const payload = { ...form, imageUrl, capacity: Number(form.capacity) || 0 };

      if (editing) {
        const updated = await updateEvent(editing, payload);
        setEvents((prev) => prev.map((ev) => ev._id === editing ? updated : ev));
        showToast("Event updated.");
      } else {
        const created = await createEvent(payload);
        setEvents((prev) => [created, ...prev]);
        showToast("Event created.");
      }
      setShowForm(false);
      setEditing(null);
      setImagePreview("");
    } catch (err) {
      showToast(err.message || "Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      showToast("Event deleted.");
    } catch {
      showToast("Failed to delete event.", "error");
    }
  }

  const filtered = events.filter((ev) =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Events" back="/admin" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
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
        <input type="text" placeholder="Search by title or location…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">{editing ? "Edit Event" : "New Event"}</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *"    value={form.title}    onChange={(v) => update("title", v)}    placeholder="Event name" full />
              <FormField label="Date *"     type="date" value={form.date} onChange={(v) => update("date", v)} />
              <FormField label="Time"       value={form.time}     onChange={(v) => update("time", v)}     placeholder="e.g. 9:00 AM – 12:00 PM" />
              <FormField label="Location *" value={form.location} onChange={(v) => update("location", v)} placeholder="Venue name" />
              <FormField label="Capacity"   type="number" value={form.capacity} onChange={(v) => update("capacity", v)} placeholder="0" />
              <FormField label="Category"   value={form.category} onChange={(v) => update("category", v)} placeholder="Community, Council…" />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20">
                  {["Upcoming","Full","Completed","Cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Image <span className="font-normal text-slate-400">(optional · max 2 MB)</span>
                </label>
                {imagePreview && (
                  <div className="relative mb-3 inline-block">
                    <img src={imagePreview} alt="Preview" className="h-36 w-auto rounded-xl border border-slate-200 object-cover shadow-sm" />
                    <button type="button" onClick={removeImage} aria-label="Remove image"
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow">
                      ✕
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition" />
                {imageError && <p className="mt-1.5 text-xs text-red-600">{imageError}</p>}
              </div>

              <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={cancel} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-slate-400 text-sm py-10 text-center">Loading events…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Image</th>
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
                  <tr><td colSpan="7" className="text-center py-10 text-slate-400 text-sm">No events found.</td></tr>
                )}
                {filtered.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3">
                      {ev.imageUrl ? (
                        <img src={ev.imageUrl} alt={ev.title} className="h-10 w-16 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="h-10 w-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 text-xs">No img</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{ev.title}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{ev.date}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.location}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.booked}/{ev.capacity}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[ev.status] || "bg-slate-100 text-slate-600"}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => openEdit(ev)} className="text-xs text-blue-600 hover:underline mr-3 font-semibold">Edit</button>
                      <button onClick={() => remove(ev._id)} className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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