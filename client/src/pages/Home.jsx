import { Link } from "react-router-dom";
import background from "./img/cityview.png"

export default function Home() {
  return (
    <main 
      className="relative w-full min-h-screen flex items-center justify-center bg-center bg-cover overflow-hidden" 
      style={{ backgroundImage: `url(${background})`}}  >
      <div className="absolute inset-0 bg-black/50"/>
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="mb-20 bg-black/75 p-10 rounded-lg "> 
        <h1 className="text-5xl md:text-6xl font-bold text-blue-500 mb-3">
          Smart Community Portal
        </h1>

        <p className="text-white text-lg max-w-4xl">
          Welcome to CityLink Initiatives. 
        </p>
        <p className="text-white text-lg max-w-4xl">
          Access events, announcements,
          services and community feedback in one place.
        </p>
      </section>

      {/* Cards Section */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">        
        <Card title="Services" link="/services" />
        <Card title="Events" link="/events" />        
        <Card title="Announcements" link="/announcements" />
        <Card title="Feedback" link="/feedback" />
        <Card title="Contact" link="/contact" />
      </section>
      </div>
    </main>
  );
}

function Card({ title, link }) {
  return (
    <Link
      to={link}
      className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition duration-300 border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-500">
        Open {title}
      </p>
    </Link>
  );
}