// Home.jsx — hero landing page, fully mobile responsive
import { Link } from "react-router-dom";
import background from "./img/cityview.png";

// Navigation cards shown on the hero — link to each main section
const CARDS = [
  { title: "Services",      link: "/services",      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { title: "Events",        link: "/events",        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { title: "Announcements", link: "/announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
  { title: "Feedback",      link: "/feedback",      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { title: "Contact",       link: "/contact",       icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default function Home() {
  return (
    <main
      className="relative w-full min-h-screen flex items-center justify-center bg-center bg-cover overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}>

      {/* Dark overlay over the background image */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Hero content — centred vertically and horizontally */}
      <div className="relative z-10 w-full px-4 py-12 sm:py-16 max-w-5xl mx-auto text-center">
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-8 sm:px-8 sm:py-10">

          {/* Heading — scales down on small screens */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-400 mb-3 leading-tight">
            Smart Community Portal
          </h1>

          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-2">
            Welcome to CityLink Initiatives.
          </p>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Access events, announcements, services and community feedback in one place.
          </p>

          {/* Card grid — 2 columns on mobile, 3 on tablet, 5 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {CARDS.map(({ title, link, icon }) => (
              <Card key={link} title={title} link={link} icon={icon} />
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/events"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm sm:text-base">
              Browse Events
            </Link>
            <Link to="/services"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition text-sm sm:text-base">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, link, icon }) {
  return (
    <Link to={link}
      className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl p-3 sm:p-4 transition text-center">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600/80 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-blue-500 transition">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="text-white text-xs sm:text-sm font-semibold leading-tight">{title}</p>
    </Link>
  );
}