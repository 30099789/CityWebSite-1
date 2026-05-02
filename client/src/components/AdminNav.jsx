// AdminNav.jsx — shared admin page header
// Used by ManageEvents, ManageAnnouncements, ManageBookings, etc.
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AdminNav({ title, back = "/admin" }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo variant="mark" />
          <div className="flex items-center gap-2 text-sm">
            <Link to={back} className="text-slate-500 hover:text-slate-900 transition font-medium">
              ← Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{title}</span>
          </div>
        </div>
        <Link to="/" className="text-xs text-slate-400 hover:text-blue-600 transition">
          Public site →
        </Link>
      </div>
    </header>
  );
}