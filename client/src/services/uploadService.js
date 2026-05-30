// uploadService.js — Sprint 3
// Handles image uploading for events and services
// Images are compressed first, then stored as Base64 in MongoDB
// This means images survive Render redeploys (no disk storage needed)

import BASE_URL from "./api";

const UPLOAD_URL = `${BASE_URL}/upload`;

// Shrinks an image down before uploading so it stays under the 10MB limit
// Uses the browser canvas to resize and convert to JPEG at 70% quality
// maxWidth: biggest the image will be (default 800px wide)
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Work out new size — only shrinks, never stretches
      const scale  = Math.min(1, maxWidth / img.width);
      const width  = Math.floor(img.width  * scale);
      const height = Math.floor(img.height * scale);

      // Draw the resized image onto a canvas then export as JPEG
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

// Compress the image then send it to the server as a Base64 string
// The server returns it unchanged and it gets saved in MongoDB as imageUrl
// POST /api/upload — requires admin or staff JWT token
export async function uploadImage(file) {
  const base64 = await compressImage(file);
  const token  = localStorage.getItem("citylink_token");

  const res = await fetch(UPLOAD_URL, {
    method:  "POST",
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

// Returns the right URL to use in an <img src> tag
// Handles three cases:
//   - Base64 data URL (data:image/...) — stored directly in MongoDB
//   - Absolute URL (http/https) — external image
//   - Legacy relative path (/uploads/...) — old disk-based uploads
export function getImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http"))  return imageUrl;
  const serverUrl = UPLOAD_URL.replace("/api/upload", "");
  return `${serverUrl}${imageUrl}`;
}