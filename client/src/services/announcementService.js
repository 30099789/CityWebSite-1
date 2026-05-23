// announcementService.js — Sprint 3
// CRUD for announcements — sends JWT token on write requests
import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const API_URL = `${BASE_URL}/announcements`;

export async function fetchAnnouncements() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function createAnnouncement(data) {
  const res = await fetch(API_URL, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to create announcement"); }
  return res.json();
}

export async function updateAnnouncement(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to update announcement"); }
  return res.json();
}

export async function deleteAnnouncement(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to delete announcement"); }
  return res.json();
}