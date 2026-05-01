import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/services";

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    return ["All", ...new Set(services.map((s) => s.category))];
  }, [services]);

  const visible = services.filter((s) => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const searchLower = search.toLowerCase();

    const matchSearch =
      s.title.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower);

    return matchCat && matchSearch;
  });

  function handleBook(service) {
    if (!user) {
      navigate("/login");
      return;
    }

    alert(`Booking requested for: ${service.title}`);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Community Services
        </h1>

        <p className="text-slate-500 text-lg max-w-2xl">
          Browse and request CityLink services. Log in to submit a request or
          booking.
        </p>
      </section>

      <section className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Search services"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
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

      {loading ? (
        <p className="text-slate-400">Loading services...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-400">No services found.</p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((service) => (
            <ServiceCard
              key={service._id}
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
      <span className="text-xs font-semibold text-slate-400 mb-1">
        {service.category}
      </span>

      <h3 className="text-base font-bold text-slate-800 mb-2">
        {service.title}
      </h3>

      <p className="text-sm text-slate-500 flex-1 mb-4 leading-relaxed">
        {service.description}
      </p>

      <p className="text-xs text-slate-400 mb-1">
        Phone: {service.contact?.phone || "Not available"}
      </p>

      <p className="text-xs text-slate-400 mb-4">
        Email: {service.contact?.email || "Not available"}
      </p>

      <button
        onClick={onBook}
        className="mt-auto w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {isLoggedIn ? "Request Service" : "Log in to request"}
      </button>
    </div>
  );
}