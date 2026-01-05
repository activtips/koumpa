/**
 * Lambda Handler: Generate App
 * Clean architecture with separation of concerns
 */

let AppGenerationService, ErrorHandler, createLogger, validateRequest, appService;

try {
  AppGenerationService = require('./shared/services/app-generation.service');
  ErrorHandler = require('./shared/errors').ErrorHandler;
  createLogger = require('./shared/utils/logger').createLogger;
  validateRequest = require('./validators').validateRequest;

  // Initialize service (reused across warm starts)
  appService = new AppGenerationService();
} catch (initError) {
  console.error('LAMBDA INIT ERROR:', initError.message, initError.stack);
  // Export a handler that returns the init error
  exports.handler = async () => ({
    statusCode: 500,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      success: false,
      error: {
        message: `Lambda initialization failed: ${initError.message}`,
        stack: initError.stack
      }
    })
  });
}

/**
 * Main Lambda Handler
 */
if (ErrorHandler) {
  exports.handler = ErrorHandler.wrapHandler(async (event, context) => {
  const logger = createLogger('generate-app', context.requestId);
  const startTime = Date.now();

  // Log invocation
  logger.logInvocationStart(event);

  // Extract user ID from JWT
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  
  // Parse and validate request
  const body = JSON.parse(event.body);
  const validatedData = validateRequest(body);

  logger.info('Processing app generation request', {
    userId,
    promptLength: validatedData.prompt.length,
    framework: validatedData.framework
  });

  // Generate app
  const result = await appService.generateApp(
    userId,
    validatedData.prompt,
    {
      framework: validatedData.framework,
      isPublic: validatedData.isPublic,
      additionalInstructions: validatedData.additionalInstructions
    }
  );

  // Log completion
  const duration = Date.now() - startTime;
  logger.logInvocationEnd(duration, 200);

  // Return success response
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      data: result
    })
  };
  });
}
