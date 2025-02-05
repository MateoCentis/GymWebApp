import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercepta la request antes de enviarla para incluir el token, permitiendo autenticarnos
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Se pasa el JWT Token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
