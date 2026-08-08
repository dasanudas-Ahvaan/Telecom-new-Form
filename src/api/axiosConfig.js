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

export default api;
