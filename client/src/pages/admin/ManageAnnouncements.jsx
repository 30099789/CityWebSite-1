import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AdminNav from "../../components/AdminNav";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementService";

const PRIORITY_COLORS = {
  Alert:  "bg-red-50 text-red-700 border-red-100",
  Update: "bg-blue-50 text-blue-700 border-blue-100",
  Notice: "bg-slate-100 text-slate-600 border-slate-200",
  high:   "bg-red-50 text-red-700 border-red-100",
  medium: "bg-blue-50 text-blue-700 border-blue-100",
  low:    "bg-slate-100 text-slate-600 border-slate-200",
};
const STATUS_COLORS = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Draft:     "bg-slate-100 text-slate-600 border-slate-200",
  draft:     "bg-slate-100 text-slate-600 border-slate-200",
  Scheduled: "bg-orange-50 text-orange-700 border-orange-100",
};
const BLANK = {
  title: "", summary: "", content: "", category: "",
  priority: "low", status: "draft", audience: "All",
  date: new Date().toISOString().slice(0, 10), author: "",
};

export default function ManageAnnouncements() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(BLANK);
  const [editing, setEditing]   = useState(null); // _id or null
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchAnnouncements();
      setItems(data);
    } catch {
      showToast("Failed to load announcements.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function openNew()    { setForm(BLANK); setEditing(null); setShowForm(true); window.scrollTo(0, 0); }
  function openEdit(a)  { setForm({ ...a, date: a.date ? new Date(a.date).toISOString().slice(0,10) : "" }); setEditing(a._id); setShowForm(true); window.scrollTo(0, 0); }
  function cancel()     { setShowForm(false); setEditing(null); }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      showToast("Title and summary are required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateAnnouncement(editing, form);
        setItems((prev) => prev.map((a) => a._id === editing ? updated : a));
        showToast("Announcement updated.");
      } else {
        const created = await createAnnouncement(form);
        setItems((prev) => [created, ...prev]);
        showToast(form.status === "published" ? "Announcement published!" : "Saved as draft.");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      showToast(err.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setItems((prev) => prev.filter((a) => a._id !== id));
      showToast("Announcement deleted.");
    } catch {
      showToast("Failed to delete.", "error");
    }
  }

  async function togglePublish(item) {
    const newStatus = item.status === "published" ? "draft" : "published";
    try {
      const updated = await updateAnnouncement(item._id, { ...item, status: newStatus });
      setItems((prev) => prev.map((a) => a._id === item._id ? updated : a));
      showToast(newStatus === "published" ? "Published — now live on public site." : "Moved back to draft.");
    } catch {
      showToast("Failed to update status.", "error");
    }
  }

  const statuses = ["All", "published", "draft"];
  const filtered = items.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const publishedCount = items.filter((a) => a.status === "published").length;
  const draftCount     = items.filter((a) => a.status === "draft").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="text-emerald-600 font-semibold">{publishedCount} published</span>
              {" · "}
              <span className="text-slate-400">{draftCount} drafts</span>
            </p>
          </div>
          <button onClick={openNew}
            className="px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition flex items-center gap-2 flex-shrink-0">
            + New Announcement
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input type="text" placeholder="Search announcements…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition capitalize ${
                  filter === s ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-5">{editing ? "Edit Announcement" : "New Announcement"}</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Bin Night Schedule Changes"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Summary *</label>
                <textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={2}
                  placeholder="Brief one or two sentence summary…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Content</label>
                <textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={4}
                  placeholder="Full announcement details…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <SelectField label="Priority" value={form.priority} onChange={(v) => update("priority", v)} options={["low","medium","high"]} />
              <SelectField label="Category" value={form.category} onChange={(v) => update("category", v)} options={["","Services","Events","Community","Roads","Environment","Grants","Waste","Rates","Libraries"]} />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status *</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="draft">Draft — save without publishing</option>
                  <option value="published">Published — visible on public website</option>
                </select>
              </div>
              <SelectField label="Audience" value={form.audience} onChange={(v) => update("audience", v)} options={["All","Residents","Staff"]} />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Author / Department</label>
                <input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="e.g. CityLink Services Team"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button type="button" onClick={cancel} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : form.status === "published" ? "Publish Now" : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-slate-400 text-sm py-10 text-center">Loading announcements…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-10 text-slate-400 text-sm">No announcements found.</td></tr>
                )}
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{a.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 hidden sm:block max-w-xs truncate">{a.summary}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PRIORITY_COLORS[a.priority] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[a.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell">
                      {a.date ? new Date(a.date).toLocaleDateString() : ""}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => togglePublish(a)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            a.status === "published"
                              ? "text-slate-500 border-slate-200 hover:bg-slate-50"
                              : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                          }`}>
                          {a.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => openEdit(a)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                        {isAdmin && <button onClick={() => remove(a._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>}
                      </div>
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

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}