// serviceService.js — Sprint 3
import BASE_URL from "./api";

const URL = `${BASE_URL}/services`;

export async function fetchServices() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function createService(data) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create service");
  }
  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update service");
  }
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete service");
  return res.json();
}

export async function uploadServiceImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${URL}/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}