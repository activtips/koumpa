/**
 * Lambda Handler: Generate App
 * Clean architecture with separation of concerns
 */

const AppGenerationService = require('../shared/services/app-generation.service');
const { ErrorHandler } = require('../shared/errors');
const { createLogger } = require('../shared/utils/logger');
const { validateRequest } = require('./validators');

// Initialize service (reused across warm starts)
const appService = new AppGenerationService();

/**
 * Main Lambda Handler
 */
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
