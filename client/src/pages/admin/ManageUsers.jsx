// ManageUsers.jsx — Sprint 3 Week 11
// Assessment requirement: User management with role-based access control (RBAC)
// Admin can create, edit and delete user accounts with roles: resident / staff / admin
// Uses /api/users/admin-create for new users — keeps admin session active (register endpoint would log admin out)
// Password hashed server-side with bcryptjs — never stored in plain text
// Client-side validation mirrors server-side rules (min 6 chars, email format, required fields)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../services/userService";
import AdminNav from "../../components/AdminNav";

// ── Role badge colour map ──────────────────────────────────────────────────
// Visual distinction between admin / staff / resident roles in the table
const ROLE_STYLES = {
  admin:    "bg-blue-50 text-blue-700 border-blue-100",
  staff:    "bg-amber-50 text-amber-700 border-amber-100",
  resident: "bg-slate-100 text-slate-600 border-slate-200",
};

// ── Blank form state ───────────────────────────────────────────────────────
// confirmPassword is frontend-only — never sent to the API
const BLANK = { name: "", email: "", role: "resident", password: "", confirmPassword: "" };

export default function ManageUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingId, setEditingId]   = useState(null);  // _id of user being edited, null when creating
  const [form, setForm]             = useState(BLANK);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast]           = useState(null);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);

  // Load all users from MongoDB on mount
  // Assessment requirement: admin can view all registered users
  useEffect(() => { load(); }, []);

  // ── Fetch all users — GET /api/users ───────────────────────────────────
  // Protected route — requires admin or staff JWT token
  async function load() {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Clear field-level error when user starts typing in that field
  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  // ── Open create form ───────────────────────────────────────────────────
  function openNew() {
    setForm(BLANK);
    setEditingId(null);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Open edit form ─────────────────────────────────────────────────────
  // Password fields are always blank when editing — admin must type a new one to change it
  // This prevents accidentally overwriting passwords when only updating role or name
  function openEdit(user) {
    setForm({
      name:            user.name  || "",
      email:           user.email || "",
      role:            user.role  || "resident",
      password:        "",
      confirmPassword: "",
    });
    setEditingId(user._id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  }

  // ── Client-side validation ─────────────────────────────────────────────
  // Assessment requirement: form validation with error messages
  // Rules mirror server-side validation in userRoutes.js
  function validate() {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";

    if (!editingId) {
      // Creating — password is required
      if (!form.password) errs.password = "Password is required.";
      else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
      if (form.password && form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    } else {
      // Editing — password is optional; only validate if admin typed one
      if (form.password) {
        if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
        if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
      }
    }
    return errs;
  }

  // ── Submit handler ─────────────────────────────────────────────────────
  // Assessment requirement: CRUD operations for user management
  // Creating: POST /api/users/admin-create (keeps admin session, allows any role)
  // Editing:  PUT /api/users/:id (updates name, email, role; hashes new password if provided)
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      // confirmPassword is validation-only — never sent to the server
      const payload = {
        name:  form.name.trim(),
        email: form.email.trim(),
        role:  form.role,
        ...(form.password ? { password: form.password } : {}),
      };

      if (editingId) {
        await updateUser(editingId, payload);
        showToast("User updated.");
      } else {
        await createUser(payload);
        showToast("User created.");
      }
      setShowForm(false);
      setEditingId(null);
      load(); // refresh user list from DB
    } catch (err) {
      showToast(err.message || "Failed to save user.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handler ─────────────────────────────────────────────────────
  // Assessment requirement: delete with confirmation — admin only (requireAdminOnly middleware)
  async function handleDelete(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      showToast("User deleted.");
      load();
    } catch {
      showToast("Failed to delete user.", "error");
    }
  }

  // Filter users by name/email search and role dropdown
  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Summary counts for the stats cards
  const counts = {
    total:    users.length,
    admin:    users.filter((u) => u.role === "admin").length,
    staff:    users.filter((u) => u.role === "staff").length,
    resident: users.filter((u) => u.role === "resident").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Users" />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">{users.length} total accounts</p>
          </div>
          <button onClick={openNew}
            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
            + Add User
          </button>
        </div>

        {/* Stats cards — shows breakdown by role */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",     value: counts.total,    color: "text-slate-900" },
            { label: "Admins",    value: counts.admin,    color: "text-blue-600"  },
            { label: "Staff",     value: counts.staff,    color: "text-amber-600" },
            { label: "Residents", value: counts.resident, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-5">
              {editingId ? "Edit User" : "New User"}
            </h2>

            {/* noValidate disables browser validation — we use our own */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Alice Johnson"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                    errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-slate-900/10"
                  }`} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  placeholder="user@email.com"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                    errors.email ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-slate-900/10"
                  }`} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Role — assessment requirement: RBAC with resident / staff / admin roles */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role *</label>
                <select value={form.role} onChange={(e) => update("role", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="hidden sm:block" />

              {/* Password — assessment requirement: secure password with bcrypt hashing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password {editingId && <span className="font-normal text-slate-400">(leave blank to keep current)</span>}
                  {!editingId && " *"}
                </label>
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                  placeholder={editingId ? "Enter new password to change" : "Minimum 6 characters"}
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                    errors.password ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-slate-900/10"
                  }`} />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm password — client-side only, not sent to server */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password {!editingId && "*"}
                </label>
                <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                    errors.confirmPassword ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-slate-900/10"
                  }`} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Form actions */}
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button type="button" onClick={cancel}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search + role filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-white">
            <option value="all">All Roles</option>
            <option value="resident">Residents</option>
            <option value="staff">Staff</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users table */}
        {loading ? (
          <p className="text-slate-400 text-sm text-center py-10">Loading users…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-10 text-slate-400 text-sm">No users found.</td></tr>
                )}
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    {/* Avatar initial + name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{u.email}</td>
                    {/* Role badge with colour-coded style */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_STYLES[u.role] || ROLE_STYLES.resident}`}>
                        {u.role}
                      </span>
                    </td>
                    {/* Join date formatted for Australian locale */}
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => openEdit(u)} className="text-xs font-semibold text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
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