// Signup.jsx — Sprint 3 (polished with validation + password strength)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))       score++;
  if (/[0-9]/.test(pw))       score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "",        color: ""                   },
    { label: "Weak",    color: "bg-red-400"          },
    { label: "Fair",    color: "bg-amber-400"        },
    { label: "Good",    color: "bg-blue-500"         },
    { label: "Strong",  color: "bg-emerald-500"      },
  ];
  return { score, ...levels[score] };
}

export default function Signup() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(form.password);

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())             errs.name     = "Full name is required.";
    if (!form.email.trim())            errs.email    = "Email is required.";
    else if (!EMAIL_REGEX.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password)                errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!form.confirm)                 errs.confirm  = "Please confirm your password.";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (!agreed)                       errs.agreed   = "You must agree to the Terms & Privacy Policy.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setApiError(result.error);
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? "border-red-300 bg-red-50/30 focus:ring-red-500/20"
        : "border-slate-200 bg-white focus:ring-slate-900/10 focus:border-slate-400"
    }`;

  const EyeIcon = ({ show, toggle, label }) => (
    <button type="button" onClick={toggle} aria-label={label}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );

  const FieldError = ({ msg }) => msg ? (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {msg}
    </p>
  ) : null;

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <Link to="/" className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

          <div className="mb-7">
            <Logo variant="compact" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-6">Join the CityLink community portal for free.</p>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 mb-6">
            <Link to="/login" className="rounded-xl py-2.5 text-center text-sm font-semibold text-slate-500 hover:text-slate-700 transition">Sign in</Link>
            <div className="rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-slate-900 shadow-sm">Sign up</div>
          </div>

          {/* API error */}
          {apiError && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-1.5">Full name</label>
              <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                placeholder="Kate Smith" autoComplete="name"
                className={inputClass("name")} aria-invalid={!!errors.name} />
              <FieldError msg={errors.name} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1.5">Email address</label>
              <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com" autoComplete="email"
                className={inputClass("email")} aria-invalid={!!errors.email} />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
              <div className="relative">
                <input id="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={(e) => update("password", e.target.value)}
                  placeholder="Minimum 6 characters" autoComplete="new-password"
                  className={`${inputClass("password")} pr-11`} aria-invalid={!!errors.password} />
                <EyeIcon show={showPass} toggle={() => setShowPass((s) => !s)} label={showPass ? "Hide password" : "Show password"} />
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-slate-200"}`} />
                    ))}
                  </div>
                  {strength.label && <p className="text-xs text-slate-500">{strength.label} password</p>}
                </div>
              )}
              <FieldError msg={errors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-slate-800 mb-1.5">Confirm password</label>
              <div className="relative">
                <input id="confirm" type={showConfirm ? "text" : "password"}
                  value={form.confirm} onChange={(e) => update("confirm", e.target.value)}
                  placeholder="Repeat your password" autoComplete="new-password"
                  className={`${inputClass("confirm")} pr-11`} aria-invalid={!!errors.confirm} />
                <EyeIcon show={showConfirm} toggle={() => setShowConfirm((s) => !s)} label={showConfirm ? "Hide password" : "Show password"} />
              </div>
              {/* Match indicator */}
              {form.confirm && form.password && (
                <p className={`mt-1.5 text-xs flex items-center gap-1 ${form.password === form.confirm ? "text-emerald-600" : "text-red-500"}`}>
                  {form.password === form.confirm ? (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Passwords match</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Passwords do not match</>
                  )}
                </p>
              )}
              <FieldError msg={errors.confirm} />
            </div>

            {/* Terms */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition ${errors.agreed ? "border-red-200 bg-red-50/30" : "border-transparent hover:bg-slate-50"}`}>
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((er) => ({ ...er, agreed: "" })); }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900" />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 font-semibold hover:underline" target="_blank">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-blue-600 font-semibold hover:underline" target="_blank">Privacy Policy</Link>
                </span>
              </label>
              <FieldError msg={errors.agreed} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-slate-400 mt-5">© {new Date().getFullYear()} CityLink Initiatives</p>
        </div>
      </div>
    </main>
  );
}