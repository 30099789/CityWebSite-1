// userService.js — user management API calls
// All requests send JWT token via authFetch / authHeaders
import BASE_URL, { authFetch } from "./api";
import { authHeaders } from "../context/AuthContext";

const URL = `${BASE_URL}/users`;

// GET all users — admin/staff only
export async function fetchUsers() {
  const res = await fetch(URL, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// POST create user — admin only
export async function createUser(data) {
  const res = await authFetch(URL, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create user"); }
  return res.json();
}

// PUT update user — admin or own profile
export async function updateUser(id, data) {
  const res = await authFetch(`${URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update user"); }
  return res.json();
}

// DELETE user — admin only
export async function deleteUser(id) {
  const res = await authFetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}