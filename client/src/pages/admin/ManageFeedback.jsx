import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchFeedback, updateFeedback } from "../../services/feedbackService";

const STATUS_COLORS = {
  "New":         "bg-blue-50 text-blue-700 border-blue-100",
  "In Progress": "bg-orange-50 text-orange-700 border-orange-100",
  "Resolved":    "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Closed":      "bg-slate-100 text-slate-500 border-slate-200",
};
const STATUSES = ["New", "In Progress", "Resolved", "Closed"];

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

export default function ManageFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    fetchFeedback().then(data => { setFeedback(data); setLoading(false); });
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function changeStatus(id, status) {
    await updateFeedback(id, { status });
    setFeedback(f => f.map(item => item.id === id ? { ...item, status } : item));
  }

  async function submitResponse(id) {
    if (!response.trim()) return;
    await updateFeedback(id, { response, status: "Resolved" });
    setFeedback(f => f.map(item => item.id === id ? { ...item, response, status: "Resolved" } : item));
    setSelected(null);
    setResponse("");
    showToast("Response saved successfully.");
  }

  function openRow(id) {
    if (selected === id) { setSelected(null); setResponse(""); return; }
    const item = feedback.find(f => f.id === id);
    setSelected(id);
    setResponse(item?.response || "");
  }

  const categories = ["All", ...Array.from(new Set(feedback.map(f => f.category)))];
  const filtered   = feedback.filter(f => {
    const matchFilter = filter === "All" || f.category === filter;
    const matchSearch = f.userName?.toLowerCase().includes(search.toLowerCase()) ||
                        f.message?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: feedback.filter(f => f.status === s).length
  }), {});

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Feedback" />

      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Community Feedback</h1>
          <p className="text-sm text-slate-500">{feedback.length} total submissions</p>
        </div>

        {/* Status counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STATUSES.map(s => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm text-center">
              <div className="text-xl font-bold text-slate-900">{counts[s] || 0}</div>
              <div className="text-xs text-slate-500">{s}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
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

        {/* Loading */}
        {loading && <p className="text-center py-10 text-slate-400 text-sm">Loading feedback…</p>}

        {/* Feedback cards */}
        <div className="space-y-3">
          {!loading && filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400 text-sm">No feedback found.</p>
          )}
          {!loading && filtered.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {f.userName?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 text-sm">{f.userName}</div>
                    <div className="text-xs text-slate-400">{f.userEmail} · {f.submittedDate}</div>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {f.category}
                </span>
                <select value={f.status} onChange={e => changeStatus(f.id, e.target.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[f.status] || ""}`}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => openRow(f.id)}
                  className="text-xs font-semibold text-blue-600 hover:underline ml-auto sm:ml-0 flex-shrink-0">
                  {selected === f.id ? "Close ▲" : "View / Reply ▼"}
                </button>
              </div>

              <div className="px-5 pb-4">
                <p className="text-sm text-slate-600 line-clamp-2">{f.message}</p>
              </div>

              {selected === f.id && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                  <p className="text-sm text-slate-700"><span className="font-semibold">Full message:</span> {f.message}</p>
                  {f.response && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
                      <span className="font-semibold">Previous response:</span> {f.response}
                    </div>
                  )}
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
                    <button onClick={() => submitResponse(f.id)}
                      className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition">
                      Save Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}