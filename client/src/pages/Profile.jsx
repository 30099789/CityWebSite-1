// Profile.jsx — Sprint 3 Week 11
// Assessment requirement: User profile page with booking and feedback history
// Shows user name (editable), bookings, feedback and service requests
// Fetches latest user data from MongoDB on load so name survives page refresh

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, authHeaders } from "../context/AuthContext";
import BASE_URL from "../services/api";

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
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const userName  = user?.name  || "";
  const userEmail = user?.email || "";
  const userRole  = user?.role  || "resident";

  const [tab, setTab]       = useState("bookings");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved]     = useState(false);

  // Only name is editable — phone and suburb removed
  const [editName, setEditName] = useState(userName);

  const [myBookings, setMyBookings] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── Load data on mount ────────────────────────────────────────────
  // Fetches latest name from DB, bookings, feedback and service requests
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [uRes, bRes, fRes, rRes] = await Promise.all([
          fetch(`${BASE_URL}/users/${user._id}`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/bookings/my?email=${encodeURIComponent(userEmail)}`),
          fetch(`${BASE_URL}/feedback`),
          fetch(`${BASE_URL}/service-requests`),
        ]);

        // Update name from DB so it reflects any previous edits
        if (uRes.ok) {
          const userData = await uRes.json();
          setEditName(userData.name || userName);
        }

        const bookings = bRes.ok ? await bRes.json() : [];
        const feedback = fRes.ok ? await fRes.json() : [];
        const requests = rRes.ok ? await rRes.json() : [];

        setMyBookings(bookings);
        setMyFeedback(feedback.filter((f) => f.userEmail === userEmail));
        setMyRequests(requests.filter((r) => r.userEmail === userEmail));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userEmail, user?._id]);

  // Admin/staff redirect to admin portal
  if (user && (user.role === "admin" || user.role === "staff")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Icon path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" className="w-7 h-7 text-blue-700" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome, {user.name?.split(" ")[0]}</h2>
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
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign in to view your profile</h2>
          <p className="text-slate-500 text-sm mb-5">You need to be logged in to access this page.</p>
          <Link to="/login" className="inline-flex px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const roleLabel = { admin: "Administrator", staff: "Staff Member", resident: "Community Member" }[userRole] || "Member";
  const roleBadge = { admin: "bg-violet-100 text-violet-700", staff: "bg-blue-100 text-blue-700", resident: "bg-slate-100 text-slate-600" }[userRole] || "bg-slate-100 text-slate-600";

  // Save name only — sends { name } to PUT /api/users/:id
  async function handleSave() {
    await updateUser({ name: editName });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your account, bookings and feedback history.</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Profile card */}
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
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setEditName(userName); }}
                    className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="text-xs font-semibold text-white bg-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-800 transition">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">{getInitials(editName || userName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {editing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      className="text-lg font-bold text-slate-900 border-b-2 border-blue-300 focus:border-blue-700 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h2 className="text-lg font-bold text-slate-900">{editName || userName || "—"}</h2>
                  )}
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${roleBadge}`}>{roleLabel}</span>
                </div>
                <p className="text-sm text-slate-500">{userEmail}</p>
                <p className="text-xs text-slate-400 mt-1">Member since 2026</p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
            {[
              { label: "Bookings", value: myBookings.length },
              { label: "Requests", value: myRequests.length },
              { label: "Feedback", value: myFeedback.length },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{loading ? "—" : value}</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
            {[
              { id: "bookings", label: `Bookings (${myBookings.length})` },
              { id: "requests", label: `Requests (${myRequests.length})` },
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

          {/* Bookings tab */}
          {tab === "bookings" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">My Event Bookings</h3>
                <Link to="/events" className="text-xs font-semibold text-blue-700 hover:underline">Browse Events →</Link>
              </div>
              {loading ? (
                <p className="text-center text-slate-400 text-sm py-10">Loading…</p>
              ) : myBookings.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-600 mb-1">No bookings yet</p>
                  <p className="text-xs text-slate-400">Browse upcoming events and register your spot.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myBookings.map((b) => (
                    <div key={b._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
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

          {/* Requests tab */}
          {tab === "requests" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">My Service Requests</h3>
                <Link to="/services" className="text-xs font-semibold text-blue-700 hover:underline">Browse Services →</Link>
              </div>
              {loading ? (
                <p className="text-center text-slate-400 text-sm py-10">Loading…</p>
              ) : myRequests.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-600 mb-1">No service requests yet</p>
                  <p className="text-xs text-slate-400">Submit a request from the Services page.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myRequests.map((r) => (
                    <div key={r._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.serviceTitle || "Service Request"}</p>
                          {r.message && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.message}</p>}
                          <p className="text-xs text-slate-400 mt-0.5">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-AU") : ""}
                          </p>
                        </div>
                      </div>
                      <Badge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback tab */}
          {tab === "feedback" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">My Submitted Feedback</h3>
                <Link to="/feedback" className="text-xs font-semibold text-blue-700 hover:underline">New Feedback →</Link>
              </div>
              {loading ? (
                <p className="text-center text-slate-400 text-sm py-10">Loading…</p>
              ) : myFeedback.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-600 mb-1">No feedback submitted</p>
                  <p className="text-xs text-slate-400">Share your thoughts to help us improve.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myFeedback.map((f) => (
                    <div key={f._id} className="px-6 py-4 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{f.category || "Feedback"}</p>
                        <Badge status={f.status} />
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

        {/* Bottom grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Links</p>
            <div className="space-y-1">
              {[
                { label: "Browse Events",   to: "/events",        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Submit Feedback", to: "/feedback",      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
                { label: "Announcements",   to: "/announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
                { label: "Contact Us",      to: "/contact",       icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              ].map(({ label, to, icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition group">
                  <Icon path={icon} className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                  {label}
                  <Icon path="M9 5l7 7-7 7" className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Account</p>
            <div className="space-y-1">
              <Link to="/terms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition">
                <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-4 h-4 text-slate-400" />
                Terms of Service
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition">
                <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" className="w-4 h-4 text-slate-400" />
                Privacy Policy
              </Link>
              <div className="border-t border-slate-100 my-2" />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 font-semibold hover:bg-red-50 transition">
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