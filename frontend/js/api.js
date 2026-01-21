/**
 * API Integration Module for Car Rental System
 * Handles all API calls to the backend
 */

// Detect if we are running locally or on a deployed server
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage if it exists
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = { headers: {} };

  // Only set JSON content-type when body is NOT FormData
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  // Add authorization header if token exists
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        error: data.error || null,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Authentication API Endpoints
 */
const AuthAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

/**
 * Car Management API Endpoints
 */
const CarAPI = {
  /**
   * Get all cars
   */
  getAll: async () => {
    return apiRequest('/cars', {
      method: 'GET',
    });
  },

  /**
   * Get car by ID
   */
  getById: async (carId) => {
    return apiRequest(`/cars/${carId}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new car
   */
  create: async (carData) => {
    // Backend expects multipart/form-data with field "image"
    if (typeof FormData !== 'undefined' && carData instanceof FormData) {
      return apiRequest('/cars', {
        method: 'POST',
        body: carData,
      });
    }

    // Back-compat: allow plain object (no image) but backend will reject without file
    return apiRequest('/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    });
  },

  /**
   * Update car details
   */
  update: async (carId, carData) => {
    return apiRequest(`/cars/${carId}`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    });
  },

  /**
   * Delete car
   */
  delete: async (carId) => {
    return apiRequest(`/cars/${carId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Rental API Endpoints
 */
const RentalAPI = {
  /**
   * Get all rentals
   */
  getAll: async () => {
    return apiRequest('/rentals', {
      method: 'GET',
    });
  },

  /**
   * Get rental by ID
   */
  getById: async (rentalId) => {
    return apiRequest(`/rentals/${rentalId}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new rental
   */
  create: async (rentalData) => {
    return apiRequest('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },

  /**
   * Update rental status
   */
  updateStatus: async (rentalId, rentalData) => {
    return apiRequest(`/rentals/${rentalId}`, {
      method: 'PUT',
      body: JSON.stringify(rentalData),
    });
  },

  /**
   * Accept rental (Admin only)
   */
  accept: async (rentalId) => {
    return apiRequest(`/rentals/accept/${rentalId}`, {
      method: 'PUT',
    });
  },

  /**
   * Reject rental (Admin only)
   */
  reject: async (rentalId) => {
    return apiRequest(`/rentals/reject/${rentalId}`, {
      method: 'PUT',
    });
  },

  /**
   * Cancel rental
   */
  delete: async (rentalId) => {
    return apiRequest(`/rentals/${rentalId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * User API Endpoints
 */
const UserAPI = {
  /**
   * Get all users (Admin only)
   */
  getAll: async () => {
    return apiRequest('/users', {
      method: 'GET',
    });
  },
  /**
   * Get user profile
   */
  getProfile: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user account
   */
  deleteAccount: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Review API Endpoints
 */
const ReviewAPI = {
  /**
   * Create a review
   */
  create: async (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * Get reviews for a car
   */
  getByCarId: async (carId) => {
    return apiRequest(`/reviews/car/${carId}`, {
      method: 'GET',
    });
  },

  /**
   * Update review
   */
  update: async (reviewId, reviewData) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * Delete review
   */
  delete: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Payment API Endpoints
 */
const PaymentAPI = {
  /**
   * Process payment
   */
  processPayment: async (paymentData) => {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Get payment details
   */
  getById: async (paymentId) => {
    return apiRequest(`/payments/${paymentId}`, {
      method: 'GET',
    });
  },

  /**
   * Update payment status
   */
  updateStatus: async (paymentId, statusData) => {
    return apiRequest(`/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },
};

/**
 * Health Check
 */
const HealthAPI = {
  check: async () => {
    return apiRequest('/health', {
      method: 'GET',
    });
  },
};

// Export all APIs
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AuthAPI,
    CarAPI,
    RentalAPI,
    UserAPI,
    ReviewAPI,
    PaymentAPI,
    HealthAPI,
    apiRequest,
  };
}
