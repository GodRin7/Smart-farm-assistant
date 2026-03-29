import axios from "axios";
import { setupMockAdapter } from "./mockAdapter";

// Set to true to use mock data (no backend needed).
// Set to false to use the real backend at http://localhost:5000
const USE_MOCK = false;

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

if (USE_MOCK) {
  setupMockAdapter(API);
}

API.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const user = JSON.parse(savedUser);

      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;