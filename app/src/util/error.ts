/* eslint-disable @typescript-eslint/no-explicit-any */

export function extractError(error: Error | any): string {
  let errorMessage = 'An unexpected error occurred';

  try {
    // Check if this is an error that was already processed by the axios interceptor
    if (error instanceof Error && error.message && !(error as any).response) {
      return error.message;
    }

    if (error?.response) {
      // Server responded with error status (Axios error)
      const status = error.response.status;
      const errorData = error.response.data as any;

      // Handle cases where the response data is a string containing JSON
      let parsedData = errorData;
      if (typeof errorData === 'string') {
        try {
          // Try to parse JSON from string response
          parsedData = JSON.parse(errorData);
        } catch {
          // If parsing fails, check if it contains error information
          if (errorData.includes('"error":')) {
            // Extract error from JSON-like string
            const errorMatch = errorData.match(/"error":"([^"]+)"/);
            if (errorMatch) {
              return errorMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r');
            }
          }
          // Return the string as-is if no JSON structure found
          return errorData;
        }
      }

      switch (status) {
        case 400:
          // Bad Request - Gin validation errors or client errors
          if (parsedData?.error) {
            errorMessage = parsedData.error;
          } else if (parsedData?.message) {
            errorMessage = parsedData.message;
          } else if (parsedData?.errors && Array.isArray(parsedData.errors)) {
            // Handle Gin validation errors array
            errorMessage = parsedData.errors.join(', ');
          } else {
            errorMessage = 'Bad Request: Invalid data provided';
          }
          break;

        case 401:
          // Unauthorized
          errorMessage = parsedData?.error || parsedData?.message || 'Authentication required';
          break;

        case 403:
          // Forbidden
          errorMessage = parsedData?.error || parsedData?.message || 'Access denied';
          break;

        case 404:
          // Not Found
          errorMessage = parsedData?.error || parsedData?.message || 'Resource not found';
          break;

        case 409:
          // Conflict - Resource already exists
          errorMessage = parsedData?.error || parsedData?.message || 'Resource conflict';
          break;

        case 422:
          // Unprocessable Entity - Gin validation errors
          if (parsedData?.error) {
            errorMessage = parsedData.error;
          } else if (parsedData?.message) {
            errorMessage = parsedData.message;
          } else if (parsedData?.errors) {
            if (Array.isArray(parsedData.errors)) {
              errorMessage = parsedData.errors.join(', ');
            } else if (typeof parsedData.errors === 'object') {
              // Handle field-specific validation errors
              const fieldErrors = Object.entries(parsedData.errors)
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
          errorMessage =
            parsedData?.error ||
            parsedData?.message ||
            'Too many requests. Please try again later.';
          break;

        case 500:
          // Internal Server Error
          errorMessage = parsedData?.error || parsedData?.message || 'Internal server error';
          break;

        default:
          // Other server errors
          errorMessage = parsedData?.error || parsedData?.message || `Server error (${status})`;
          break;
      }
    } else if (error?.request) {
      // Network error - no response received
      errorMessage = 'Network error. Please check your connection.';
    } else if (error instanceof Error) {
      // Standard Error object
      errorMessage = error.message || 'An unexpected error occurred';
    } else if (typeof error === 'string') {
      // String error
      errorMessage = error;
    } else {
      // Something else happened
      errorMessage = 'An unexpected error occurred';
    }
  } catch (extractorError) {
    // Error in the extractor itself
    console.error('Error extractor error:', extractorError);
    errorMessage = 'An unexpected error occurred';
  }

  return errorMessage;
}
