import { useState } from "react";
import { Link } from "react-router-dom";
import { getBookings, saveBookings } from "../../data/mockData";

const STATUS_COLORS = {
  Confirmed:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  Pending:    "bg-orange-50 text-orange-700 border-orange-100",
  Cancelled:  "bg-red-50 text-red-700 border-red-100",
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState(getBookings);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");

  function changeStatus(id, status) {
    const updated = bookings.map((b) => b.id === id ? { ...b, status } : b);
    saveBookings(updated);
    setBookings(updated);
  }

  function remove(id) {
    if (!window.confirm("Remove this booking?")) return;
    const updated = bookings.filter((b) => b.id !== id);
    saveBookings(updated);
    setBookings(updated);
  }

  const statuses = ["All", "Confirmed", "Pending", "Cancelled"];
  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "All" || b.status === filter;
    const matchSearch = b.userName.toLowerCase().includes(search.toLowerCase()) ||
                        b.eventTitle.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = statuses.slice(1).reduce((acc, s) => ({ ...acc, [s]: bookings.filter((b) => b.status === s).length }), {});

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Bookings" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500">{bookings.length} total bookings</p>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statuses.slice(1).map((s) => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm text-center">
              <div className="text-xl font-bold text-slate-900">{counts[s] || 0}</div>
              <div className="text-xs text-slate-500">{s}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input type="text" placeholder="Search by name or event…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Booking Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="text-center py-10 text-slate-400 text-sm">No bookings found.</td></tr>
              )}
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{b.userName}</div>
                    <div className="text-xs text-slate-400">{b.userEmail}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 hidden sm:table-cell">{b.eventTitle}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{b.bookingDate}</td>
                  <td className="px-4 py-3.5">
                    <select value={b.status} onChange={(e) => changeStatus(b.id, e.target.value)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[b.status] || ""}`}>
                      <option>Confirmed</option>
                      <option>Pending</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => remove(b.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
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
