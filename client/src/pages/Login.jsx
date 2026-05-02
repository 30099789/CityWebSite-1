import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === "admin" || result.role === "staff" ? "/admin" : "/");
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 mb-5 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          ← Back to Home
        </Link>

        <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-8">
          <div className="mb-6">
            <Logo variant="compact" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your details to access your account.</p>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <div className="rounded-xl bg-white py-2 text-center text-sm font-semibold text-slate-900 shadow-sm">Sign in</div>
            <Link to="/signup" className="rounded-xl py-2 text-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Sign up</Link>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email</label>
              <input type="email" placeholder="you@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
              <input type="password" placeholder="Enter password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            <strong>Demo credentials:</strong><br />
            Admin: admin@citylink.gov / admin123<br />
            Staff: staff@citylink.gov / staff123
          </div>

          <p className="mt-5 text-sm text-slate-500 text-center">
            New here?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
          </p>
          <p className="text-center text-xs text-slate-400 mt-6">© {new Date().getFullYear()} CityLink Initiatives</p>
        </div>
      </div>
    </main>
  );
}