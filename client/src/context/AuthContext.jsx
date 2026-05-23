// AuthContext.jsx — Sprint 3
// Real JWT authentication via backend API
// Assessment requirement: JWT-based login with role-based access control
// Provides: login, logout, register, updateUser, authHeaders, RequireAdmin, RequireAdminOnly

import { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../services/api";

// ── Context setup ─────────────────────────────────────────────────────
// Creates a React context for global auth state
// Any component can access user, token and auth functions via useAuth()
const AuthContext = createContext(null);

const API = `${BASE_URL}/users`; // Base URL for all user/auth endpoints

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
// Called by service files: authHeaders() returns Authorization + Content-Type headers
// If no token (not logged in), returns Content-Type only
export function authHeaders() {
  const token = getStoredToken();
  return token
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// ── Provider ──────────────────────────────────────────────────────────
// Wraps the entire app (see App.jsx) so all pages have access to auth state
// Stores user info and token in both React state and localStorage
// localStorage ensures auth persists after page refresh
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  // ── Login ─────────────────────────────────────────────────────────
  // Assessment requirement: JWT login via POST /api/users/login
  // Server returns flat object: { _id, name, email, role, token }
  // Token stored in localStorage as citylink_token
  // User info stored as citylink_user (without token to avoid duplication)
  async function login(email, password) {
    try {
      const res  = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Invalid email or password." };

      // Destructure token out of response — store separately
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

  // ── Register ──────────────────────────────────────────────────────
  // POST /api/users/register — creates a new resident account
  // Server validates name, email, password (min 6 chars) and returns JWT
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
  // PUT /api/users/:id — updates name, phone, suburb fields
  // Requires JWT token in Authorization header (protect middleware)
  // Updates both MongoDB, React state and localStorage so changes persist
  async function updateUser(formData) {
    try {
      const res = await fetch(`${API}/${user._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      // Merge updated fields into current user object
      const newUser = { ...user, ...updated };
      setUser(newUser);

      // Persist updated user to localStorage (keep token separate)
      localStorage.setItem("citylink_user", JSON.stringify(newUser));
    } catch (err) {
      console.error("Update user error:", err.message);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────
  // Clears JWT token and user info from localStorage and React state
  // After logout, RequireAdmin components will redirect to login
  function logout() {
    localStorage.removeItem("citylink_user");
    localStorage.removeItem("citylink_token");
    setUser(null);
    setToken(null);
  }

  return (
    // Provide all auth functions and state to every child component
    <AuthContext.Provider value={{ user, token, login, logout, register, updateUser, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────────────
// Custom hook — any component imports and calls useAuth() to access auth state
// Example: const { user, login, logout } = useAuth();
export function useAuth() { return useContext(AuthContext); }

// ── RequireAdmin ──────────────────────────────────────────────────────
// Assessment requirement: frontend route protection
// Wraps admin pages in App.jsx — if user is not admin or staff, shows Access Denied
// Works alongside backend protect() + requireAdmin() middleware for dual-layer security
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
// Stricter version — only admin role allowed, not staff
// Used for ManageUsers page — staff cannot manage other users
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