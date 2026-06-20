// src/lib/api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Store token outside React tree for axios interceptors
let currentAccessToken: string | null = null;

export type SessionObserver = (token: string | null) => void;
const observers: SessionObserver[] = [];

export const onSessionUpdate = (cb: SessionObserver) => {
  observers.push(cb);
  return () => {
    const index = observers.indexOf(cb);
    if (index > -1) observers.splice(index, 1);
  };
};

const notifyObservers = (token: string | null) => {
  observers.forEach(cb => cb(token));
};

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
  notifyObservers(token);
};

export const getAccessToken = () => {
  if (currentAccessToken) return currentAccessToken;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      currentAccessToken = stored;
      return stored;
    }
  }
  return null;
};

// Create the base Axios client
const IS_SERVER = typeof window === 'undefined';
export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (like the refresh token) are sent with requests to the backend
  withCredentials: true,
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const url = config.url || '';

  if (!IS_SERVER) {
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${url} | Token: ${token ? 'FOUND' : 'MISSING'}`);
  }

  // Ensure headers object exists
  config.headers = config.headers || {} as any;

  // Set Authorization header if token exists
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error: any) => Promise.reject(error));

// Keep track of any ongoing refresh attempt to avoid race conditions
let refreshPromise: Promise<string | null> | null = null;

// Response interceptor: handle 401 silent refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const responseData = error.response?.data as any;

    const errorMessage =
      responseData?.error?.message ||
      responseData?.message ||
      (typeof responseData === 'string' ? responseData : '');

    const isTokenExpired = error.response?.status === 401 || errorMessage.includes('invalidAccessToken');

    if (isTokenExpired && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        setAccessToken(null);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If a refresh is already in progress, wait for it
      if (refreshPromise) {
        console.log('⏳ Refresh already in progress, queuing request...');
        try {
          const newToken = await refreshPromise;
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {} as any;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }

      console.log('🔄 Session expired, attempting background refresh...');

      // Create the refresh promise
      refreshPromise = (async () => {
        try {
          const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

          if (!storedRefreshToken) {
            console.warn('⚠️ Client: Cannot refresh session - no refreshToken in localStorage');
            setAccessToken(null);
            return null;
          }

          const res: AxiosResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/refresh`, {
            headers: { Authorization: `Bearer ${storedRefreshToken}` },
            withCredentials: true
          });

          const responseData = res.data?.data || res.data;
          const newAccessToken = responseData?.accessToken || responseData?.access_token;
          const newRefreshToken = responseData?.refreshToken || responseData?.refresh_token;

          if (newAccessToken) {
            console.log('✅ Client: Refresh successful');

            if (newRefreshToken && typeof window !== 'undefined') {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            setAccessToken(newAccessToken);
            return newAccessToken;
          } else {
            console.warn('⚠️ Refresh endpoint returned success but no accessToken');
            setAccessToken(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('refreshToken');
            }
            return null;
          }
        } catch (refreshError: any) {
          console.error('❌ Background refresh failed:', refreshError.response?.status || refreshError.message);
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('refreshToken');
          }
          throw refreshError;
        } finally {
          refreshPromise = null;
        }
      })();

      try {
        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {} as any;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
