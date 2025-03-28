import axios from 'axios';

// Helper to check if code is running in browser environment
const isBrowser = () => typeof window !== 'undefined';

// Function to get token from cookies or localStorage
const getToken = () => {
  if (!isBrowser()) return null;
  
  // Try to get from cookies first (for SSR compatibility)
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
  }
  
  // Fallback to localStorage
  return localStorage.getItem('accessToken');
};

const apiClient = axios.create({
  baseURL: 'https://aproxyluxe-production.up.railway.app/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
