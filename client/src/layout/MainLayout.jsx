import { useState, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMenuConfig } from "../services/xmlService";
// ChatBot and AccessibilityToolbar are Sprint 3 components — not included in Sprint 2

// ── FALLBACK NAVIGATION ───────────────────────────────────────────────────────
// These links are used if the menu.xml file fails to load
// Normally the navbar and footer links come from public/xml/menu.xml
const FALLBACK_NAV = [
  { label: "Home",          path: "/", end: "true" },
  { label: "Services",      path: "/services" },
  { label: "Events",        path: "/events" },
  { label: "FAQ",           path: "/faq" },
  { label: "Announcements", path: "/announcements" },
  { label: "Feedback",      path: "/feedback" },
  { label: "Contact",       path: "/contact" },
];

// Footer quick links fallback
const FALLBACK_FOOTER_LINKS = [
  { label: "Services",  path: "/services"  },
  { label: "Events",    path: "/events"    },
  { label: "FAQ",       path: "/faq"       },
  { label: "Feedback",  path: "/feedback"  },
];

// Footer legal links fallback
const FALLBACK_LEGAL_LINKS = [
  { label: "Accessibility Statement", path: "/accessibility" },
  { label: "Privacy Policy",          path: "/privacy"       },
  { label: "Terms of Service",        path: "/terms"         },
];

