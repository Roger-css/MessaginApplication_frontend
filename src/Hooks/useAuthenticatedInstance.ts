import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useCallback, useEffect, useRef } from "react";
import { axios, axiosWithNoInterceptors } from "../API/Base";
import { useAuthStore } from "../Store/authStore";
import { RefreshTokenResponse } from "../Types/Auth";

export const useAxiosAuth = () => {
  // Zustand store selectors
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Track interceptor IDs to prevent duplicate interceptors
  const requestInterceptorId = useRef<number | null>(null);
  const responseInterceptorId = useRef<number | null>(null);

  // Track refresh state to prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false);
  const failedQueue = useRef<
    {
      resolve: (value: string) => void;
      reject: (error: any) => void;
    }[]
  >([]);

  // Process queued requests after token refresh
  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    failedQueue.current = [];
  };
  const refreshAccessToken = useCallback(async (): Promise<string> => {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      const response = await axiosWithNoInterceptors.post<RefreshTokenResponse>(
        "/auth/refresh",
        {
          refresh_token: refreshToken,
        }
      );

      const { access_token } = response.data;
      setAuth({ accessToken, refreshToken });
      return access_token;
    } catch (error) {
      logout();
      throw new Error("Failed to refresh token, error: " + error);
    }
  }, [accessToken, logout, refreshToken, setAuth]);

  // Setup interceptors
  useEffect(() => {
    // Request interceptor - Add auth header
    requestInterceptorId.current = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    responseInterceptorId.current = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };
        // Check if error is 401 and we haven't already retried
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          // If already refreshing, queue this request
          if (isRefreshing.current) {
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          // Mark as retrying
          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing.current = false;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      if (requestInterceptorId.current !== null) {
        axios.interceptors.request.eject(requestInterceptorId.current);
      }
      if (responseInterceptorId.current !== null) {
        axios.interceptors.response.eject(responseInterceptorId.current);
      }
    };
  }, [accessToken, refreshAccessToken, refreshToken]);
  return axios;
};
