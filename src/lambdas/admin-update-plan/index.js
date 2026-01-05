/**
 * Admin Update Plan
 * Allows admins to update subscription plans
 */

const { ErrorHandler } = require('./shared/errors');

const handler = async (event) => {
  console.log('Admin update plan request:', JSON.stringify(event, null, 2));

  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // TODO: Implement admin check and plan update
  // - Verify user is admin
  // - Update plan in DynamoDB

  const planId = event.pathParameters?.planId;

  return {
    statusCode: 200,
    body: JSON.stringify({
      planId,
      message: 'Admin update plan - TODO: implement'
    })
  };
};

module.exports = { handler: ErrorHandler.wrapHandler(handler) };
