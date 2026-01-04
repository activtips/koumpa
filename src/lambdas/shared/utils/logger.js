/**
 * Structured Logger
 * Centralized logging with different levels and JSON output
 */

const config = require('../config');

class Logger {
  constructor(context = {}) {
    this.context = context;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.currentLevel = this.levels[config.logging.level] || this.levels.info;
  }

  /**
   * Format log message as JSON
   */
  format(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta
    });
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    if (this.currentLevel <= this.levels.debug) {
      console.log(this.format('DEBUG', message, meta));
    }
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    if (this.currentLevel <= this.levels.info) {
      console.log(this.format('INFO', message, meta));
    }
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn(this.format('WARN', message, meta));
    }
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    if (this.currentLevel <= this.levels.error) {
      const errorMeta = { ...meta };
      
      // Include stack trace if configured
      if (config.logging.includeStackTrace && meta.error) {
        errorMeta.stack = meta.error.stack;
      }
      
      console.error(this.format('ERROR', message, errorMeta));
    }
  }

  /**
   * Create child logger with additional context
   */
  child(context) {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Log Lambda invocation start
   */
  logInvocationStart(event) {
    this.info('Lambda invocation started', {
      httpMethod: event.requestContext?.http?.method,
      path: event.requestContext?.http?.path,
      sourceIp: event.requestContext?.http?.sourceIp,
      userAgent: event.requestContext?.http?.userAgent
    });
  }

  /**
   * Log Lambda invocation end
   */
  logInvocationEnd(duration, statusCode) {
    this.info('Lambda invocation completed', {
      duration: `${duration}ms`,
      statusCode
    });
  }
}

/**
 * Create logger with Lambda context
 */
function createLogger(functionName, requestId = null) {
  return new Logger({
    function: functionName,
    requestId
  });
}

module.exports = {
  Logger,
  createLogger
};
