// Services.jsx — Sprint 3
// This page shows all council services loaded from MongoDB
// Residents can search and filter services by category
// Clicking "Request Service" opens a popup form to submit a service request
// If the user is not logged in, they are sent to the login page first

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BASE_URL from "../services/api";

// Icons for each service category — falls back to the default gear icon
const CATEGORY_ICONS = {
  Waste: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
    </svg>
  ),
  Permits: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  Community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  Infrastructure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Roads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  // Default icon used when no category match is found
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Small reusable icons for phone and email contact details
const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function Services() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [services, setServices]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected]             = useState(null);     // service currently open in modal
  const [message, setMessage]               = useState("");        // message typed in request form
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);     // true after successful request
  const [submitError, setSubmitError]       = useState(null);

  // Load all services from MongoDB when the page loads
  useEffect(() => {
    fetch(`${BASE_URL}/services`)
      .then((r) => r.json())
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build the list of category filter buttons from the services data
  // useMemo stops this recalculating on every render
  const categories = useMemo(() => ["All", ...new Set(services.map((s) => s.category))], [services]);

  // Filter services by the selected category and search text
  const visible = services.filter((s) => {
    const matchCat    = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Opens the service request popup — redirects to login if not signed in
  function openRequest(service) {
    if (!user) { navigate("/login"); return; }
    setSelected(service);
    setMessage("");
    setSubmitted(false);
    setSubmitError(null);
  }

  function closeModal() { setSelected(null); }

  // Submits the service request to the API
  // POST /api/service-requests — saves serviceId, title, user name, email and message
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${BASE_URL}/service-requests`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          serviceId:    selected._id,
          serviceTitle: selected.title,
          userName:     user.name,
          userEmail:    user.email,
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Page header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Community Services</h1>
          <p className="text-slate-500">Browse and request services from CityLink Initiatives.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Search input and category filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search services..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-5">
            Showing <span className="font-semibold text-slate-600">{visible.length}</span> of {services.length} services
          </p>
        )}

        {/* Loading skeleton while services are being fetched */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          // Empty state when no services match the current search or filter
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold mb-1">No services found</p>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your search or filter</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="text-sm font-semibold text-slate-900 hover:underline">Clear filters</button>
          </div>
        ) : (
          // Service cards grid
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((service) => (
              <ServiceCard key={service._id} service={service} isLoggedIn={!!user}
                onRequest={() => openRequest(service)} />
            ))}
          </div>
        )}
      </div>

      {/* Service request popup modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Success screen shown after the request is submitted */}
            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Request Submitted</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  We've received your request for <span className="font-semibold text-slate-800">{selected.title}</span>.
                  Our team will follow up at <span className="font-semibold text-slate-800">{user.email}</span>.
                </p>
                <button onClick={closeModal}
                  className="px-8 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Modal header — shows service image if available, otherwise icon + title */}
                {selected.imageUrl ? (
                  <div className="relative h-40 overflow-hidden">
                    <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-5">
                      <div>
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">{selected.category}</p>
                        <h2 className="text-white text-lg font-bold">{selected.title}</h2>
                      </div>
                    </div>
                    <button onClick={closeModal}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        {CATEGORY_ICONS[selected.category] || CATEGORY_ICONS.default}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{selected.category}</p>
                        <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="p-6">
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">{selected.description}</p>

                  {/* Contact details — phone and email links */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <a href={`tel:${selected.contact?.phone}`}
                      className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 transition">
                      <span className="text-slate-500"><PhoneIcon /></span>
                      <div>
                        <p className="text-xs text-slate-400 leading-none mb-0.5">Phone</p>
                        <p className="text-sm font-semibold text-slate-700">{selected.contact?.phone || "N/A"}</p>
                      </div>
                    </a>
                    <a href={`mailto:${selected.contact?.email}`}
                      className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 transition">
                      <span className="text-slate-500"><MailIcon /></span>
                      <div>
                        <p className="text-xs text-slate-400 leading-none mb-0.5">Email</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{selected.contact?.email || "N/A"}</p>
                      </div>
                    </a>
                  </div>

                  {/* Request form — message is optional */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Message <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                        placeholder="Describe your request in detail..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                    </div>
                    {/* Error message if the request fails */}
                    {submitError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button type="button" onClick={closeModal}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                        {submitting ? "Submitting…" : <><span>Submit Request</span><ArrowIcon /></>}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// Individual service card — shows image or icon, title, description and contact details
// "Request Service" button opens the modal; shows "Sign In to Request" if not logged in
function ServiceCard({ service, isLoggedIn, onRequest }) {
  const icon = CATEGORY_ICONS[service.category] || CATEGORY_ICONS.default;
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Service image — Base64 stored in MongoDB */}
      {service.imageUrl ? (
        <div className="relative h-44 overflow-hidden">
          <img src={service.imageUrl} alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {icon}{service.category}
            </span>
          </div>
        </div>
      ) : (
        // Placeholder when no image has been uploaded
        <div className="h-44 bg-slate-100 flex flex-col items-center justify-center gap-3 border-b border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500">
            {icon}
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{service.category}</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{service.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-3">{service.description}</p>

        {/* Contact details */}
        <div className="space-y-1.5 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <PhoneIcon /><span>{service.contact?.phone || "Not available"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MailIcon /><span className="truncate">{service.contact?.email || "Not available"}</span>
          </div>
        </div>

        {/* Request button — greyed out if not logged in */}
        <button onClick={onRequest}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isLoggedIn ? "bg-slate-900 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-400 cursor-default"
          }`}>
          {isLoggedIn ? <><span>Request Service</span><ArrowIcon /></> : "Sign In to Request"}
        </button>
      </div>
    </div>
  );
}