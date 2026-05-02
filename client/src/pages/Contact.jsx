// Contact.jsx — Sprint 3 Week 11
// Wired to real API, full validation, field-level errors, error handling
import { useState } from "react";
import BASE_URL from "../services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!form.name.trim())              errors.name    = "Name is required.";
  if (!form.email.trim())             errors.email   = "Email is required.";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Please enter a valid email.";
  if (!form.message.trim())           errors.message = "Message is required.";
  else if (form.message.trim().length < 10) errors.message = "Message must be at least 10 characters.";
  return errors;
}

const Icon = ({ path }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const CONTACT_ITEMS = [
  {
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    label: "Address",
    lines: ["123 Council Street", "Perth WA 6000"],
  },
  {
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    label: "Phone",
    lines: ["(08) 9000 0000"],
    href: "tel:+61890000000",
  },
  {
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    label: "Email",
    lines: ["info@citylink.gov"],
    href: "mailto:info@citylink.gov",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Office Hours",
    lines: ["Mon–Fri: 9:00 AM – 5:00 PM", "Sat–Sun: Closed"],
  },
];

export default function Contact() {
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]         = useState(false);
  const [apiError, setApiError] = useState("");

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send message");
      }
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? "border-red-300 focus:ring-red-500/20"
        : "border-slate-200 focus:ring-slate-900/10 focus:border-slate-400"
    }`;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Contact Us</h1>
          <p className="text-slate-500">Have a question or need help? We'll get back to you within 2 business days.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Contact details */}
          <div className="space-y-4">
            {CONTACT_ITEMS.map(({ icon, label, lines, href }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                  <Icon path={icon} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                  {lines.map((line) =>
                    href ? (
                      <a key={line} href={href} className="block text-sm text-slate-700 hover:text-slate-900 transition">{line}</a>
                    ) : (
                      <p key={line} className="text-sm text-slate-700">{line}</p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enquiry form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

              {sent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Message Sent</h2>
                  <p className="text-sm text-slate-500 mb-6">We've received your enquiry and will respond within 2 business days.</p>
                  <button onClick={() => setSent(false)}
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Send an Enquiry</h2>
                  <p className="text-sm text-slate-500 mb-6">We'll respond within 2 business days.</p>

                  {apiError && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600" role="alert">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" placeholder="Your name" value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          className={inputClass("name")} />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input type="email" placeholder="you@email.com" value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className={inputClass("email")} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">Subject</label>
                      <input type="text" placeholder="What is your enquiry about?" value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        className={inputClass("subject")} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea rows={5} placeholder="Write your message here…" value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        className={`${inputClass("message")} resize-none`} />
                      {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                      {submitting ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}