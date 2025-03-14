import axios from "axios";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token in requests
api.interceptors.request.use((config) => {
  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // If token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
