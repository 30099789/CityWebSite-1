// Contact.jsx — Caio
// Sprint 2: Contact page with details and enquiry form
import { useState } from "react";

function Icon({ path, className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState("");

  function update(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields."); return;
    }
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Contact Us</h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Have a question, concern, or need help? Reach out and we'll get back to you within 2 business days.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Contact details column */}
        <div className="space-y-5">
          {[
            {
              icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
              label: "Address",
              lines: ["123 Council Street", "CityLink, CL 12345"],
            },
            {
              icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
              label: "Phone",
              lines: ["(123) 456-7890"],
              href: "tel:+611234567890",
            },
            {
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              label: "Email",
              lines: ["info@citylink.gov.au"],
              href: "mailto:info@citylink.gov.au",
            },
            {
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              label: "Office Hours",
              lines: ["Mon–Fri: 9:00 AM – 5:00 PM", "Sat–Sun: Closed"],
            },
          ].map(({ icon, label, lines, href }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon path={icon} className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                {lines.map((line) =>
                  href ? (
                    <a key={line} href={href} className="block text-sm text-slate-700 hover:text-blue-700 transition-colors">
                      {line}
                    </a>
                  ) : (
                    <p key={line} className="text-sm text-slate-700">{line}</p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enquiry form column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Send an Enquiry</h2>
            <p className="text-sm text-slate-500 mb-6">We'll respond within 2 business days.</p>

            {sent && (
              <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-semibold" role="alert">
                <Icon path="M5 13l4 4L19 7" className="w-4 h-4 flex-shrink-0" />
                Message sent! We'll be in touch soon.
              </div>
            )}

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-800 mb-1.5">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="What is your enquiry about?"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
