/**
 * Centralized configuration
 * All environment variables and constants in one place
 */

class Config {
  constructor() {
    // DynamoDB Tables
    this.tables = {
      plans: process.env.PLANS_TABLE,
      users: process.env.USERS_TABLE,
      projects: process.env.PROJECTS_TABLE
    };

    // S3 Buckets
    this.buckets = {
      apps: process.env.APPS_BUCKET
    };

    // External Services
    this.services = {
      secretsArn: process.env.SECRETS_ARN,
      cloudfrontUrl: process.env.CLOUDFRONT_URL
    };

    // Business Logic Constants
    this.limits = {
      minPromptLength: 10,
      maxPromptLength: 5000,
      maxProjectNameLength: 100,
      codeGenerationTimeout: 120000, // 2 minutes
      maxFileSize: 5 * 1024 * 1024 // 5 MB
    };

    // Claude API Configuration
    this.claude = {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.7
    };

    // Cache TTL
    this.cache = {
      secretsTTL: 3600000, // 1 hour
      plansTTL: 300000 // 5 minutes
    };

    // Logging
    this.logging = {
      level: process.env.LOG_LEVEL || 'info',
      includeStackTrace: process.env.NODE_ENV === 'development'
    };

    this.validateConfig();
  }

  /**
   * Validate required environment variables
   */
  validateConfig() {
    const required = [
      'PLANS_TABLE',
      'USERS_TABLE',
      'PROJECTS_TABLE',
      'APPS_BUCKET',
      'SECRETS_ARN',
      'CLOUDFRONT_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Get config as plain object (for logging)
   */
  toObject() {
    return {
      tables: this.tables,
      buckets: this.buckets,
      limits: this.limits,
      claude: this.claude
      // Don't include secrets
    };
  }
}

// Singleton instance
const config = new Config();

module.exports = config;
