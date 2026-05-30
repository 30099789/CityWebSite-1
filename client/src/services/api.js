// api.js — Sprint 3
// Sets the base URL for all API calls in the app
// In production this uses the VITE_API_URL environment variable set in Vercel
// In development it falls back to the local Render URL

const BASE_URL = import.meta.env.VITE_API_URL || "https://citywebsite-bvxz.onrender.com/api";
export default BASE_URL;

// Attaches the JWT token to any fetch request that needs authentication
// Reads the token from localStorage where it was saved at login
// Used by service files that call protected API routes (create, update, delete)
export function authFetch(url, options = {}) {
  let token = null;
  try {
    const user = JSON.parse(localStorage.getItem("citylink_user") || "{}");
    token = user?.token;
  } catch {}

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}