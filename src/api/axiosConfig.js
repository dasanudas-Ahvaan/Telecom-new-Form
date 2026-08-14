import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;

if (
  import.meta.env.NODE_ENV === "production" &&
  !API_URL.startsWith("https://")
) {
  throw new Error(
    "Insecure API URL detected. HTTPS is required in production.",
  );
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // MUST be true to send/receive cookies
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

api.interceptors.request.use((config) => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  if (cookie) {
    const csrfToken = cookie.substring("XSRF-TOKEN=".length);

    config.headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return config;
});

// 2. Response Interceptor for Silent Token Refresh (NEW)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentPath = window.location.pathname;

    // Prevent looping if we are already on the login page (/admin)
    if (currentPath === "/admin") {
      return Promise.reject(error);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Silently refresh the token using the HttpOnly refresh cookie
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // console.log("Kill switch activated!", refreshError);

        // If refresh fails permanently, redirect to login page
        if (currentPath !== "/admin") {
          window.location.href = "/admin";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
