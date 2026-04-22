import { Link } from "react-router-dom";
import background from "./img/cityview.png";

export default function Home() {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <section
        className="relative min-h-screen bg-center bg-cover flex items-center justify-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-16 md:mb-20">
              <h1 className="text-4xl md:text-6xl font-bold text-blue-500 mb-4">
                Smart Community Portal
              </h1>

              <p className="text-white text-base md:text-lg max-w-4xl mx-auto">
                Welcome to CityLink Initiatives. Access events, announcements,
                services and community feedback in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              <Card title="Services" link="/services" />
              <Card title="Events" link="/events" />
              <Card title="Announcements" link="/announcements" />
              <Card title="Feedback" link="/feedback" />
              <Card title="Contact" link="/contact" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ title, link }) {
  return (
    <Link
      to={link}
      className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition duration-300 border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">Open {title}</p>
    </Link>
  );
}