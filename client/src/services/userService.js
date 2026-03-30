const KEY = "citylink_users";

export async function fetchUsers() {
  return JSON.parse(localStorage.getItem("citylink_users") || "[]");
}

export function saveUsers(users) {
  localStorage.setItem(KEY, JSON.stringify(users));
  return users;
}

export function updateUser(id, updatedFields) {
  const list = fetchUsers();
  const updated = list.map(user =>
    user.id === id ? { ...user, ...updatedFields } : user
  );
  saveUsers(updated);
  return updated;
}

export function deleteUser(id) {
  const list = fetchUsers();
  const updated = list.filter(user => user.id !== id);
  saveUsers(updated);
  return updated;
}