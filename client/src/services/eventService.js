// eventService.js — Sprint 3 Week 8: all calls hit the real MongoDB API
import BASE_URL from "./api";

const URL = `${BASE_URL}/events`;

export async function fetchEvents() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}

// Upload an image file — returns { imageUrl }
export async function uploadEventImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${URL}/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}