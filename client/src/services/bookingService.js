// bookingService.js — Sprint 3 Week 8: all calls hit the real MongoDB API
import BASE_URL from "./api";

const URL = `${BASE_URL}/bookings`;

export async function fetchBookings() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function updateBooking(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
}

export async function deleteBooking(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
}