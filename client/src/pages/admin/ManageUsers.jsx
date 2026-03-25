import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchUsers, updateUser, deleteUser } from "../../services/userService";

const ROLE_COLORS   = { admin: "bg-blue-50 text-blue-700 border-blue-100", staff: "bg-emerald-50 text-emerald-700 border-emerald-100", user: "bg-slate-100 text-slate-600 border-slate-200" };
const STATUS_COLORS = { Active: "bg-green-50 text-green-700 border-green-100", Inactive: "bg-red-50 text-red-700 border-red-100" };

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

export default function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast]   = useState(null);

  function loadUsers() {
    setLoading(true);
    fetchUsers().then(data => { setUsers(data); setLoading(false); });
  }

  useEffect(() => { loadUsers(); }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleStatus(id) {
    const u = users.find(u => u.id === id);
    const newStatus = u.status === "Active" ? "Inactive" : "Active";
    await updateUser(id, { status: newStatus });
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(`User ${newStatus === "Active" ? "activated" : "deactivated"}.`);
  }

  async function changeRole(id, role) {
    await updateUser(id, { role });
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    showToast(`Role updated to ${role}.`);
  }

  async function removeUser(id) {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
    showToast("User removed.");
  }

  const roles = ["All", "admin", "staff", "user"];
  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filter === "All" || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Users" />

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">{users.length} registered accounts</p>
          </div>
          <button onClick={loadUsers}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {["admin","staff","user"].map(role => (
            <div key={role} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-900">{users.filter(u => u.role === role).length}</div>
              <div className="text-xs text-slate-500 capitalize">{role}s</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="Search name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          <div className="flex gap-2">
            {roles.map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  filter === r ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{r}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400 text-sm">Loading users…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-10 text-slate-400 text-sm">No users found.</td></tr>
              )}
              {!loading && filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${ROLE_COLORS[u.role] || ""}`}>
                      <option value="user">user</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[u.status] || ""}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{u.joined}</td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button onClick={() => toggleStatus(u.id)}
                      className={`text-xs font-semibold hover:underline ${u.status === "Active" ? "text-orange-500" : "text-green-600"}`}>
                      {u.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => removeUser(u.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}