const KEY = "citylink_bookings";

export async function fetchBookings() {
  return JSON.parse(localStorage.getItem("citylink_bookings") || "[]");
}

export function saveBookings(bookings) {
  localStorage.setItem(KEY, JSON.stringify(bookings));
  return bookings;
}

export function updateBooking(id, updatedFields) {
  const list = fetchBookings();
  const updated = list.map(item =>
    item.id === id ? { ...item, ...updatedFields } : item
  );
  saveBookings(updated);
  return updated;
}