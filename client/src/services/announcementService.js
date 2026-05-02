// announcementService.js — Sprint 3 Week 8: all calls hit the real MongoDB API
import BASE_URL from "./api";

const URL = `${BASE_URL}/announcements`;

export async function fetchAnnouncements() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function createAnnouncement(data) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create announcement");
  return res.json();
}

export async function updateAnnouncement(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update announcement");
  return res.json();
}

export async function deleteAnnouncement(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete announcement");
  return res.json();
}