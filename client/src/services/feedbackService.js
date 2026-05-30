// feedbackService.js — Sprint 3 Week 11
// API calls for the feedback system — connected to MongoDB
// submitFeedback is public (residents can submit without logging in)
// fetchFeedback, updateFeedback and deleteFeedback are used by the admin page

import BASE_URL from "./api";

const URL = `${BASE_URL}/feedback`;

// Submit a new feedback entry from the public /feedback page
// POST /api/feedback — no auth required, anyone can submit
export async function submitFeedback(data) {
  const res = await fetch(URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit feedback");
  }
  return res.json();
}

// Get all feedback submissions — used by the admin Manage Feedback page
// GET /api/feedback
export async function fetchFeedback() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

// Update a feedback item — used to change status or save a response
// PUT /api/feedback/:id
export async function updateFeedback(id, data) {
  const res = await fetch(`${URL}/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update feedback");
  return res.json();
}

// Delete a feedback record permanently
// DELETE /api/feedback/:id
export async function deleteFeedback(id) {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
  return res.json();
}