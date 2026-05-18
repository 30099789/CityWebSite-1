// ============================================================
// FILE:    uploadService.js
// PURPOSE: Handles image file uploads to the Express backend
//          and resolves image URLs for display in the browser.
// USED BY: ManageEvents.jsx, ManageServices.jsx (admin pages)
// SPRINT:  Sprint 3 — Full-Stack Development
// ============================================================

// Base URL for the upload API endpoint (backend must be running)
const UPLOAD_URL = "http://localhost:5000/api/upload";

// ------------------------------------------------------------
// FUNCTION: uploadImage
// PURPOSE:  Sends an image file to the server using a POST
//           request with multipart/form-data encoding.
//           The server saves the file and returns its URL path.
// PARAM:    file — a File object from an <input type="file">
// RETURNS:  A promise resolving to the imageUrl string
//           e.g. "/uploads/1717000000000-123456789.jpg"
// ------------------------------------------------------------
export async function uploadImage(file) {
  // Use FormData to package the file for multipart upload
  // NOTE: Do NOT manually set Content-Type — the browser adds
  //       the correct boundary string automatically
  const formData = new FormData();
  formData.append("image", file);

  // Send the file to the backend upload endpoint
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  // If the server returns an error, throw it so the UI can handle it
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Image upload failed");
  }

  // Return just the imageUrl path from the server response
  const data = await res.json();
  return data.imageUrl;
}

// ------------------------------------------------------------
// FUNCTION: getImageSrc
// PURPOSE:  Converts a stored imageUrl into a full URL that
//           the browser can use in an <img src="..."> tag.
//           Handles both absolute URLs and relative server paths.
// PARAM:    imageUrl — the path stored in the database
// RETURNS:  A full URL string, or null if no image exists
// ------------------------------------------------------------
export function getImageSrc(imageUrl) {
  // Return null if no image has been set (UI can show placeholder)
  if (!imageUrl) return null;

  // If already a full URL (e.g. external link), use it as-is
  if (imageUrl.startsWith("http")) return imageUrl;

  // Otherwise prepend the backend server address
  return `http://localhost:5000${imageUrl}`;
}