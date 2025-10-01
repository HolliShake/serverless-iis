/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios"

const api = axios.create({
    baseURL: (import.meta as any).env.VITE_APP_API_URL || 'http://localhost:8080/api',
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor for adding auth tokens, etc.
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        let errorMessage = 'An unexpected error occurred';
        
        try {
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const errorData = error.response.data as any;
                
                switch (status) {
                    case 400:
                        // Bad Request - Gin validation errors or client errors
                        if (errorData?.error) {
                            errorMessage = errorData.error;
                        } else if (errorData?.message) {
                            errorMessage = errorData.message;
                        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
                            // Handle Gin validation errors array
                            errorMessage = errorData.errors.join(', ');
                        } else {
                            errorMessage = 'Bad Request: Invalid data provided';
                        }
                        break;
                        
                    case 401:
                        // Unauthorized - Clear auth and redirect to login
                        errorMessage = errorData?.error || errorData?.message || 'Authentication required';
                        localStorage.removeItem('auth_token');
                        // Optionally redirect to login
                        window.location.href = '/login';
                        break;
                        
                    case 403:
                        // Forbidden
                        errorMessage = errorData?.error || errorData?.message || 'Access denied';
                        break;
                        
                    case 404:
                        // Not Found
                        errorMessage = errorData?.error || errorData?.message || 'Resource not found';
                        break;
                        
                    case 409:
                        // Conflict - Resource already exists
                        errorMessage = errorData?.error || errorData?.message || 'Resource conflict';
                        break;
                        
                    case 422:
                        // Unprocessable Entity - Gin validation errors
                        if (errorData?.error) {
                            errorMessage = errorData.error;
                        } else if (errorData?.message) {
                            errorMessage = errorData.message;
                        } else if (errorData?.errors) {
                            if (Array.isArray(errorData.errors)) {
                                errorMessage = errorData.errors.join(', ');
                            } else if (typeof errorData.errors === 'object') {
                                // Handle field-specific validation errors
                                const fieldErrors = Object.entries(errorData.errors)
                                    .map(([field, error]) => `${field}: ${error}`)
                                    .join(', ');
                                errorMessage = fieldErrors;
                            }
                        } else {
                            errorMessage = 'Validation failed';
                        }
                        break;
                        
                    case 429:
                        // Too Many Requests
                        errorMessage = errorData?.error || errorData?.message || 'Too many requests. Please try again later.';
                        break;
                        
                    case 500:
                        // Internal Server Error - Log but don't show toast to user
                        errorMessage = 'Internal server error';
                        console.error('Server Error (500):', {
                            url: error.config?.url,
                            method: error.config?.method,
                            data: errorData,
                            headers: error.config?.headers
                        });
                        break;
                        
                    default:
                        // Other server errors
                        errorMessage = errorData?.error || errorData?.message || `Server error (${status})`;
                        break;
                }
            } else if (error.request) {
                // Network error - no response received
                errorMessage = 'Network error. Please check your connection.';
                console.error('Network Error:', error.request);
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
                console.error('Request Error:', error.message);
            }
        } catch (interceptorError) {
            // Error in the interceptor itself
            console.error('Response interceptor error:', interceptorError);
        }
        
        // Create a new error with the processed message
        const processedError = new Error(errorMessage);
        (processedError as any).originalError = error;
        (processedError as any).status = error.response?.status;
        
        return Promise.reject(processedError);
    }
);

export default api;
