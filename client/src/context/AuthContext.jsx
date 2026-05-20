// AuthContext.jsx — Sprint 3
// Real JWT authentication via backend API
import { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";

const AuthContext = createContext(null);
import BASE_URL from "../services/api";
const API = `${BASE_URL}/users`; // Base URL for auth endpoints 

// ── Helpers ───────────────────────────────────────────────────────────
function getStoredUser()  {
  try { const u = JSON.parse(localStorage.getItem("citylink_user")); return u && typeof u === "object" ? u : null; }
  catch { return null; }
}
function getStoredToken() { return localStorage.getItem("citylink_token") || null; }

// ── Auth headers — imported by service files for protected requests ───
export function authHeaders() {
  const token = getStoredToken();
  return token
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// ── Provider ──────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  async function login(email, password) {
    try {
      const res  = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Invalid email or password." };

      // Response is flat: { _id, name, email, role, token }
      const { token: tok, ...userInfo } = data;
      localStorage.setItem("citylink_user",  JSON.stringify(userInfo));
      localStorage.setItem("citylink_token", tok);
      setUser(userInfo);
      setToken(tok);
      return { success: true, role: userInfo.role };
    } catch {
      return { success: false, error: "Cannot connect to server. Is the backend running?" };
    }
  }

  async function register(name, email, password) {
    try {
      const res  = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Registration failed." };

      const { token: tok, ...userInfo } = data;
      localStorage.setItem("citylink_user",  JSON.stringify(userInfo));
      localStorage.setItem("citylink_token", tok);
      setUser(userInfo);
      setToken(tok);
      return { success: true };
    } catch {
      return { success: false, error: "Cannot connect to server." };
    }
  }

  function logout() {
    localStorage.removeItem("citylink_user");
    localStorage.removeItem("citylink_token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user || (user.role !== "admin" && user.role !== "staff"))
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-8 max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">You must be signed in as an admin or staff member.</p>
          <Link to="/login" className="px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  return children;
}

export function RequireAdminOnly({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin")
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-8 max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">Admin access required.</p>
          <Link to="/login" className="px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  return children;
}