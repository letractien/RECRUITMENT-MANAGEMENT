import axios from 'axios';

// Get API configuration from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_APP_API_TIMEOUT || '10000', 10);
const API_VERSION = import.meta.env.VITE_APP_API_VERSION || 'v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle different error scenarios
    const { response } = error;
    
    if (response) {
      // Handle validation errors (422) specifically
      if (response.status === 422) {
        console.error('API Error:', response.data);
        
        // If response contains validation_error and detail fields, it's a FastAPI validation error
        if (response.data && response.data.detail) {
          // Format and display validation errors
          const validationErrors = Array.isArray(response.data.detail) ? 
            response.data.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('\n') :
            response.data.detail;
            
          console.error('Validation errors:', validationErrors);
          error.validationErrors = response.data.detail;
        }
      } else {
        // Show error notification or handle specific error codes
        const errorMessage = response.data && response.data.detail 
          ? response.data.detail 
          : 'An unexpected error occurred';
        
        console.error('API Error:', errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Service methods
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