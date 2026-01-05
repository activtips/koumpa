/**
 * Custom Error Classes
 * Typed errors for better error handling and debugging
 */

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field
    };
  }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

/**
 * Resource Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404);
    this.resource = resource;
    this.id = id;
  }
}

/**
 * Insufficient Credits Error (403)
 */
class InsufficientCreditsError extends AppError {
  constructor(required = 1, available = 0) {
    super(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      403
    );
    this.required = required;
    this.available = available;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      required: this.required,
      available: this.available,
      suggestion: 'Upgrade your plan or wait for daily bonus credits'
    };
  }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter
    };
  }
}

/**
 * External Service Error (502)
 */
class ExternalServiceError extends AppError {
  constructor(service, originalError = null) {
    super(`External service error: ${service}`, 502);
    this.service = service;
    this.originalError = originalError?.message;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
      originalError: this.originalError
    };
  }
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
  constructor(operation, originalError = null) {
    super(`Database operation failed: ${operation}`, 500);
    this.operation = operation;
    this.originalError = originalError?.message;
    this.originalCode = originalError?.code || originalError?.name;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      originalError: this.originalError,
      originalCode: this.originalCode
    };
  }
}

/**
 * Error Handler Utility
 */
class ErrorHandler {
  /**
   * Handle error and return API Gateway response
   */
  static handle(error, logger = console) {
    // Always log full error details for debugging
    console.error('ERROR DETAILS:', JSON.stringify({
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      isOperational: error.isOperational
    }, null, 2));

    // Log error
    if (error.isOperational) {
      logger.warn('Operational error:', {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode
      });
    } else {
      logger.error('Unexpected error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    // Determine status code
    const statusCode = error.statusCode || 500;

    // Determine if we should expose error details
    // Always expose in staging for debugging
    const isProduction = process.env.NODE_ENV === 'production' && !process.env.STAGE?.includes('staging');
    const shouldExposeDetails = true; // Always expose for now to debug

    // Build error response body
    let errorBody;
    if (shouldExposeDetails) {
      // Check if error has toJSON method (AppError and subclasses)
      if (typeof error.toJSON === 'function') {
        errorBody = error.toJSON();
      } else {
        // Regular Error - extract info manually
        errorBody = {
          error: error.name || 'Error',
          message: error.message || 'An error occurred',
          statusCode
        };
      }
    } else {
      errorBody = {
        error: 'InternalServerError',
        message: 'An unexpected error occurred',
        statusCode: 500
      };
    }

    // Build response
    const response = {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: errorBody
      })
    };

    return response;
  }

  /**
   * Wrap async handler with error handling
   */
  static wrapHandler(handler) {
    return async (event, context) => {
      try {
        return await handler(event, context);
      } catch (error) {
        return ErrorHandler.handle(error);
      }
    };
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  InsufficientCreditsError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  ErrorHandler
};
