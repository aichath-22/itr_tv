import { apiClient } from "./client";

// --- Auth ---
export const login = (username, password) =>
  apiClient.post("/auth/login/", { username, password });

export const register = (payload) =>
  apiClient.post("/auth/register/", payload);

export const getMe = () => apiClient.get("/auth/me/");

export const getUsers = (search = "") =>
  apiClient.get("/auth/users/", { params: search ? { search } : {} });
export const updateUser = (id, payload) => apiClient.patch(`/auth/users/${id}/`, payload);

// --- Articles ---
export const getArticles = (params = {}) =>
  apiClient.get("/articles/", { params });

export const getArticle = (slug) => apiClient.get(`/articles/${slug}/`);

export const getCategories = () => apiClient.get("/articles/categories/");
export const createCategory = (payload) => apiClient.post("/articles/categories/", payload);
export const deleteCategory = (slug) => apiClient.delete(`/articles/categories/${slug}/`);

export const getTags = () => apiClient.get("/articles/tags/");
export const createTag = (name) => apiClient.post("/articles/tags/", { name });

export const submitArticle = (slug) =>
  apiClient.post(`/articles/${slug}/submit/`);

export const reviewArticle = (slug, decision, comment = "") =>
  apiClient.post(`/articles/${slug}/review/`, { decision, comment });

export const createArticle = (payload) =>
  apiClient.post("/articles/", payload);

export const updateArticle = (slug, payload) =>
  apiClient.patch(`/articles/${slug}/`, payload);

export const deleteArticle = (slug) => apiClient.delete(`/articles/${slug}/`);

export const getArticleReviews = (articleId) =>
  apiClient.get("/newsroom/reviews/", { params: { article: articleId } });

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
export const createBanner = (payload) => apiClient.post("/ads/banners/", payload);
export const updateBanner = (id, payload) => apiClient.patch(`/ads/banners/${id}/`, payload);
export const deleteBanner = (id) => apiClient.delete(`/ads/banners/${id}/`);

export const getSponsors = () => apiClient.get("/ads/sponsors/");
export const createSponsor = (payload) => apiClient.post("/ads/sponsors/", payload);
export const deleteSponsor = (id) => apiClient.delete(`/ads/sponsors/${id}/`);

// --- Newsletter ---
export const subscribeNewsletter = (email) =>
  apiClient.post("/newsletter/subscribe/", { email });

// --- Notifications ---
export const getBreakingNews = () => apiClient.get("/notifications/breaking/");

// --- Stats ---
export const getDashboard = () => apiClient.get("/stats/dashboard/");
