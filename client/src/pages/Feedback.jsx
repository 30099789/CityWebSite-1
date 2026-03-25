// Feedback.jsx — Caio
// Sprint 2: Working feedback submission form with star rating and success toast
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CATEGORIES = ["Events", "Services", "Website", "Roads", "Waste", "General"];

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm]       = useState({ category: "", rating: 0, message: "" });
  const [hover, setHover]     = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState("");

  function update(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.category) { setError("Please select a category."); return; }
    if (form.rating === 0) { setError("Please select a star rating."); return; }
    if (!form.message.trim()) { setError("Please write your feedback message."); return; }
    // In Sprint 3 this will POST to the API — for now just show success
    setSubmitted(true);
    setForm({ category: "", rating: 0, message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Submit Feedback
        </h1>
        <p className="text-slate-500 text-lg max-w-xl">
          Your feedback helps us improve CityLink services for the whole community.
        </p>
      </section>

      {/* Success toast */}
      {submitted && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-700 text-sm font-semibold" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Thank you! Your feedback has been submitted successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {!user && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span className="font-semibold">Note:</span> You are submitting as a guest.{" "}
            <Link to="/login" className="underline hover:text-blue-900">Sign in</Link> to track your feedback.
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update("category", cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    form.category === cat
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => update("rating", star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <span className={(hover || form.rating) >= star ? "text-amber-400" : "text-slate-200"}>
                    ★
                  </span>
                </button>
              ))}
              {form.rating > 0 && (
                <span className="ml-2 text-sm text-slate-400 self-center">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-semibold text-slate-800 mb-2">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              rows={5}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Tell us what you think — what went well, what could be improved, or any suggestions you have…"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length} characters</p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </main>
  );
}
