const KEY = "citylink_feedback";

export async function fetchFeedback() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveFeedback(feedback) {
  localStorage.setItem(KEY, JSON.stringify(feedback));
  return feedback;
}

export function updateFeedback(id, updatedFields) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");

  const updated = list.map(item =>
    item.id === id ? { ...item, ...updatedFields } : item
  );

  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function deleteFeedback(id) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");

  const updated = list.filter(item => item.id !== id);

  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}