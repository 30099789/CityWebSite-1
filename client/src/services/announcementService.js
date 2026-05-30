// announcementService.js — Sprint 3
// All the API calls for announcements in one place
// Fetch is public — no login needed to read announcements
// Create, update and delete require a JWT token (admin/staff only)

import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const API_URL = `${BASE_URL}/announcements`;

// Get all announcements — used by the public Announcements page and admin table
export async function fetchAnnouncements() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

// Create a new announcement — admin/staff only
// POST /api/announcements
export async function createAnnouncement(data) {
  const res = await fetch(API_URL, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to create announcement"); }
  return res.json();
}

// Update an existing announcement — used for editing and publish/unpublish toggle
// PUT /api/announcements/:id
export async function updateAnnouncement(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to update announcement"); }
  return res.json();
}

// Delete an announcement — admin only
// DELETE /api/announcements/:id
export async function deleteAnnouncement(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to delete announcement"); }
  return res.json();
}