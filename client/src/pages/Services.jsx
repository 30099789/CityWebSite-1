// Services.jsx — Caio
// Sprint 2: Uses static service cards (no backend needed)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SERVICES = [
  { id: "s1", title: "Waste Collection",  category: "Waste",    description: "Request waste collection, report missed bins, or check your collection schedule." },
  { id: "s2", title: "Rates Enquiry",     category: "Finance",   description: "View your rates notice, make a payment, or enquire about payment plans and concessions." },
  { id: "s3", title: "Permits & Licences",category: "Permits",   description: "Apply for building permits, event permits, or business licences online." },
  { id: "s4", title: "Service Requests",  category: "General",   description: "Log a general service request — potholes, broken signs, maintenance issues, and more." },
  { id: "s5", title: "Community Grants",  category: "Grants",    description: "Apply for community development grants to fund local projects and initiatives." },
  { id: "s6", title: "Library Services",  category: "Libraries", description: "Borrow books, access digital resources, and find out about library events and programs." },
  { id: "s7", title: "Park Bookings",     category: "Facilities", description: "Reserve a park shelter, sports field, or community space for your event." },
  { id: "s8", title: "Dog Registration",  category: "Animals",   description: "Register your dog, update registration details, or report a lost or found animal." },
];

const CATEGORIES = ["All", ...Array.from(new Set(SERVICES.map((s) => s.category)))];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const visible = SERVICES.filter((s) => {
    const matchCat    = activeCategory === "All" || s.category === activeCategory;
    const searchLower = search.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(searchLower) ||
                        s.description.toLowerCase().includes(searchLower);
    return matchCat && matchSearch;
  });

  function handleBook(service) {
    if (!user) {
      navigate("/login");
      return;
    }
    alert(`Booking requested for: ${service.title}\n(Full booking flow coming in Sprint 3)`);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Community Services
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Browse and request CityLink services. Log in to submit a request or booking.
        </p>
      </section>

      {/* Search + filter */}
      <section className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Search services"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="text-slate-400">No services match your search.</p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isLoggedIn={!!user}
              onBook={() => handleBook(service)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function ServiceCard({ service, isLoggedIn, onBook }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col p-5">
      <div className="text-3xl mb-3">{service.icon}</div>
      <span className="text-xs font-semibold text-slate-400 mb-1">{service.category}</span>
      <h3 className="text-base font-bold text-slate-800 mb-2">{service.title}</h3>
      <p className="text-sm text-slate-500 flex-1 mb-4 leading-relaxed">{service.description}</p>
      <button
        onClick={onBook}
        className="mt-auto w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {!isLoggedIn && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        )}
        {isLoggedIn ? "Request Service" : "Log in to request"}
      </button>
    </div>
  );
}
