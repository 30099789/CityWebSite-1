// announcementService.js — uses authFetch for write operations
import BASE_URL, { authFetch } from "./api";

const URL = `${BASE_URL}/announcements`;

export async function fetchAnnouncements() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function createAnnouncement(data) {
  const res = await authFetch(URL, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create announcement"); }
  return res.json();
}

export async function updateAnnouncement(id, data) {
  const res = await authFetch(`${URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update announcement"); }
  return res.json();
}

export async function deleteAnnouncement(id) {
  const res = await authFetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete announcement");
  return res.json();
}