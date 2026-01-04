/**
 * Get User Info
 * Returns user profile and subscription details
 */

const { ErrorHandler } = require('./shared/errors');

const handler = async (event) => {
  console.log('Get user request:', JSON.stringify(event, null, 2));

  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // TODO: Implement user retrieval
  // - Get user from DynamoDB
  // - Get user's plan details
  // - Return user profile

  return {
    statusCode: 200,
    body: JSON.stringify({
      userId,
      message: 'User endpoint - TODO: implement'
    })
  };
};

module.exports = { handler: ErrorHandler.wrap(handler) };
