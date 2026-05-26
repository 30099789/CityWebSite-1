// uploadService.js — Sprint 3
// Handles image uploads to Express backend
// Images stored as Base64 data URLs in MongoDB — no disk/CDN needed

import BASE_URL from "./api";

const UPLOAD_URL = `${BASE_URL}/upload`;

// ── uploadImage ───────────────────────────────────────────────────────
// Sends image file to backend, receives Base64 data URL back
// That data URL is stored directly as imageUrl in MongoDB
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("citylink_token");

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Image upload failed");
  }

  const data = await res.json();
  return data.imageUrl;
}

// ── getImageSrc ───────────────────────────────────────────────────────
// Returns the image URL for use in <img src>
// Handles Base64 data URLs (data:image/...) and legacy /uploads/ paths
export function getImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("data:")) return imageUrl;  // Base64 data URL
  if (imageUrl.startsWith("http"))  return imageUrl;  // absolute URL
  // Legacy: relative path from old disk-based uploads
  const serverUrl = UPLOAD_URL.replace("/api/upload", "");
  return `${serverUrl}${imageUrl}`;
}