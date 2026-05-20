// bookingService.js — Sprint 3
import BASE_URL from "./api";
import { authHeaders } from "../context/AuthContext";

const URL = `${BASE_URL}/bookings`;

export async function fetchBookings() {
  const res = await fetch(URL, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function updateBooking(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
}

export async function deleteBooking(id) {
  const res = await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
}