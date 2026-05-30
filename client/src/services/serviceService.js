// serviceService.js — Sprint 3
// All the API calls for services in one place
// Fetch is public — no login needed to read services
// Create, update and delete require a JWT token (admin/staff only)

import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const API_URL = `${BASE_URL}/services`;

// Get all services — used by the public Services page and admin table
// GET /api/services — no auth required
export async function fetchServices() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

// Create a new service — admin/staff only
// POST /api/services — contact.phone must be exactly 10 digits
export async function createService(data) {
  const res = await fetch(API_URL, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to create service"); }
  return res.json();
}

// Update an existing service
// PUT /api/services/:id — admin/staff only
export async function updateService(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to update service"); }
  return res.json();
}

// Delete a service permanently
// DELETE /api/services/:id — admin/staff only
export async function deleteService(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to delete service"); }
  return res.json();
}