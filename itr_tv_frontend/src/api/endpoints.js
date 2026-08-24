import { apiClient } from "./client";

// --- Auth ---
export const login = (username, password) =>
  apiClient.post("/auth/login/", { username, password });

export const register = (payload) =>
  apiClient.post("/auth/register/", payload);

export const getMe = () => apiClient.get("/auth/me/");

// --- Articles ---
export const getArticles = (params = {}) =>
  apiClient.get("/articles/", { params });

export const getArticle = (slug) => apiClient.get(`/articles/${slug}/`);

export const getCategories = () => apiClient.get("/articles/categories/");

export const submitArticle = (slug) =>
  apiClient.post(`/articles/${slug}/submit/`);

export const reviewArticle = (slug, decision) =>
  apiClient.post(`/articles/${slug}/review/`, { decision });

export const createArticle = (payload) =>
  apiClient.post("/articles/", payload);

export const postComment = (articleId, content) =>
  apiClient.post("/articles/comments/", { article: articleId, content });

// --- Web TV ---
export const getLiveStreams = () => apiClient.get("/webtv/live/");
export const getVideos = (params = {}) =>
  apiClient.get("/webtv/videos/", { params });
export const getPrograms = () => apiClient.get("/webtv/programs/");

// --- Ads ---
export const getBanners = (placement) =>
  apiClient.get("/ads/banners/", { params: { placement } });

// --- Newsletter ---
export const subscribeNewsletter = (email) =>
  apiClient.post("/newsletter/subscribe/", { email });

// --- Notifications ---
export const getBreakingNews = () => apiClient.get("/notifications/breaking/");

// --- Stats ---
export const getDashboard = () => apiClient.get("/stats/dashboard/");
