// eventService.js — Sprint 3
// CRUD for events — sends JWT token on write requests
// Assessment requirement: all write operations protected by JWT auth
import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const API_URL = `${BASE_URL}/events`;

export async function fetchEvents() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEventById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(API_URL, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to create event"); }
  return res.json();
}

export async function updateEvent(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to update event"); }
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to delete event"); }
  return res.json();
}