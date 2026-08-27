import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/lib/apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Concurrent requests that all 401 at once must share a single refresh call —
// otherwise each one independently POSTs /auth/refresh, and the resulting
// race can rotate the refresh token cookie out from under a request that's
// still in flight.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const csrfToken = useAuthStore.getState().csrfToken;
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
        }
      )
      .then((response) => {
        const { accessToken, csrfToken: nextCsrfToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);
        useAuthStore.getState().setCsrfToken(nextCsrfToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export { refreshAccessToken };
export default api;
