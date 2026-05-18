import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import { fetchEvents } from "../../services/eventService";
import { fetchAnnouncements } from "../../services/announcementService";
import { fetchFeedback } from "../../services/feedbackService";
import { fetchBookings } from "../../services/bookingService";
import { fetchUsers } from "../../services/userService";
import { fetchServices } from "../../services/serviceService";
import BASE_URL from "../../services/api";

/* ── ICONS ─────────────────────────────────────────────────────────────────── */
const I = ({ d, cls = "w-5 h-5" }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const ICONS = {
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users:     "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  chat:      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  bell:      "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  bookmark:  "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  arrow:     "M9 5l7 7-7 7",
  download:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  plus:      "M12 4v16m8-8H4",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  user:      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
};

/* ── KPI CARD ───────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ── MANAGEMENT ROW ─────────────────────────────────────────────────────────── */
function MgmtRow({ to, iconKey, label, count, unit }) {
  return (
    <Link to={to}
      className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <I d={ICONS[iconKey]} cls="w-4 h-4 text-blue-700" />
        </div>
        <span className="text-sm font-semibold text-slate-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== "" && <span className="text-xs text-slate-400 font-medium">{count} {unit}</span>}
        <I d={ICONS.arrow} cls="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
      </div>
    </Link>
  );
}

/* ── QUICK ACTION CARD ──────────────────────────────────────────────────────── */
function QuickCard({ iconKey, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition w-full">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <I d={ICONS[iconKey]} cls="w-6 h-6 text-blue-700" />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </button>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const isAdmin          = user?.role === "admin";

  const [toast, setToast]                 = useState(null);
  const [events, setEvents]               = useState([]);
  const [bookings, setBookings]           = useState([]);
  const [feedback, setFeedback]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers]                 = useState([]);
  const [services, setServices]           = useState([]);
  const [requests, setRequests]           = useState([]);

  useEffect(() => {
    fetchEvents().then(setEvents).catch(() => {});
    fetchBookings().then(setBookings).catch(() => {});
    fetchFeedback().then(setFeedback).catch(() => {});
    fetchAnnouncements().then(setAnnouncements).catch(() => {});
    fetchUsers().then(setUsers).catch(() => {});
    fetchServices().then(setServices).catch(() => {});
    fetch(`${BASE_URL}/service-requests`).then(r => r.json()).then(setRequests).catch(() => {});
  }, []);

  const activeBookings  = bookings.filter((b) => b.status === "Confirmed").length;
  const pendingFeedback = feedback.filter((f) => f.status === "New").length;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleLogout() { logout(); navigate("/login", { replace: true }); }

  const recentActivity = [
    { msg: "New booking: Community Clean-Up Day",       time: "5 min ago",  dot: "bg-blue-500"    },
    { msg: "Feedback received from alice@email.com",    time: "1 hr ago",   dot: "bg-orange-400"  },
    { msg: "Announcement published: Bin Night Changes", time: "2 hrs ago",  dot: "bg-emerald-500" },
    { msg: "Event updated: Town Hall Meeting",          time: "3 hrs ago",  dot: "bg-slate-400"   },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo variant="compact" />
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {[
              { label: "Home",          to: "/"              },
              { label: "Services",      to: "/services"      },
              { label: "Events",        to: "/events"        },
              { label: "FAQ",           to: "/faq"           },
              { label: "Announcements", to: "/announcements" },
              { label: "Feedback",      to: "/feedback"      },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm font-bold">
              <I d={ICONS.user} cls="w-4 h-4" />
              Admin Portal
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <I d={ICONS.user} cls="w-3.5 h-3.5 text-blue-700" />
              </div>
              <span className="hidden sm:block font-medium">{user?.name || user?.email}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <I d={ICONS.logout} cls="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>
          <I d={toast.type === "error" ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"} cls="w-4 h-4 flex-shrink-0 mt-0.5" />
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening in the community portal today.</p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <KpiCard label="Total Events"      value={events.length}       sub={`${events.filter(e => e.status === "Upcoming").length} upcoming`} />
          <KpiCard label="Active Bookings"   value={activeBookings}       sub="confirmed"       />
          <KpiCard label="Pending Feedback"  value={pendingFeedback}       sub="needs response"  />
          <KpiCard label="Service Requests"  value={pendingRequests}       sub="pending"         />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* QUICK ACTIONS */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickCard iconKey="plus"      label="Create Event"      onClick={() => navigate("/admin/events")}        />
              <QuickCard iconKey="bell"      label="Post Announcement" onClick={() => navigate("/admin/announcements")} />
              <QuickCard iconKey="briefcase" label="Manage Services"   onClick={() => navigate("/admin/services")}      />
              <QuickCard iconKey="download"  label="XML Manager"       onClick={() => navigate("/admin/xml")}           />
            </div>
          </section>

          {/* MANAGEMENT */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Management</h2>
            <div className="space-y-2">
              <MgmtRow to="/admin/events"           iconKey="calendar"  label="Manage Events"          count={events.length}        unit="events"        />
              <MgmtRow to="/admin/bookings"         iconKey="bookmark"  label="Manage Bookings"        count={activeBookings}        unit="bookings"      />
              <MgmtRow to="/admin/feedback"         iconKey="chat"      label="Manage Feedback"        count={pendingFeedback}       unit="submissions"   />
              <MgmtRow to="/admin/announcements"    iconKey="bell"      label="Manage Announcements"   count={announcements.length} unit="announcements" />
              <MgmtRow to="/admin/services"         iconKey="briefcase" label="Manage Services"        count={services.length}      unit="services"      />
              <MgmtRow to="/admin/service-requests" iconKey="clipboard" label="Service Requests"       count={pendingRequests}       unit="pending"       />
              <MgmtRow to="/admin/xml"              iconKey="download"  label="XML Import / Export"    count=""                     unit=""              />
              {isAdmin && <MgmtRow to="/admin/users" iconKey="users"    label="Manage Users"           count={users.length}         unit="users"         />}
            </div>
          </section>

        </div>

        {/* RECENT ACTIVITY */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${a.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{a.msg}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-slate-400 hover:text-blue-600 hover:underline transition">
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}