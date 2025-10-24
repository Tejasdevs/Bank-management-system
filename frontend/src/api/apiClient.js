import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// Check sessionStorage for token on app load
const token = sessionStorage.getItem("bms_token");
if (token) {
  client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function setAuthToken(token) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export default client;
