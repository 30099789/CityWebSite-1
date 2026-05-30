// ManageFeedback.jsx — Sprint 3
// Assessment requirement: Admin can view and respond to community feedback submissions
// Feedback submitted by residents via the public /feedback page (POST /api/feedback)
// Assessment requirement: status workflow — New → In Progress → Resolved → Closed
// Assessment requirement: admin can write and save a response to each feedback item
// Assessment requirement: search by name/message and filter by category

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchFeedback, updateFeedback } from "../../services/feedbackService";

// ── Status colour map ──────────────────────────────────────────────────────────
// Visual indicator for the feedback resolution workflow
const STATUS_COLORS = {
  "New":         "bg-blue-50 text-blue-700 border-blue-100",
  "In Progress": "bg-orange-50 text-orange-700 border-orange-100",
  "Resolved":    "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Closed":      "bg-slate-100 text-slate-500 border-slate-200",
};

// All possible feedback statuses — used for counts and dropdown options
const STATUSES = ["New", "In Progress", "Resolved", "Closed"];

// ── AdminNav component ─────────────────────────────────────────────────────────
// Shared sticky header for admin pages
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

// ── ID helper ──────────────────────────────────────────────────────────────────
// Safely gets the unique identifier from a feedback item
// Supports both MongoDB _id and legacy id field for backwards compatibility
function getId(item) {
  return item._id || item.id;
}

export default function ManageFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);   // _id of expanded feedback item
  const [response, setResponse] = useState("");      // response text being typed
  const [filter, setFilter]     = useState("All");   // category filter
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState(null);

  // Load all feedback from MongoDB on mount
  // Assessment requirement: admin views all feedback submitted by residents
  useEffect(() => {
    fetchFeedback().then(data => { setFeedback(data); setLoading(false); });
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Status update ──────────────────────────────────────────────────────────
  // Assessment requirement: admin can update feedback status inline
  // Updates local state immediately for responsive UI, then persists to MongoDB
  // PUT /api/feedback/:id via updateFeedback service
  function changeStatus(id, status) {
    setFeedback(prev => prev.map(item => getId(item) === id ? { ...item, status } : item));
    updateFeedback(id, { status });
  }

  // ── Submit response ────────────────────────────────────────────────────────
  // Assessment requirement: admin can write a response to feedback submissions
  // Saves response text and automatically sets status to Resolved
  // PUT /api/feedback/:id — updates response and status fields
  async function submitResponse(id) {
    if (!response.trim()) return;
    setFeedback(prev => prev.map(item =>
      getId(item) === id ? { ...item, response, status: "Resolved" } : item
    ));
    updateFeedback(id, { response, status: "Resolved" });
    setSelected(null);
    setResponse("");
    showToast("Response saved successfully.");
  }

  // ── Toggle expanded row ────────────────────────────────────────────────────
  // Click View/Reply to expand a feedback item and see full message + response form
  // Click again to collapse
  function openRow(id) {
    if (selected === id) { setSelected(null); setResponse(""); return; }
    const item = feedback.find(f => getId(f) === id);
    setSelected(id);
    setResponse(item?.response || ""); // pre-fill with existing response if any
  }

  // Build category filter options from unique categories in the data
  const categories = ["All", ...Array.from(new Set(feedback.map(f => f.category).filter(Boolean)))];

  // Filter by category tab and search by name or message content
  const filtered = feedback.filter(f => {
    const matchFilter = filter === "All" || f.category === filter;
    const matchSearch = (f.userName || "").toLowerCase().includes(search.toLowerCase()) ||
                        (f.message  || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Count submissions per status for the summary cards
  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: feedback.filter(f => f.status === s).length
  }), {});

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Feedback" />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Community Feedback</h1>
          <p className="text-sm text-slate-500">{feedback.length} total submissions</p>
        </div>

        {/* Status summary cards — live counts per workflow stage */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STATUSES.map(s => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm text-center">
              <div className="text-xl font-bold text-slate-900">{counts[s] || 0}</div>
              <div className="text-xs text-slate-500">{s}</div>
            </div>
          ))}
        </div>

        {/* Search + category filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input type="text" placeholder="Search by name or message…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  filter === c ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {loading && <p className="text-center py-10 text-slate-400 text-sm">Loading feedback…</p>}

        {/* Feedback cards — expandable rows with inline status update and response form */}
        <div className="space-y-3">
          {!loading && filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400 text-sm">No feedback found.</p>
          )}
          {!loading && filtered.map(f => {
            const fId = getId(f);
            return (
              <div key={fId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Feedback summary row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* User avatar initials */}
                    <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(f.userName || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 text-sm">{f.userName}</div>
                      <div className="text-xs text-slate-400">{f.userEmail}{f.submittedDate ? ` · ${f.submittedDate}` : ""}</div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {f.category}
                  </span>

                  {/* Inline status dropdown — updates MongoDB on change */}
                  <select
                    value={f.status}
                    onChange={e => changeStatus(fId, e.target.value)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[f.status] || ""}`}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>

                  <button onClick={() => openRow(fId)}
                    className="text-xs font-semibold text-blue-600 hover:underline ml-auto sm:ml-0 flex-shrink-0">
                    {selected === fId ? "Close ▲" : "View / Reply ▼"}
                  </button>
                </div>

                {/* Message preview (truncated) */}
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{f.message}</p>
                </div>

                {/* Expanded view — full message and response form */}
                {selected === fId && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                    {/* Full message */}
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Full message:</span> {f.message}
                    </p>

                    {/* Show existing response if one was previously saved */}
                    {f.response && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
                        <span className="font-semibold">Previous response:</span> {f.response}
                      </div>
                    )}

                    {/* Response textarea — assessment requirement: admin can respond to feedback */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Response</label>
                      <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
                        placeholder="Type a response…"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setSelected(null); setResponse(""); }}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition">
                        Cancel
                      </button>
                      {/* Save response — also sets status to Resolved automatically */}
                      <button onClick={() => submitResponse(fId)}
                        className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition">
                        Save Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}