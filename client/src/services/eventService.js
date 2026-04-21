import axios from "axios";

const API_URL = "http://localhost:5000/api/events";

export const fetchEvents = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createEvent = async (event) => {
  const res = await axios.post(API_URL, event);
  return res.data;
};

export const updateEvent = async (id, event) => {
  const res = await axios.put(`${API_URL}/${id}`, event);
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};