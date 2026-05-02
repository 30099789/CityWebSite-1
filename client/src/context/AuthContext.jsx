// AuthContext.jsx — Sprint 3 Week 11
// Login: tries real API first, falls back to hardcoded admin credentials
// Register: POSTs to real API
import { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";

const AuthContext = createContext(null);

const BASE_URL = "http://localhost:5000/api";

// Hardcoded admin/staff — always work even if DB is down
const ADMIN_CREDENTIALS = [
  { email: "admin@citylink.gov", password: "admin123", role: "admin", name: "Admin User" },
  { email: "staff@citylink.gov", password: "staff123", role: "staff", name: "Staff Member" },
];

function getStoredUser() {
  try {
    const u = JSON.parse(localStorage.getItem("citylink_user"));
    return u && typeof u === "object" ? u : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  async function login(email, password) {
    // 1. Check hardcoded admin first
    const admin = ADMIN_CREDENTIALS.find(
      (c) => c.email === email && c.password === password
    );
    if (admin) {
      const u = { email: admin.email, role: admin.role, name: admin.name };
      localStorage.setItem("citylink_user", JSON.stringify(u));
      setUser(u);
      return { success: true, role: admin.role };
    }

    // 2. Try real API
    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Invalid email or password." };

      const u = {
        id:    data._id || data.id,
        email: data.email,
        name:  data.name,
        role:  data.role || "resident",
      };
      localStorage.setItem("citylink_user", JSON.stringify(u));
      setUser(u);
      return { success: true, role: u.role };
    } catch {
      return { success: false, error: "Unable to connect to the server. Please try again." };
    }
  }

  async function register(name, email, password) {
    try {
      const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Registration failed." };

      const u = {
        id:    data._id || data.id,
        email: data.email,
        name:  data.name,
        role:  data.role || "resident",
      };
      localStorage.setItem("citylink_user", JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect to the server. Please try again." };
    }
  }

  function logout() {
    localStorage.removeItem("citylink_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-8 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">You must be signed in as an admin or staff member to view this page.</p>
          <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  return children;
}