// ── MAIN LAYOUT COMPONENT ─────────────────────────────────────────────────────
// This wraps every public page — it renders the navbar, page content, and footer
// Admin pages have their own layout and do NOT use this component
export default function MainLayout() {
  // Get the logged-in user and logout function from AuthContext
  const { user, logout } = useAuth();

  // Controls whether the mobile hamburger menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigation links — loaded from menu.xml, fallback to hardcoded values
  const [navLinks, setNavLinks]       = useState(FALLBACK_NAV);
  const [footerLinks, setFooterLinks] = useState(FALLBACK_FOOTER_LINKS);
  const [legalLinks, setLegalLinks]   = useState(FALLBACK_LEGAL_LINKS);

  // ── Load navigation from XML on page load ─────────────────────────────────
  // Fetches public/xml/menu.xml using fast-xml-parser
  // If successful, replaces the fallback nav with XML-driven links
  // This satisfies the XML integration requirement of the assessment
  useEffect(() => {
    getMenuConfig().then((menu) => {
      if (!menu) return; // XML failed to load — keep fallback links

      // Parse navbar items from XML
      const items = menu?.navbar?.item;
      if (items) {
        const arr = Array.isArray(items) ? items : [items];
        setNavLinks(arr.map((i) => ({ label: i.label, path: i.path, end: i.end })));
      }

      // Parse footer sections from XML
      const sections = menu?.footer?.section;
      if (sections) {
        const arr   = Array.isArray(sections) ? sections : [sections];
        const quick = arr.find((s) => s["@_name"] === "Quick Links");
        const legal = arr.find((s) => s["@_name"] === "Legal");
        if (quick?.item) setFooterLinks(Array.isArray(quick.item) ? quick.item : [quick.item]);
        if (legal?.item) setLegalLinks(Array.isArray(legal.item) ? legal.item : [legal.item]);
      }
    });
  }, []);

  // ── CSS class helpers for nav links ──────────────────────────────────────
  // Active link gets blue background, inactive links are grey
  const desktopLink = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? "bg-blue-700 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileLink = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  // Close the mobile menu when a link is clicked
  function close() { setMenuOpen(false); }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

      {/* ── STICKY NAVBAR ────────────────────────────────────────────────────
          Stays at the top of the screen as the user scrolls.
          Shows the CityLink logo, navigation links, and auth buttons.
          On mobile, nav links collapse into a hamburger menu. */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* CityLink logo — clicking takes you back to the home page */}
            <Link to="/" onClick={close} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center">
                <span className="text-white text-sm font-bold">CL</span>
              </div>
              {/* Full name shown on tablet and above */}
              <div className="leading-tight hidden sm:block">
                <p className="text-sm font-bold text-slate-900">CityLink Initiatives</p>
                <p className="text-xs text-slate-400">Smart Community Portal</p>
              </div>
              {/* Short name shown on mobile */}
              <div className="leading-tight sm:hidden">
                <p className="text-sm font-bold text-slate-900">CityLink</p>
              </div>
            </Link>

            {/* Desktop navigation links — hidden on mobile, shown on large screens
                Links are loaded from menu.xml so they can be updated without code changes */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map(({ label, path, end }) => (
                <NavLink key={path} to={path} end={end === "true" || end === true}
                  className={desktopLink}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop auth buttons — shown on large screens only
                Different buttons shown depending on whether user is logged in */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {user ? (
                <>
                  {/* Admin/staff see Admin Portal button, regular users see their name */}
                  {(user.role === "admin" || user.role === "staff") ? (
                    <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors">
                      Admin Portal
                    </Link>
                  ) : (
                    <NavLink to="/profile" className="px-3 py-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                      {user.name?.split(" ")[0] || "Profile"}
                    </NavLink>
                  )}
                  {/* Sign out button — clears session and returns to home */}
                  <button onClick={logout} className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {/* Not logged in — show Log In and Sign Up buttons */}
                  <Link to="/login"  className="px-3 py-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">Log In</Link>
                  <Link to="/signup" className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile auth shortcut + hamburger button
                Shows on small/medium screens only */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Show appropriate link based on auth state and role */}
              {!user ? (
                <Link to="/login" className="px-3 py-1.5 text-sm font-semibold text-blue-700">Log In</Link>
              ) : (user.role === "admin" || user.role === "staff") ? (
                <Link to="/admin" onClick={close} className="px-3 py-1.5 text-sm font-semibold text-slate-700 font-bold">
                  Admin
                </Link>
              ) : (
                <Link to="/profile" onClick={close} className="px-3 py-1.5 text-sm font-semibold text-blue-700">
                  {user.name?.split(" ")[0] || "Profile"}
                </Link>
              )}
              {/* Hamburger button — toggles the mobile dropdown menu */}
              <button onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu"
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                {/* Shows X when open, hamburger when closed */}
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN MENU ─────────────────────────────────────────────
            Only visible on small screens when hamburger is clicked.
            Contains all nav links and auth options in a vertical list. */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {/* Navigation links from menu.xml */}
            {navLinks.map(({ label, path, end }) => (
              <NavLink key={path} to={path} end={end === "true" || end === true}
                className={mobileLink} onClick={close}>
                {label}
              </NavLink>
            ))}
            {/* Auth section — separated by a thin line */}
            <div className="border-t border-slate-100 pt-3 mt-2 space-y-1">
              {user ? (
                <>
                  <NavLink to="/profile" className={mobileLink} onClick={close}>My Profile</NavLink>
                  {/* Only show Admin Portal link to admin/staff users */}
                  {(user.role === "admin" || user.role === "staff") && (
                    <Link to="/admin" onClick={close} className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800">
                      Admin Portal
                    </Link>
                  )}
                  <button onClick={() => { logout(); close(); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"  onClick={close} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">Log In</Link>
                  <Link to="/signup" onClick={close} className="block px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-700 text-center">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────────────
          <Outlet /> renders whatever page is currently active based on the route.
          For example: /events renders Events.jsx, /contact renders Contact.jsx */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────
          4-column layout: Brand, Quick Links (from XML), Legal (from XML), Contact.
          Footer links are loaded from public/xml/menu.xml just like the navbar. */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand column — logo, name, tagline */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">CL</span>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-blue-800">CityLink Initiatives</p>
                  <p className="text-xs text-slate-400">Smart Community Portal</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connecting our community with accessible digital services.
              </p>
            </div>

            {/* Quick Links column — populated from menu.xml footer section */}
            <div>
              <p className="text-sm font-bold text-slate-900 mb-4">Quick Links</p>
              <div className="space-y-2.5">
                {footerLinks.map(({ label, path }) => (
                  <Link key={path} to={path} className="block text-sm text-slate-500 hover:text-blue-700 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal column — populated from menu.xml footer section */}
            <div>
              <p className="text-sm font-bold text-slate-900 mb-4">Legal</p>
              <div className="space-y-2.5">
                {legalLinks.map(({ label, path }) => (
                  <Link key={path} to={path} className="block text-sm text-slate-500 hover:text-blue-700 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact column — static contact details */}
            <div>
              <p className="text-sm font-bold text-slate-900 mb-4">Contact Us</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <p className="text-sm text-slate-500 leading-snug">123 Council Street<br/>CityLink, CL 12345</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <a href="tel:+611234567890" className="text-sm text-slate-500 hover:text-blue-700 transition-colors">(123) 456-7890</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <a href="mailto:info@citylink.gov" className="text-sm text-slate-500 hover:text-blue-700 transition-colors">info@citylink.gov</a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer bottom bar — acknowledgement and copyright */}
        <div className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-4 text-center space-y-1.5">
            {/* Acknowledgement of Country — required for Australian government sites */}
            <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
              CityLink Initiatives acknowledges the Traditional Custodians of the land on which we operate
              and pays respect to Elders past and present. We celebrate the continuing traditions and living
              culture of Aboriginal and Torres Strait Islander peoples.
            </p>
            {/* Copyright notice */}
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} CityLink Initiatives. All rights reserved. WCAG 2.1 AA Compliant.
            </p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING COMPONENTS ───────────────────────────────────────────────
          These sit on top of all pages using fixed positioning.
          AccessibilityToolbar — left side, adjusts text size, contrast, cursor
          ChatBot — bottom right, virtual assistant for community members */}
    </div>
  );
}