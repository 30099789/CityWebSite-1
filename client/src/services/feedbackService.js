// feedbackService.js — Sprint 3 Week 11
// Wired to real MongoDB API
import BASE_URL from "./api";

const URL = `${BASE_URL}/feedback`;

export async function submitFeedback(data) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit feedback");
  }
  return res.json();
}

export async function fetchFeedback() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

export async function updateFeedback(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update feedback");
  return res.json();
}

export async function deleteFeedback(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
  return res.json();
}