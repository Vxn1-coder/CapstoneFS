import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

if (!process.env.REACT_APP_API_URL) {
  console.warn("⚠️ Using localhost API. Check env variables.");
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
