
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Robust environment access using the polyfilled process
// @ts-ignore
const env = window.process?.env || {};
const IS_DEMO_MODE = env.VITE_DEMO_MODE === 'true';
const BASE_URL = env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout for demo safety
});

// 1. Auth Interceptor: Inject JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // DEMO LOGGER: Show network activity in console
    if (IS_DEMO_MODE) {
      console.groupCollapsed(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Payload:', config.data);
      console.groupEnd();
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    if (IS_DEMO_MODE) {
      console.groupCollapsed(`✅ API Response: ${response.config.url}`);
      console.log('Data:', response.data);
      console.groupEnd();
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle Network Errors (Backend down)
    if (!error.response) {
      // Don't show toast for simple network errors to avoid spamming on load
      console.warn('Network error or backend unreachable.');
      
      // Fallback for Demo Mode if backend is dead
      if (IS_DEMO_MODE) {
        console.warn('⚠️ Backend unreachable. Switching to local mock data.');
        return Promise.reject(error); // Or return mock data here
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_storage'); // Clear Zustand persistence
      window.location.href = '/signin';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
