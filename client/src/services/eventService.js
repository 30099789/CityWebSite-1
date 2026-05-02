import BASE_URL, { authFetch } from "./api";

const URL = `${BASE_URL}/events`;

export async function fetchEvents() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(data) {
  const res = await authFetch(URL, { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create event"); }
  return res.json();
}

export async function updateEvent(id, data) {
  const res = await authFetch(`${URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update event"); }
  return res.json();
}

export async function deleteEvent(id) {
  const res = await authFetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}

export async function uploadEventImage(file) {
  let token = null;
  try { token = JSON.parse(localStorage.getItem("citylink_user") || "{}").token; } catch {}
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${URL}/upload-image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}