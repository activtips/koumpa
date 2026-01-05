/**
 * List User Projects
 * Returns all projects for the authenticated user
 */

const { ErrorHandler } = require('./shared/errors');

const handler = async (event) => {
  console.log('List projects request:', JSON.stringify(event, null, 2));

  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // TODO: Implement projects listing
  // - Query projects by userId
  // - Return list with pagination

  return {
    statusCode: 200,
    body: JSON.stringify({
      projects: [],
      message: 'Projects endpoint - TODO: implement'
    })
  };
};

module.exports = { handler: ErrorHandler.wrapHandler(handler) };
