import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  AuthTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./token-storage";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = "https://api.proxy.luxe/api/v1/";
let refreshPromise: Promise<AuthTokens> | null = null;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }
    console.log("Sending headers:", config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isLoginOrRefreshRequest =
      originalRequest?.url?.includes("/auth/admin-login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isLoginOrRefreshRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<AuthTokens>(`${API_BASE_URL}auth/refresh`, { refreshToken })
          .then(({ data }) => data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const tokens = await refreshPromise;
      saveTokens(tokens);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();

      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }

      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
