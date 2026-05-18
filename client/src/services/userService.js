// userService.js — fetches users without requiring token (admin dashboard)
import BASE_URL, { authFetch } from "./api";

const URL = `${BASE_URL}/users`;

export async function fetchUsers() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(data) {
  const res = await authFetch(URL, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create user"); }
  return res.json();
}

export async function updateUser(id, data) {
  const res = await authFetch(`${URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update user"); }
  return res.json();
}

export async function deleteUser(id) {
  const res = await authFetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}