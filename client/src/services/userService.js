import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const fetchUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createUser = async (user) => {
  const res = await axios.post(API_URL, user);
  return res.data;
};

export const updateUser = async (id, user) => {
  const res = await axios.put(`${API_URL}/${id}`, user);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};