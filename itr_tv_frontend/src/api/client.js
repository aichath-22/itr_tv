import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const tunnelHeaders = () => {
  // Évite la page d'avertissement interstitielle des tunnels temporaires
  // (localtunnel/ngrok) lors des tests avec un lien de démo.
  if (API_URL.includes("loca.lt")) return { "Bypass-Tunnel-Reminder": "true" };
  if (API_URL.includes("ngrok-free.app") || API_URL.includes("ngrok.app")) {
    return { "ngrok-skip-browser-warning": "true" };
  }
  return {};
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: tunnelHeaders(),
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("itr_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rafraîchissement automatique du token en cas de 401
let isRefreshing = false;
let queue = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("itr_refresh_token");
      if (!refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem("itr_access_token", data.access);
        queue.forEach((p) => p.resolve(data.access));
        queue = [];
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        queue.forEach((p) => p.reject(refreshError));
        queue = [];
        localStorage.removeItem("itr_access_token");
        localStorage.removeItem("itr_refresh_token");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
