/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone number is valid
 */
export const isValidPhone = (phone) => {
  if (isEmpty(phone)) return false;
  
  // Remove non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it has at least 10 digits
  return cleaned.length >= 10;
};

/**
 * Validate a password (min length 8, at least one uppercase, one lowercase, one number)
 * @param {string} password - The password to validate
 * @returns {object} Validation result with valid flag and message
 */
export const validatePassword = (password) => {
  if (isEmpty(password)) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is valid' };
};

/**
 * Validate a form field
 * @param {*} value - The field value
 * @param {string} fieldName - The field name
 * @param {object} options - Validation options
 * @returns {object} Validation result with valid flag and message
 */
export const validateField = (value, fieldName, options = {}) => {
  const { required = false, minLength, maxLength, pattern, type } = options;
  
  // Required validation
  if (required && isEmpty(value)) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  // Skip other validations if the field is empty and not required
  if (isEmpty(value) && !required) {
    return { valid: true, message: '' };
  }
  
  // String validations
  if (typeof value === 'string') {
    // Min length validation
    if (minLength && value.length < minLength) {
      return { valid: false, message: `${fieldName} must be at least ${minLength} characters long` };
    }
    
    // Max length validation
    if (maxLength && value.length > maxLength) {
      return { valid: false, message: `${fieldName} must be no more than ${maxLength} characters long` };
    }
    
    // Pattern validation
    if (pattern && !pattern.test(value)) {
      return { valid: false, message: `${fieldName} format is invalid` };
    }
    
    // Type-specific validations
    if (type === 'email' && !isValidEmail(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    if (type === 'phone' && !isValidPhone(value)) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
  }
  
  return { valid: true, message: '' };
}; 