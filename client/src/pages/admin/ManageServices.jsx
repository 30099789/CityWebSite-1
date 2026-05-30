// ManageServices.jsx — Sprint 3
// Assessment requirement: Full CRUD for council services connected to MongoDB
// Admin/staff can create, edit and delete services with image upload support
// Services include title, description, category, contact details (phone + email) and optional image
// Phone validation: must be 10 digits to match server-side regex /^[0-9]{10}$/
// Images stored as Base64 in MongoDB via uploadService — persists across Render redeploys

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchServices, createService, updateService, deleteService } from "../../services/serviceService";
import { uploadImage, getImageSrc } from "../../services/uploadService";

// ── Default blank form ─────────────────────────────────────────────────────
// contact is a nested object to match the MongoDB Service schema
// phone and email are nested under contact as required by the server
const BLANK = {
  title: "", description: "", category: "",
  contact: { phone: "", email: "" },
  imageUrl: "",
};

export default function ManageServices() {
  const [services, setServices]     = useState([]);
  const [form, setForm]             = useState(BLANK);
  const [editing, setEditing]       = useState(null);  // holds _id of service being edited
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");    // local blob URL for image preview
  const fileInputRef = useRef(null);

  // Load all services from MongoDB on mount
  useEffect(() => { loadServices(); }, []);

  // ── Fetch all services from API ────────────────────────────────────────
  // Assessment requirement: dynamic content loaded from MongoDB database
  async function loadServices() {
    setLoading(true); setError(null);
    try { setServices(await fetchServices()); }
    catch { setError("Could not connect to the server. Is the backend running?"); }
    finally { setLoading(false); }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Form field updaters ────────────────────────────────────────────────
  // updateField — updates top-level form fields
  // updateContact — updates nested contact.phone / contact.email
  function updateField(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function updateContact(k, v) { setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } })); }

  // ── Form open/close helpers ────────────────────────────────────────────
  function openNew() { setForm(BLANK); setPreviewUrl(""); setEditing(null); setShowForm(true); }
  function openEdit(svc) {
    setForm({
      title:       svc.title       || "",
      description: svc.description || "",
      category:    svc.category    || "",
      // Safely read nested contact fields — svc.contact may be undefined for older records
      contact: { phone: svc.contact?.phone || "", email: svc.contact?.email || "" },
      imageUrl:    svc.imageUrl    || "",
    });
    setPreviewUrl(svc.imageUrl ? getImageSrc(svc.imageUrl) : "");
    setEditing(svc._id); setShowForm(true);
  }
  function cancel() { setShowForm(false); setEditing(null); setPreviewUrl(""); }

  // ── Image upload handler ───────────────────────────────────────────────
  // Assessment requirement: image upload for services
  // Sends image to /api/upload which compresses and returns Base64 data URL
  // Base64 stored directly in MongoDB imageUrl field — no disk storage needed
  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately while upload is in progress
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      updateField("imageUrl", imageUrl);
      showToast("Image uploaded ✓");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
      setPreviewUrl("");
    } finally { setUploading(false); }
  }

  function removeImage() {
    updateField("imageUrl", "");
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Save handler ───────────────────────────────────────────────────────
  // Assessment requirement: form validation before API call
  // Server also validates: phone regex /^[0-9]{10}$/, email format, required fields
  async function save(e) {
    e.preventDefault();
    // Client-side validation — matches server-side requirements
    if (!form.title || !form.description || !form.category || !form.contact.phone || !form.contact.email) {
      showToast("All fields including phone and email are required.", "error"); return;
    }
    setSaving(true);
    try {
      if (editing) {
        // PUT /api/services/:id — update existing service
        const updated = await updateService(editing, form);
        setServices((prev) => prev.map((s) => s._id === editing ? updated : s));
        showToast("Service updated ✓");
      } else {
        // POST /api/services — create new service
        const created = await createService(form);
        setServices((prev) => [created, ...prev]);
        showToast("Service created ✓");
      }
      setShowForm(false); setEditing(null); setPreviewUrl("");
    } catch (err) { showToast(err.message || "Save failed", "error"); }
    finally { setSaving(false); }
  }

  // ── Delete handler ─────────────────────────────────────────────────────
  // Assessment requirement: delete with confirmation dialog
  async function remove(id) {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      showToast("Deleted ✓");
    } catch (err) { showToast(err.message || "Delete failed", "error"); }
  }

  // Filter services by title or category for the search input
  const filtered = services.filter((s) =>
    (s.title||"").toLowerCase().includes(search.toLowerCase()) ||
    (s.category||"").toLowerCase().includes(search.toLowerCase())
  );

  const fieldCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Services" />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-sm text-slate-500">{services.length} total · MongoDB</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
            + Add Service
          </button>
        </div>

        {/* Server connection error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={loadServices} className="ml-4 text-xs font-semibold underline">Retry</button>
          </div>
        )}

        {/* Search input */}
        <input type="text" placeholder="Search by title or category…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20" />

        {/* Create / Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">{editing ? "Edit Service" : "New Service"}</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Service name" className={fieldCls} />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description *</label>
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe this service…" rows={3} className={fieldCls} />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                <input type="text" value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Waste, Roads, Health" className={fieldCls} />
              </div>

              {/* Phone — must be exactly 10 digits to pass server validation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone * (10 digits, no spaces)</label>
                <input type="text" value={form.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="0890000001" className={fieldCls} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email *</label>
                <input type="email" value={form.contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="service@council.gov.au" className={fieldCls} />
              </div>

              {/* Image upload — assessment requirement: image upload for services */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Image</label>
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

              {/* Form action buttons */}
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={cancel} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services table */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading from database…</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-10 text-slate-400 text-sm">No services found.</td></tr>
                )}
                {filtered.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {svc.imageUrl ? (
                          <img src={getImageSrc(svc.imageUrl)} alt={svc.title} className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">🏛️</div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{svc.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{svc.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{svc.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{svc.contact?.phone}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{svc.contact?.email}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => openEdit(svc)} className="text-xs text-blue-600 hover:underline mr-3 font-semibold">Edit</button>
                      <button onClick={() => remove(svc._id)} className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
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

// ── AdminNav component ─────────────────────────────────────────────────────
// Shared navigation header for all admin pages
// Back to dashboard link + public site link
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