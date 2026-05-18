// api.js — base URL + authenticated fetch helper
const BASE_URL = "http://localhost:5000/api";
export default BASE_URL;

// Attaches JWT token from localStorage to every request
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