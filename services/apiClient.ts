
import axios, { AxiosError } from 'axios';

// Safely access environment variables via polyfilled process
const env = (typeof window !== 'undefined' && (window as any).process?.env) || {};
const IS_DEMO_MODE = env.VITE_DEMO_MODE === 'true'; 
const BASE_URL = env.VITE_API_URL || 'http://localhost:8080/api/v1';


export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (IS_DEMO_MODE) {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
