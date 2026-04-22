import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Privacy Policy."); return;
    }
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 mb-5 text-sm font-medium text-blue-600 hover:underline">
          ← Back to Home
        </Link>

        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">CL</div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">CityLink Initiatives</div>
              <div className="text-xs text-slate-400 leading-tight">Smart Community Portal</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
          <p className="text-sm text-slate-500 mb-6">Sign up to access community services.</p>

          {/* Tab switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <Link to="/login" className="rounded-xl py-2 text-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Sign in</Link>
            <div className="rounded-xl bg-white py-2 text-center text-sm font-semibold text-slate-900 shadow-sm">Sign up</div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">First name</label>
                <input type="text" placeholder="Kate" value={form.name.split(" ")[0] || ""} onChange={(e) => update("name", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Last name</label>
                <input type="text" placeholder="Smith" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email</label>
              <input type="email" placeholder="you@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Confirm password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
              <span className="text-sm text-slate-600">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-slate-400 mt-6">© {new Date().getFullYear()} CityLink Initiatives</p>
        </div>
      </div>
    </main>
  );
}``