import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBookings, getFeedback, getUsers, saveUsers } from "../data/mockData";

function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const STATUS_STYLES = {
  Confirmed:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled:     "bg-red-50 text-red-600 border-red-200",
  Pending:       "bg-amber-50 text-amber-700 border-amber-200",
  New:           "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-violet-50 text-violet-700 border-violet-200",
  Resolved:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed:        "bg-slate-100 text-slate-500 border-slate-200",
};

function Badge({ status }) {
  const s = status || "Unknown";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[s] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {s}
    </span>
  );
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Safe defaults — user object from localStorage may be incomplete
  const userName  = user?.name  || "";
  const userEmail = user?.email || "";
  const userRole  = user?.role  || "user";

  const [tab, setTab]           = useState("bookings");
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [editForm, setEditForm] = useState({
    name:   userName,
    phone:  user?.phone  || "",
    suburb: user?.suburb || "",
  });

  // Not logged in
  // Admin/staff redirect to their dashboard — they don't have a public profile
  if (user && (user.role === "admin" || user.role === "staff")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Icon path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" className="w-7 h-7 text-blue-700" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Welcome, {user.name?.split(" ")[0]}
          </h2>
          <p className="text-sm text-slate-500 mb-1">{user.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-6">
            {user.role === "admin" ? "Administrator" : "Staff Member"}
          </span>
          <div className="space-y-2">
            <Link to="/admin" className="block w-full px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition text-center">
              Go to Admin Portal
            </Link>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="block w-full px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign in to view your profile</h2>
          <p className="text-slate-500 text-sm mb-5">You need to be logged in to access this page.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Safe data fetching
  let myBookings = [];
  let myFeedback = [];
  try { myBookings = getBookings().filter((b) => b?.userEmail === userEmail); } catch {}
  try { myFeedback = getFeedback().filter((f) => f?.userEmail === userEmail); } catch {}

  const roleLabel = { admin: "Administrator", staff: "Staff Member", user: "Community Member" }[userRole] || "Member";
  const roleBadge = { admin: "bg-violet-100 text-violet-700", staff: "bg-blue-100 text-blue-700", user: "bg-slate-100 text-slate-600" }[userRole] || "bg-slate-100 text-slate-600";

  function handleSave() {
    try {
      const users = getUsers();
      const updated = users.map((u) => u?.email === userEmail ? { ...u, ...editForm } : u);
      saveUsers(updated);
      const stored = JSON.parse(localStorage.getItem("citylink_user") || "{}");
      localStorage.setItem("citylink_user", JSON.stringify({ ...stored, ...editForm }));
    } catch {}
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CityLink Initiatives</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your account, bookings and feedback history.</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</p>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <Icon path="M5 13l4 4L19 7" className="w-3 h-3" /> Saved
                </span>
              )}
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="text-xs font-semibold text-white bg-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-800 transition-colors">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">{getInitials(userName)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {editing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="text-lg font-bold text-slate-900 border-b-2 border-blue-300 focus:border-blue-700 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h2 className="text-lg font-bold text-slate-900">{userName || "—"}</h2>
                  )}
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${roleBadge}`}>{roleLabel}</span>
                </div>
                <p className="text-sm text-slate-500 mb-5">{userEmail}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Phone</p>
                    {editing ? (
                      <input value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Add phone number"
                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700" />
                    ) : (
                      <p className="text-sm text-slate-700">{editForm.phone || <span className="text-slate-400 italic">Not set</span>}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Suburb</p>
                    {editing ? (
                      <input value={editForm.suburb}
                        onChange={(e) => setEditForm((f) => ({ ...f, suburb: e.target.value }))}
                        placeholder="Add suburb"
                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700" />
                    ) : (
                      <p className="text-sm text-slate-700">{editForm.suburb || <span className="text-slate-400 italic">Not set</span>}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Member Since</p>
                    <p className="text-sm text-slate-700">{user?.joined || "2026"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
            {[
              { label: "Bookings", value: myBookings.length },
              { label: "Feedback", value: myFeedback.length },
              { label: "Resolved", value: myFeedback.filter((f) => f?.status === "Resolved" || f?.status === "Closed").length },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div>
          <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
            {[
              { id: "bookings", label: `Bookings (${myBookings.length})` },
              { id: "feedback", label: `Feedback (${myFeedback.length})` },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === id ? "bg-blue-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Bookings */}
          {tab === "bookings" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity</p>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">My Event Bookings</h3>
                </div>
                <Link to="/events" className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline">
                  Browse Events <Icon path="M9 5l7 7-7 7" className="w-3.5 h-3.5" />
                </Link>
              </div>
              {myBookings.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">No bookings yet</p>
                  <p className="text-xs text-slate-400">Browse upcoming events and register your spot.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{b.eventTitle || "Event"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Booked {b.bookingDate || ""}</p>
                        </div>
                      </div>
                      <Badge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {tab === "feedback" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity</p>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">My Submitted Feedback</h3>
                </div>
                <Link to="/feedback" className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline">
                  New Feedback <Icon path="M9 5l7 7-7 7" className="w-3.5 h-3.5" />
                </Link>
              </div>
              {myFeedback.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">No feedback submitted</p>
                  <p className="text-xs text-slate-400">Share your thoughts to help us improve.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myFeedback.map((f) => (
                    <div key={f.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {f.subject || (f.message || "").slice(0, 60) || "Feedback"}
                        </p>
                        <Badge status={f.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span>{f.category || ""}</span>
                        {f.category && <span>·</span>}
                        <span>{f.submittedDate || ""}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{f.message || ""}</p>
                      {f.response && (
                        <div className="mt-2.5 pl-3 border-l-2 border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">Staff Response</p>
                          <p className="text-xs text-slate-600">{f.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Links</p>
            <div className="space-y-1">
              {[
                { label: "Browse Events",   to: "/events",       icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Submit Feedback", to: "/feedback",     icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
                { label: "Announcements",   to: "/announcements",icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
                { label: "Contact Us",      to: "/contact",      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              ].map(({ label, to, icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                  <Icon path={icon} className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  {label}
                  <Icon path="M9 5l7 7-7 7" className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Account</p>
            <div className="space-y-1">
              <Link to="/terms"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-4 h-4 text-slate-400" />
                Terms of Service
              </Link>
              <Link to="/privacy"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" className="w-4 h-4 text-slate-400" />
                Privacy Policy
              </Link>
              <div className="border-t border-slate-100 my-2" />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors">
                <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}