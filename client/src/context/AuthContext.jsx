// AuthContext.jsx — Sprint 3
// Assessment requirement: JWT-based login with role-based access control
// Provides: login, logout, register, updateUser, authHeaders, RequireAdmin, RequireAdminOnly

import { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../services/api";

const AuthContext = createContext(null);
const API = `${BASE_URL}/users`;

// ── Helpers ───────────────────────────────────────────────────────────
// Reads stored user object from localStorage on page load
function getStoredUser() {
  try { const u = JSON.parse(localStorage.getItem("citylink_user")); return u && typeof u === "object" ? u : null; }
  catch { return null; }
}

// Reads stored JWT token from localStorage on page load
function getStoredToken() { return localStorage.getItem("citylink_token") || null; }

// ── Auth headers ──────────────────────────────────────────────────────
// Assessment requirement: JWT token sent with every admin write request
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

  // ── Login ─────────────────────────────────────────────────────────
  // POST /api/users/login — returns JWT token on success
  async function login(email, password) {
    try {
      const res  = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Invalid email or password." };

      const { token: tok, ...userInfo } = data;

      // Fetch full user profile from DB to get phone/suburb immediately after login
      // This ensures profile page shows correct data even before first edit
      let fullUser = { ...userInfo };
      try {
        const uRes = await fetch(`${API}/${userInfo._id}`, {
          headers: { "Authorization": `Bearer ${tok}`, "Content-Type": "application/json" }
        });
        if (uRes.ok) {
          const uData = await uRes.json();
          fullUser = { ...fullUser, phone: uData.phone || "", suburb: uData.suburb || "" };
        }
      } catch { /* silently fail — basic user info still stored */ }

      localStorage.setItem("citylink_user",  JSON.stringify(fullUser));
      localStorage.setItem("citylink_token", tok);
      setUser(fullUser);
      setToken(tok);
      return { success: true, role: userInfo.role };
    } catch {
      return { success: false, error: "Cannot connect to server. Is the backend running?" };
    }
  }

  // ── Register ──────────────────────────────────────────────────────
  // POST /api/users/register — creates new resident account
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

  // ── Update User ───────────────────────────────────────────────────
  // Assessment requirement: user profile editing
  // PUT /api/users/:id — updates name, phone, suburb
  // Saves ALL updated fields to localStorage so they survive page refresh
  async function updateUser(formData) {
    try {
      const res = await fetch(`${API}/${user._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      // Merge ALL updated fields into current user — includes phone and suburb
      const newUser = { ...user, ...updated, ...formData };
      setUser(newUser);

      // Save complete user with phone/suburb to localStorage
      // This is the key fix — ensures fields survive page refresh
      localStorage.setItem("citylink_user", JSON.stringify(newUser));
    } catch (err) {
      console.error("Update user error:", err.message);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────
  function logout() {
    localStorage.removeItem("citylink_user");
    localStorage.removeItem("citylink_token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, updateUser, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────────────
export function useAuth() { return useContext(AuthContext); }

// ── RequireAdmin ──────────────────────────────────────────────────────
// Assessment requirement: frontend route protection
// Blocks non-admin/staff users from accessing admin pages
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

// ── RequireAdminOnly ──────────────────────────────────────────────────
// Stricter version — admin only, not staff
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