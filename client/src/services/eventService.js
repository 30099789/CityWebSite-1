// bookingService.js — Sprint 3
// API calls for managing bookings — all routes require a JWT token (admin/staff only)
// Residents create bookings directly from EventDetail.jsx using fetch()
// These functions are used by the ManageBookings admin page

import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const URL = `${BASE_URL}/bookings`;

// Get all bookings — used by the admin Manage Bookings page
// GET /api/bookings — requires admin or staff token
export async function fetchBookings() {
  const res = await fetch(URL, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

// Update a booking status (Confirmed / Pending / Cancelled)
// PUT /api/bookings/:id — requires admin or staff token
export async function updateBooking(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
}

// Delete a booking record permanently
// DELETE /api/bookings/:id — requires admin or staff token
export async function deleteBooking(id) {
  const res = await fetch(`${URL}/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
}