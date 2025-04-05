import axios from 'axios';

// Get API configuration from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_APP_API_TIMEOUT || '10000', 10);
const API_VERSION = import.meta.env.VITE_APP_API_VERSION || 'v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}/${API_VERSION}`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    // Check if authentication is enabled
    const authEnabled = import.meta.env.VITE_APP_AUTH_ENABLED !== 'false';
    
    if (authEnabled) {
      const token = localStorage.getItem(import.meta.env.VITE_APP_AUTH_TOKEN_KEY || 'auth_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle different error scenarios
    const { response } = error;
    
    if (response) {
      // Handle unauthorized access - redirect to login or refresh token
      if (response.status === 401) {
        localStorage.removeItem(import.meta.env.VITE_APP_AUTH_TOKEN_KEY || 'auth_token');
        
        // If we're not already on the login page, redirect there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Show error notification or handle specific error codes
      const errorMessage = response.data && response.data.message 
        ? response.data.message 
        : 'An unexpected error occurred';
      
      console.error('API Error:', errorMessage);
      
      // You could dispatch an action to show notification here if store is available
      // e.g., store.dispatch('addNotification', { type: 'error', message: errorMessage });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server');
      
      // You could dispatch an action to show notification here
      // e.g., store.dispatch('addNotification', { type: 'error', message: 'Network error. Please check your connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Service methods (can be extended as needed)
const apiService = {
  /**
   * Make a GET request
   * @param {string} url - The URL to request
   * @param {Object} config - Additional configuration for the request
   * @returns {Promise} - Promise with response
   */
  get(url, config = {}) {
    return apiClient.get(url, config);
  },
  
  /**
   * Make a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} config - Additional configuration for the request
   * @returns {Promise} - Promise with response
   */
  post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config);
  },
  
  /**
   * Make a PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} config - Additional configuration for the request
   * @returns {Promise} - Promise with response
   */
  put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config);
  },
  
  /**
   * Make a PATCH request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} config - Additional configuration for the request
   * @returns {Promise} - Promise with response
   */
  patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config);
  },
  
  /**
   * Make a DELETE request
   * @param {string} url - The URL to request
   * @param {Object} config - Additional configuration for the request
   * @returns {Promise} - Promise with response
   */
  delete(url, config = {}) {
    return apiClient.delete(url, config);
  }
};

export default apiService; 