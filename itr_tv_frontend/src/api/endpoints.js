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
export const createJournalist = (payload) => apiClient.post("/auth/journalists/", payload);

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

export const toggleLike = (slug) => apiClient.post(`/articles/${slug}/like/`);

export const postComment = (articleId, content) =>
  apiClient.post("/articles/comments/", { article: articleId, content });

// --- Web TV ---
export const getLiveStreams = () => apiClient.get("/webtv/live/");
export const createLiveStream = (payload) => apiClient.post("/webtv/live/", payload);
export const updateLiveStream = (id, payload) => apiClient.patch(`/webtv/live/${id}/`, payload);
export const deleteLiveStream = (id) => apiClient.delete(`/webtv/live/${id}/`);

export const getVideos = (params = {}) =>
  apiClient.get("/webtv/videos/", { params });
export const createVideo = (payload) => apiClient.post("/webtv/videos/", payload);
export const updateVideo = (id, payload) => apiClient.patch(`/webtv/videos/${id}/`, payload);
export const deleteVideo = (id) => apiClient.delete(`/webtv/videos/${id}/`);

export const getPrograms = () => apiClient.get("/webtv/programs/");
export const createProgram = (payload) => apiClient.post("/webtv/programs/", payload);
export const updateProgram = (slug, payload) => apiClient.patch(`/webtv/programs/${slug}/`, payload);
export const deleteProgram = (slug) => apiClient.delete(`/webtv/programs/${slug}/`);

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
