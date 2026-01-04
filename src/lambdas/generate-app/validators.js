/**
 * Request Validators for Generate App Lambda
 */

const { ValidationError } = require('../shared/errors');
const config = require('../shared/config');

/**
 * Validate generate app request
 */
function validateRequest(body) {
  const errors = [];

  // Validate prompt
  if (!body.prompt) {
    errors.push({ field: 'prompt', message: 'Prompt is required' });
  } else if (typeof body.prompt !== 'string') {
    errors.push({ field: 'prompt', message: 'Prompt must be a string' });
  } else if (body.prompt.length < config.limits.minPromptLength) {
    errors.push({ 
      field: 'prompt', 
      message: `Prompt must be at least ${config.limits.minPromptLength} characters` 
    });
  } else if (body.prompt.length > config.limits.maxPromptLength) {
    errors.push({ 
      field: 'prompt', 
      message: `Prompt must not exceed ${config.limits.maxPromptLength} characters` 
    });
  }

  // Validate framework (optional)
  const validFrameworks = ['vanilla', 'react', 'vue'];
  if (body.framework && !validFrameworks.includes(body.framework)) {
    errors.push({ 
      field: 'framework', 
      message: `Framework must be one of: ${validFrameworks.join(', ')}` 
    });
  }

  // Validate isPublic (optional)
  if (body.isPublic !== undefined && typeof body.isPublic !== 'boolean') {
    errors.push({ field: 'isPublic', message: 'isPublic must be a boolean' });
  }

  // Validate additionalInstructions (optional)
  if (body.additionalInstructions && typeof body.additionalInstructions !== 'string') {
    errors.push({ field: 'additionalInstructions', message: 'additionalInstructions must be a string' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return {
    prompt: body.prompt.trim(),
    framework: body.framework || 'vanilla',
    isPublic: body.isPublic !== false, // Default true
    additionalInstructions: body.additionalInstructions?.trim() || null
  };
}

module.exports = {
  validateRequest
};
