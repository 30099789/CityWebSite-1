const KEY = "citylink_announcements";

export async function fetchAnnouncements() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveAnnouncements(announcements) {
  localStorage.setItem(KEY, JSON.stringify(announcements));
  return announcements;
}

export function addAnnouncement(newAnnouncement) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");

  const announcement = {
    id: Date.now(),
    ...newAnnouncement,
  };

  const updated = [announcement, ...list];
  localStorage.setItem(KEY, JSON.stringify(updated));

  return updated;
}

export function updateAnnouncement(id, updatedFields) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");

  const updated = list.map(item =>
    item.id === id ? { ...item, ...updatedFields } : item
  );

  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function deleteAnnouncement(id) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");

  const updated = list.filter(item => item.id !== id);

  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}