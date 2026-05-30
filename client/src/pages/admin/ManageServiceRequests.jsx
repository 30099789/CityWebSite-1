// ManageServiceRequests.jsx — Sprint 3
// Assessment requirement: Admin can view and manage resident service requests
// Service requests submitted by residents from the public Services page (POST /api/service-requests)
// Assessment requirement: status workflow — Pending → In Progress → Resolved → Closed
// Assessment requirement: search by name, email or service title
// Assessment requirement: inline status update and delete for admin management
// Note: this page uses direct fetch() calls instead of a service module
// as service-requests was added late in development without a dedicated service file

import { useState, useEffect } from "react";
import AdminNav from "../../components/AdminNav";
import BASE_URL from "../../services/api";
import { authHeaders } from "../../context/AuthContext";

// ── Status colour map ──────────────────────────────────────────────────────────
// Visual indicator for service request resolution workflow
const STATUS_STYLES = {
  Pending:       "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed:        "bg-slate-100 text-slate-500 border-slate-200",
};

// All possible service request statuses — used for filter tabs and dropdown
const STATUSES = ["Pending", "In Progress", "Resolved", "Closed"];

export default function ManageServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All"); // status filter
  const [toast, setToast]       = useState(null);

  // Load all service requests from MongoDB on mount
  // Assessment requirement: admin views all requests submitted by residents
  useEffect(() => { load(); }, []);

  // ── Fetch all service requests — GET /api/service-requests ────────────────
  // Assessment requirement: dynamic content loaded from MongoDB
  async function load() {
    try {
      const res  = await fetch(`${BASE_URL}/service-requests`, { headers: authHeaders() });
      const data = res.ok ? await res.json() : [];
      setRequests(data);
    } catch {
      showToast("Failed to load service requests.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Status update ──────────────────────────────────────────────────────────
  // Assessment requirement: admin updates request status inline from the table
  // PUT /api/service-requests/:id — updates status field
  // Updates local state immediately for responsive UI, then persists to MongoDB
  async function changeStatus(id, status) {
    try {
      const res = await fetch(`${BASE_URL}/service-requests/${id}`, {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      showToast("Status updated.");
    } catch {
      showToast("Failed to update status.", "error");
    }
  }

  // ── Delete handler ─────────────────────────────────────────────────────────
  // Assessment requirement: admin can permanently remove a service request
  // DELETE /api/service-requests/:id — admin/staff only
  async function remove(id) {
    if (!window.confirm("Delete this request?")) return;
    try {
      await fetch(`${BASE_URL}/service-requests/${id}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      showToast("Request deleted.");
    } catch {
      showToast("Failed to delete.", "error");
    }
  }

  const filters = ["All", ...STATUSES];

  // Filter by status tab and search by user name, email or service title
  const filtered = requests.filter((r) => {
    const matchFilter = filter === "All" || r.status === filter;
    const matchSearch =
      (r.userName     || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.serviceTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.userEmail    || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Count requests per status for the summary cards
  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: requests.filter((r) => r.status === s).length,
  }), {});

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Service Requests" />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-sm text-slate-500">{requests.length} total requests</p>
        </div>

        {/* Status summary cards — live counts per workflow stage */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {STATUSES.map((s) => (
            <div key={s} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 text-center">
              <p className="text-xl font-bold text-slate-900">{counts[s] || 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s}</p>
            </div>
          ))}
        </div>

        {/* Search + status filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input type="text" placeholder="Search by name, email or service…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Service requests table */}
        {loading ? (
          <p className="text-slate-400 text-sm text-center py-10">Loading requests…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400 text-sm">No requests found.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    {/* Resident name and email */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{r.userName}</p>
                      <p className="text-xs text-slate-400">{r.userEmail}</p>
                    </td>
                    {/* Service being requested */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{r.serviceTitle}</td>
                    {/* Resident's message — truncated, hidden on mobile */}
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell max-w-xs">
                      <p className="line-clamp-2">{r.message || "—"}</p>
                    </td>
                    {/* Date submitted — formatted for Australian locale */}
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden sm:table-cell">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-AU") : "—"}
                    </td>
                    {/* Inline status dropdown — PUT /api/service-requests/:id on change */}
                    <td className="px-4 py-3.5">
                      <select value={r.status} onChange={(e) => changeStatus(r._id, e.target.value)}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_STYLES[r.status] || ""}`}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => remove(r._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
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