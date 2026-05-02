// Feedback.jsx — Sprint 3 Week 11
// Wired to real API, full client-side validation, error handling
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { submitFeedback } from "../services/feedbackService";

const CATEGORIES = ["Events", "Services", "Website", "Roads", "Waste", "General"];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function validate(form) {
  const errors = {};
  if (!form.category)       errors.category = "Please select a category.";
  if (form.rating === 0)    errors.rating   = "Please select a star rating.";
  if (!form.message.trim()) errors.message  = "Please write your feedback.";
  if (form.message.trim().length < 10) errors.message = "Feedback must be at least 10 characters.";
  return errors;
}

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm]         = useState({ category: "", rating: 0, message: "" });
  const [hover, setHover]       = useState(0);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [apiError, setApiError]     = useState("");

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
      await submitFeedback({
        userName:  user?.name  || "Guest",
        userEmail: user?.email || "",
        category:  form.category,
        rating:    form.rating,
        message:   form.message,
      });
      setSubmitted(true);
      setForm({ category: "", rating: 0, message: "" });
      setErrors({});
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Submit Feedback</h1>
          <p className="text-slate-500">Your feedback helps us improve CityLink services for the whole community.</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success state */}
        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Feedback Submitted</h2>
            <p className="text-sm text-slate-500 mb-6">Thank you! Your feedback has been received and will be reviewed by our team.</p>
            <button onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition">
              Submit Another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

            {/* Guest notice */}
            {!user && (
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                <span className="font-semibold">Note:</span> Submitting as a guest.{" "}
                <Link to="/login" className="underline hover:text-blue-900">Sign in</Link> to track your feedback.
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600" role="alert">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => update("category", cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        form.category === cat
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      }`}>{cat}</button>
                  ))}
                </div>
                {errors.category && <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>}
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => update("rating", star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className="transition-transform hover:scale-110">
                      <svg className={`w-8 h-8 transition-colors ${(hover || form.rating) >= star ? "text-amber-400" : "text-slate-200"}`}
                        fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="ml-2 text-sm font-semibold text-slate-500">{RATING_LABELS[form.rating]}</span>
                  )}
                </div>
                {errors.rating && <p className="mt-1.5 text-xs text-red-600">{errors.rating}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-semibold text-slate-800 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea id="feedback-message" rows={5}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us what you think — what went well, what could be improved…"
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none transition ${
                    errors.message
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-slate-200 focus:ring-slate-900/10 focus:border-slate-400"
                  }`} />
                <div className="flex justify-between mt-1">
                  {errors.message
                    ? <p className="text-xs text-red-600">{errors.message}</p>
                    : <span />}
                  <p className="text-xs text-slate-400">{form.message.length} characters</p>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}