// uploadService.js — Sprint 3
// Handles image uploads to Express backend via Multer
// Assessment requirement: image upload for events and services

import BASE_URL from "./api";

const UPLOAD_URL = `${BASE_URL}/upload`;

// Gets the base server URL (strips /api from the end)
// Used to construct full image URLs for display
const SERVER_URL = UPLOAD_URL.replace("/api/upload", "");

// ── uploadImage ───────────────────────────────────────────────────────
// Sends image file to backend via multipart/form-data POST
// Requires JWT token — upload route is admin protected
// Returns the imageUrl path stored in MongoDB e.g. /uploads/filename.jpg
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  // Get token from localStorage for auth header
  const token = localStorage.getItem("citylink_token");

  // NOTE: Do NOT set Content-Type manually — browser sets multipart boundary automatically
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
// Converts stored imageUrl path to full URL for use in <img src>
// Handles both absolute URLs (http/https) and relative server paths (/uploads/...)
export function getImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${SERVER_URL}${imageUrl}`;
}