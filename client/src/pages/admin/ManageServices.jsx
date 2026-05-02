// ManageServices.jsx — Sprint 3 (with image upload)
import { useState, useEffect, useRef } from "react";
import AdminNav from "../../components/AdminNav";
import { fetchServices, createService, updateService, deleteService, uploadServiceImage } from "../../services/serviceService";

const CATEGORIES = ["Waste", "Finance", "Permits", "Community", "Infrastructure", "Roads", "General"];

const BLANK = {
  title: "", description: "", category: "General",
  contact: { phone: "", email: "" }, imageUrl: "",
};

export default function ManageServices() {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(BLANK);
  const [editing, setEditing]       = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError]     = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch {
      showToast("Failed to load services.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function updateField(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function updateContact(field, val) {
    setForm((f) => ({ ...f, contact: { ...f.contact, [field]: val } }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function openNew() {
    setForm(BLANK);
    setEditing(null);
    setErrors({});
    setImagePreview("");
    setImageError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(s) {
    setForm({
      title:       s.title       || "",
      description: s.description || "",
      category:    s.category    || "General",
      contact: { phone: s.contact?.phone || "", email: s.contact?.email || "" },
      imageUrl:    s.imageUrl    || "",
    });
    setEditing(s._id);
    setErrors({});
    setImagePreview(s.imageUrl || "");
    setImageError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancel() {
    setShowForm(false); setEditing(null);
    setErrors({}); setImagePreview(""); setImageError("");
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImageError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024)    { setImageError("Image must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview("");
    updateField("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate() {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.category)           errs.category    = "Category is required.";
    if (!form.contact.phone.trim()) errs.phone = "Phone is required.";
    else if (!/^[0-9]{10}$/.test(form.contact.phone.trim())) errs.phone = "Phone must be 10 digits.";
    if (!form.contact.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email.trim())) errs.email = "Enter a valid email.";
    return errs;
  }

  async function save(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      // Upload image if a new file was selected
      if (fileInputRef.current?.files[0]) {
        const result = await uploadServiceImage(fileInputRef.current.files[0]);
        imageUrl = result.imageUrl;
      }

      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        contact:     { phone: form.contact.phone.trim(), email: form.contact.email.trim() },
        imageUrl,
      };

      if (editing) {
        const updated = await updateService(editing, payload);
        setServices((prev) => prev.map((s) => s._id === editing ? updated : s));
        showToast("Service updated.");
      } else {
        const created = await createService(payload);
        setServices((prev) => [created, ...prev]);
        showToast("Service created.");
      }
      setShowForm(false);
      setEditing(null);
      setImagePreview("");
    } catch (err) {
      showToast(err.message || "Failed to save service.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      showToast("Service deleted.");
    } catch {
      showToast("Failed to delete service.", "error");
    }
  }

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = (field) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? "border-red-300 focus:ring-red-500/20"
        : "border-slate-200 focus:ring-slate-900/10 focus:border-slate-400"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Services" />

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-sm text-slate-500">{services.length} total services</p>
          </div>
          <button onClick={openNew}
            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
            + Add Service
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-5">
              {editing ? "Edit Service" : "New Service"}
            </h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Waste Collection" className={inputClass("title")} />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description *</label>
                <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the service…"
                  className={`${inputClass("description")} resize-none`} />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => updateField("category", e.target.value)}
                  className={inputClass("category")}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="hidden sm:block" />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone * <span className="font-normal text-slate-400">(10 digits)</span></label>
                <input type="tel" value={form.contact.phone} onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder="0412345678" className={inputClass("phone")} />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Email *</label>
                <input type="email" value={form.contact.email} onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="service@citylink.com" className={inputClass("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Service Image <span className="font-normal text-slate-400">(optional · max 2 MB)</span>
                </label>
                {imagePreview && (
                  <div className="relative mb-3 inline-block">
                    <img src={imagePreview} alt="Preview"
                      className="h-36 w-auto rounded-xl border border-slate-200 object-cover shadow-sm" />
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

              <div className="sm:col-span-2 flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button type="button" onClick={cancel}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <input type="text" placeholder="Search by title or category…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-slate-400 text-sm text-center py-10">Loading services…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Image</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400 text-sm">No services found.</td></tr>
                )}
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.title}
                          className="h-10 w-16 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="h-10 w-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{s.description}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell">{s.contact?.phone}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell">{s.contact?.email}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => openEdit(s)} className="text-xs font-semibold text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => remove(s._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
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