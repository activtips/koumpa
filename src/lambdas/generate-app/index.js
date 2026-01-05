/**
 * Lambda Handler: Generate App
 * Clean architecture with separation of concerns
 */

// Simple test handler first to verify Lambda can start
exports.handler = async (event, context) => {
  console.log('Lambda started successfully!');
  console.log('Event:', JSON.stringify(event, null, 2));

  // Test basic initialization
  let initResult = { step: 'start' };

  try {
    initResult.step = 'loading errors';
    const { ErrorHandler } = require('./shared/errors');
    initResult.errorsLoaded = true;

    initResult.step = 'loading config';
    const config = require('./shared/config');
    initResult.configLoaded = true;
    initResult.tables = config.tables;

    initResult.step = 'loading validators';
    const { validateRequest } = require('./validators');
    initResult.validatorsLoaded = true;

    initResult.step = 'loading app-generation service';
    const AppGenerationService = require('./shared/services/app-generation.service');
    initResult.serviceLoaded = true;

    initResult.step = 'creating service instance';
    const appService = new AppGenerationService();
    initResult.serviceCreated = true;

    // If we get here, try the actual generation
    initResult.step = 'extracting userId';
    const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No userId in JWT' })
      };
    }

    initResult.step = 'parsing body';
    const body = JSON.parse(event.body);
    const validatedData = validateRequest(body);

    initResult.step = 'generating app';
    const result = await appService.generateApp(userId, validatedData.prompt, {
      framework: validatedData.framework,
      isPublic: validatedData.isPublic
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('Error at step:', initResult.step);
    console.error('Error:', error.message, error.stack);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: {
          step: initResult.step,
          message: error.message,
          stack: error.stack,
          initResult
        }
      })
    };
  }
};
