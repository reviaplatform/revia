import axios from 'axios';

export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://lightsalmon-ibis-912038.hostingersite.com').replace(/\/$/, '');

// We use /api/v1/provider as the base for this app
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1/provider`,
  headers: {
    'Accept': 'application/json',
  },
});

// Export 'api' as an alias for backward compatibility
export const api = apiClient;

/**
 * Ensures an image/media URL is absolute by prefixing it with the BACKEND_URL
 * if it's a relative path.
 */
export function getMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    // If it's already an absolute URL (http, https, data, blob), return it
    if (/^https?:\/\/|data:|blob:/.test(path)) return path;
    
    // Remove leading slash if any
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // If we're in local development and the path starts with localhost, just return it
    // (This helps if the backend returns a full localhost URL while the frontend is on a different domain)
    if (cleanPath.includes('localhost:')) {
        return cleanPath.startsWith('http') ? cleanPath : `http://${cleanPath}`;
    }

    return `${BACKEND_URL}/${cleanPath}`;
}

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in the browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('providerAccessToken');
      console.log('API Request Interceptor - Token found:', !!token);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
