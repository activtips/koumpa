/**
 * Claude Service
 * Handles AI code generation using Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const secretsService = require('./secrets.service');
const { ExternalServiceError, ValidationError } = require('../errors');

class ClaudeService {
  constructor() {
    this.client = null;
  }

  /**
   * Initialize Anthropic client (lazy initialization)
   */
  async getClient() {
    if (!this.client) {
      const apiKey = await secretsService.getClaudeApiKey();
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  /**
   * Generate app code from prompt
   */
  async generateApp(prompt, options = {}) {
    this.validatePrompt(prompt);

    const client = await this.getClient();

    try {
      const systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(prompt, options);

      const message = await client.messages.create({
        model: options.model || config.claude.model,
        max_tokens: options.maxTokens || config.claude.maxTokens,
        temperature: options.temperature || config.claude.temperature,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      });

      const code = message.content[0].text;
      
      // Extract and clean code
      const cleanedCode = this.extractCode(code);

      return {
        code: cleanedCode,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens
        }
      };
    } catch (error) {
      if (error.status === 429) {
        throw new ExternalServiceError('Claude API rate limit exceeded', error);
      }
      throw new ExternalServiceError('Claude API', error);
    }
  }

  /**
   * Modify existing code
   */
  async modifyCode(existingCode, modificationPrompt) {
    const client = await this.getClient();

    try {
      const message = await client.messages.create({
        model: config.claude.model,
        max_tokens: config.claude.maxTokens,
        messages: [{
          role: 'user',
          content: `Here is the current code:

\`\`\`html
${existingCode}
\`\`\`

Please modify it according to this request: ${modificationPrompt}

Return ONLY the complete updated HTML code, no explanations.`
        }]
      });

      const code = message.content[0].text;
      return this.extractCode(code);
    } catch (error) {
      throw new ExternalServiceError('Claude API', error);
    }
  }

  /**
   * Build system prompt
   */
  buildSystemPrompt(options) {
    const framework = options.framework || 'vanilla';
    
    const frameworks = {
      vanilla: 'HTML, CSS, and vanilla JavaScript',
      react: 'React with hooks',
      vue: 'Vue 3 Composition API'
    };

    return `You are an expert web developer specializing in creating production-ready web applications.

**Your task:**
- Create complete, functional single-page applications
- Use ${frameworks[framework]}
- Write clean, maintainable, well-commented code
- Follow best practices and modern standards
- Make it responsive and mobile-friendly
- Add smooth animations and transitions
- Ensure excellent UX/UI design

**Requirements:**
- Return ONLY the complete code, no explanations
- For vanilla apps: single HTML file with inline CSS and JS
- Use Tailwind CSS via CDN for styling
- Include proper semantic HTML
- Ensure cross-browser compatibility
- Make it production-ready

**Quality standards:**
- Professional design
- Smooth interactions
- Proper error handling
- Accessible (WCAG 2.1)
- Fast loading
- Clean code structure`;
  }

  /**
   * Build user prompt
   */
  buildUserPrompt(prompt, options) {
    let fullPrompt = `Create a web application with the following requirements:

${prompt}`;

    if (options.additionalInstructions) {
      fullPrompt += `\n\nAdditional instructions:\n${options.additionalInstructions}`;
    }

    fullPrompt += `\n\nReturn the complete ${options.framework === 'vanilla' ? 'index.html' : 'App.jsx'} file.`;

    return fullPrompt;
  }

  /**
   * Extract code from Claude response
   */
  extractCode(response) {
    // Remove markdown code blocks if present
    let code = response.trim();

    // Match ```html ... ``` or ```jsx ... ```
    const codeBlockRegex = /```(?:html|jsx|javascript)?\s*\n([\s\S]*?)\n```/;
    const match = code.match(codeBlockRegex);

    if (match) {
      code = match[1];
    }

    return code.trim();
  }

  /**
   * Validate prompt
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new ValidationError('Prompt is required and must be a string');
    }

    if (prompt.length < config.limits.minPromptLength) {
      throw new ValidationError(
        `Prompt must be at least ${config.limits.minPromptLength} characters`,
        'prompt'
      );
    }

    if (prompt.length > config.limits.maxPromptLength) {
      throw new ValidationError(
        `Prompt must not exceed ${config.limits.maxPromptLength} characters`,
        'prompt'
      );
    }

    // Check for malicious content
    const maliciousPatterns = [
      /<script[^>]*>[\s\S]*?eval\(/i,
      /document\.write/i,
      /\.innerHTML\s*=/i
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(prompt)) {
        throw new ValidationError('Prompt contains potentially malicious content', 'prompt');
      }
    }
  }

  /**
   * Estimate token count (rough estimation)
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if prompt is likely to exceed token limit
   */
  willExceedTokenLimit(prompt) {
    const estimatedTokens = this.estimateTokens(prompt);
    return estimatedTokens > (config.claude.maxTokens * 0.5); // Use 50% for safety margin
  }
}

module.exports = ClaudeService;
