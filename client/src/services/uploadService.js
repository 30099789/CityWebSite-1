// uploadService.js — Sprint 3
// Compresses image client-side before uploading as Base64 to MongoDB
// Avoids Render ephemeral filesystem — images persist across redeploys

import BASE_URL from "./api";

const UPLOAD_URL = `${BASE_URL}/upload`;

// ── compressImage ─────────────────────────────────────────────────────
// Resizes and compresses image using canvas before upload
// Keeps file small enough for MongoDB and HTTP body limits
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Scale down if wider than maxWidth
      const scale  = Math.min(1, maxWidth / img.width);
      const width  = Math.floor(img.width  * scale);
      const height = Math.floor(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      // Convert to JPEG with compression
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

// ── uploadImage ───────────────────────────────────────────────────────
// Compresses image client-side, then sends Base64 to backend
// Backend stores it directly in MongoDB as imageUrl field
export async function uploadImage(file) {
  // Compress before uploading — keeps payload under Express 10mb limit
  const base64 = await compressImage(file);

  const token = localStorage.getItem("citylink_token");

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ base64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Image upload failed");
  }

  const data = await res.json();
  return data.imageUrl;
}

// ── getImageSrc ───────────────────────────────────────────────────────
// Returns image URL for use in <img src>
// Handles Base64 data URLs and legacy /uploads/ paths
export function getImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http"))  return imageUrl;
  const serverUrl = UPLOAD_URL.replace("/api/upload", "");
  return `${serverUrl}${imageUrl}`;
}