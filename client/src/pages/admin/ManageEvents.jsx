// ManageEvents.jsx — Sprint 3
// Full CRUD connected to MongoDB backend with image upload support

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from "../../services/eventService";
import { uploadImage, getImageSrc } from "../../services/uploadService";

const STATUS_COLORS = {
  Upcoming:  "bg-blue-50 text-blue-700 border-blue-100",
  Full:      "bg-orange-50 text-orange-700 border-orange-100",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};

const BLANK = {
  title: "", date: "", time: "", location: "",
  description: "", capacity: "", status: "Upcoming", category: "", imageUrl: "",
};

export default function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents]         = useState([]);
  const [form, setForm]             = useState(BLANK);
  const [editing, setEditing]       = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true); setError(null);
    try { setEvents(await fetchEvents()); }
    catch { setError("Could not connect to the server. Is the backend running?"); }
    finally { setLoading(false); }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function openNew() { setForm(BLANK); setPreviewUrl(""); setEditing(null); setShowForm(true); }
  function openEdit(ev) {
    setForm({ title: ev.title||"", date: ev.date||"", time: ev.time||"", location: ev.location||"",
      description: ev.description||"", capacity: String(ev.capacity||""), status: ev.status||"Upcoming",
      category: ev.category||"", imageUrl: ev.imageUrl||"" });
    setPreviewUrl(ev.imageUrl ? getImageSrc(ev.imageUrl) : "");
    setEditing(ev._id); setShowForm(true);
  }
  function cancel() { setShowForm(false); setEditing(null); setPreviewUrl(""); }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      update("imageUrl", imageUrl);
      showToast("Image uploaded ✓");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
      setPreviewUrl("");
    } finally { setUploading(false); }
  }

  function removeImage() { update("imageUrl", ""); setPreviewUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }

  async function save(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !form.description) {
      showToast("Title, date, location and description are required.", "error"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) || 0 };
      if (editing) {
        const updated = await updateEvent(editing, payload);
        setEvents((prev) => prev.map((ev) => ev._id === editing ? updated : ev));
        showToast("Event updated ✓");
      } else {
        const created = await createEvent(payload);
        setEvents((prev) => [created, ...prev]);
        showToast("Event created ✓");
      }
      setShowForm(false); setEditing(null); setPreviewUrl("");
    } catch (err) { showToast(err.message || "Save failed", "error"); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this event?")) return;
    try { await deleteEvent(id); setEvents((prev) => prev.filter((ev) => ev._id !== id)); showToast("Deleted ✓"); }
    catch (err) { showToast(err.message || "Delete failed", "error"); }
  }

  async function changeStatus(id, status) {
    try {
      const updated = await updateEvent(id, { status });
      setEvents((prev) => prev.map((ev) => ev._id === id ? updated : ev));
    } catch (err) { showToast(err.message || "Status update failed", "error"); }
  }

  const filtered = events.filter((ev) =>
    (ev.title||"").toLowerCase().includes(search.toLowerCase()) ||
    (ev.location||"").toLowerCase().includes(search.toLowerCase())
  );

  const fieldCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Events" />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-sm text-slate-500">{events.length} total · MongoDB</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
            + Add Event
          </button>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={loadEvents} className="ml-4 text-xs font-semibold underline">Retry</button>
          </div>
        )}

        <input type="text" placeholder="Search by title or location…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20" />

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">{editing ? "Edit Event" : "New Event"}</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Event name" className={fieldCls} />
              </div>
              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description *</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe this event…" rows={3} className={fieldCls} />
              </div>
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={fieldCls} />
              </div>
              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time</label>
                <input type="text" value={form.time} onChange={(e) => update("time", e.target.value)} placeholder="e.g. 9:00 AM – 12:00 PM" className={fieldCls} />
              </div>
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location *</label>
                <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Venue name" className={fieldCls} />
              </div>
              {/* Capacity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Capacity</label>
                <input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="0" className={fieldCls} />
              </div>
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <input type="text" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Community, Council…" className={fieldCls} />
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)} className={fieldCls}>
                  {["Upcoming","Full","Completed","Cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Image</label>
                {previewUrl && (
                  <div className="relative mb-3 w-48">
                    <img src={previewUrl} alt="Preview" className="w-48 h-32 object-cover rounded-xl border border-slate-200" />
                    <button type="button" onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full w-6 h-6 text-xs text-red-500 hover:bg-red-50 font-bold shadow">
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className={`cursor-pointer px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {uploading ? "Uploading…" : previewUrl ? "Change Image" : "Choose Image"}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageChange} />
                  </label>
                  <span className="text-xs text-slate-400">JPG, PNG, GIF, WebP · max 5MB</span>
                </div>
              </div>
              {/* Buttons */}
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={cancel} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading from database…</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
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
                  <tr key={ev._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {ev.imageUrl ? (
                          <img src={getImageSrc(ev.imageUrl)} alt={ev.title} className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">📅</div>
                        )}
                        <span className="font-medium text-slate-800">{ev.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{ev.date}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.location}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{ev.booked || 0}/{ev.capacity || 0}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={ev.status}
                        onChange={e => changeStatus(ev._id, e.target.value)}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[ev.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {["Upcoming","Full","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
                      </select>
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

function AdminNav({ title }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-sm text-slate-500 hover:text-slate-900 transition">← Dashboard</Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <Link to="/" className="text-xs text-slate-400 hover:text-blue-600 transition">Public site →</Link>
      </div>
    </header>
  );
}