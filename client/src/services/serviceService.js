// serviceService.js — Sprint 3
import { authHeaders } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/services";

export async function fetchServices() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function createService(data) {
  const res = await fetch(API_URL, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to create service"); }
  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to update service"); }
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to delete service"); }
  return res.json();
}