// frontend/src/utils/axiosInstance.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response (remove in production)
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.warn('⚠️ Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.warn('⚠️ Forbidden - insufficient permissions');
          break;

        case 404:
          // Not found
          console.warn('⚠️ Resource not found');
          break;

        case 500:
          // Server error
          console.error('❌ Server error');
          break;

        default:
          console.error(`❌ Error ${error.response.status}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from server - check your connection');
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;