const KEY = "citylink_events";

export async function fetchEvents() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveEvents(events) {
  localStorage.setItem(KEY, JSON.stringify(events));
}