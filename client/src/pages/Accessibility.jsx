import { Link } from "react-router-dom";

function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const STANDARDS = [
  {
    title: "Perceivable",
    desc: "Information and UI components are presented in ways all users can perceive — including text alternatives for images and captions for media.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    title: "Operable",
    desc: "All functionality is available from a keyboard. Users have enough time to read and use content, and content does not cause seizures.",
    icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5",
  },
  {
    title: "Understandable",
    desc: "Text is readable and understandable. Content appears and operates in predictable ways. Users are helped to avoid and correct mistakes.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Robust",
    desc: "Content is robust enough to be interpreted by a wide variety of user agents, including assistive technologies both current and future.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
];

const FEATURES = [
  { label: "Keyboard Navigation",      desc: "All interactive elements are accessible via keyboard using Tab, Enter, and arrow keys.",           icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
  { label: "Screen Reader Support",    desc: "Semantic HTML and ARIA labels ensure compatibility with screen readers such as NVDA and VoiceOver.", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
  { label: "Colour Contrast",          desc: "Text and UI elements meet the WCAG 2.1 AA minimum contrast ratio of 4.5:1 for normal text.",        icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { label: "Resizable Text",           desc: "All text can be resized up to 200% without loss of content or functionality.",                       icon: "M4 6h16M4 12h16M4 18h7" },
  { label: "Alt Text for Images",      desc: "All meaningful images include descriptive alternative text for assistive technology users.",         icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Focus Indicators",         desc: "Visible focus indicators are present on all interactive elements for keyboard and switch users.",    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { label: "Skip Navigation Links",    desc: "A skip to main content link is available to help keyboard users bypass repeated navigation.",        icon: "M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Form Accessibility",       desc: "All form fields have visible labels, error messages are clearly communicated, and inputs are grouped logically.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

const KNOWN_ISSUES = [
  { area: "PDF Documents",   desc: "Some legacy PDF documents linked from the services page may not be fully accessible. We are working to remediate these." },
  { area: "Third-Party Maps","desc": "Embedded map content provided by third-party services may have limited accessibility. Alternative address information is always provided as text." },
];

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CityLink Initiatives</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Accessibility Statement</h1>
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
          CityLink Initiatives is committed to ensuring digital accessibility for all people,
          including those with disabilities. We continually improve the user experience for everyone
          and apply relevant accessibility standards.
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Conformance badge */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center">
            <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900">WCAG 2.1 Level AA Conformance</h2>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">Compliant</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              This portal aims to conform to the{" "}
              <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noreferrer"
                className="text-blue-600 hover:underline font-medium">
                Web Content Accessibility Guidelines (WCAG) 2.1
              </a>{" "}
              at Level AA. These guidelines are developed by the W3C and explain how to make
              web content more accessible to people with disabilities.
            </p>
          </div>
        </div>

        {/* Four principles */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Our Approach</p>
            <h2 className="text-xl font-bold text-slate-900">The Four Principles of Accessibility</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STANDARDS.map(({ title, desc, icon }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon path={icon} className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Accessibility features */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">What We Provide</p>
            <h2 className="text-xl font-bold text-slate-900">Accessibility Features</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {FEATURES.map(({ label, desc, icon }) => (
                <div key={label} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon path={icon} className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <div className="ml-auto flex-shrink-0 mt-0.5">
                    <Icon path="M5 13l4 4L19 7" className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Known issues */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transparency</p>
            <h2 className="text-xl font-bold text-slate-900">Known Limitations</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
              <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">We are actively working to resolve the following known issues.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {KNOWN_ISSUES.map(({ area, desc }) => (
                <div key={area} className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">{area}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical specs */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Technical</p>
            <h2 className="text-xl font-bold text-slate-900">Technical Specifications</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Standard</p>
                  <p className="text-slate-700">WCAG 2.1 Level AA</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Assessment Method</p>
                  <p className="text-slate-700">Self-evaluation and developer review</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Last Reviewed</p>
                  <p className="text-slate-700">March 2026</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Compatible Browsers</p>
                  <p className="text-slate-700">Chrome, Firefox, Safari, Edge (latest versions)</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Assistive Technologies Tested</p>
                  <p className="text-slate-700">NVDA (Windows), VoiceOver (macOS/iOS)</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Framework</p>
                  <p className="text-slate-700">React 19 + Tailwind CSS v4</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback / contact */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900 mb-1">Feedback & Contact</h2>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  We welcome your feedback on the accessibility of the CityLink Portal. If you
                  experience any accessibility barriers or have suggestions for improvement, please
                  contact us — we aim to respond within 2 business days.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:accessibility@citylink.gov.au"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors">
                    <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4" />
                    Email Us
                  </a>
                  <Link to="/contact"
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                    Contact Form
                    <Icon path="M9 5l7 7-7 7" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <div className="pt-2 pb-6 border-t border-slate-200 flex flex-wrap gap-4 text-sm">
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          <Link to="/terms"   className="text-blue-600 hover:underline">Terms of Service</Link>
          <Link to="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
          <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noreferrer"
            className="text-blue-600 hover:underline">WCAG 2.1 Reference</a>
        </div>

      </main>
    </div>
  );
}
