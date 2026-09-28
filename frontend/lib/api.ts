import axios from "axios";

const api = axios.create({
  baseURL: "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const requestUrl = (error as { config?: { url?: string } }).config?.url ?? "";
    const status = (error as { response?: { status?: number } }).response?.status;
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/logout")
    ) {
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
