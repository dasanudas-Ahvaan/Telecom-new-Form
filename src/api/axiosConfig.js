import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
  withCredentials: true, // MUST be true to send/receive cookies
});


api.interceptors.request.use(
  (config) => {
    // 1. Optimized cookie parsing using Regex
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const csrfToken = getCookie("XSRF-TOKEN");

    // 2. Attach only if it exists
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
