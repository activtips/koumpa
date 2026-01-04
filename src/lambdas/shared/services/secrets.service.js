/**
 * Secrets Service
 * Manages API keys and secrets with caching
 */

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const config = require('../config');
const { ExternalServiceError } = require('../errors');

class SecretsService {
  constructor() {
    this.client = new SecretsManagerClient({});
    this.cache = null;
    this.cacheExpiry = null;
  }

  /**
   * Get all secrets (cached)
   */
  async getSecrets() {
    // Return cached if valid
    if (this.cache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: config.services.secretsArn
      });

      const response = await this.client.send(command);
      const secrets = JSON.parse(response.SecretString);

      // Cache for 1 hour
      this.cache = secrets;
      this.cacheExpiry = Date.now() + config.cache.secretsTTL;

      return secrets;
    } catch (error) {
      throw new ExternalServiceError('Secrets Manager', error);
    }
  }

  /**
   * Get Claude API key
   */
  async getClaudeApiKey() {
    const secrets = await this.getSecrets();
    return secrets.claude_api_key;
  }

  /**
   * Get Stripe secret key
   */
  async getStripeSecretKey() {
    const secrets = await this.getSecrets();
    return secrets.stripe_secret_key;
  }

  /**
   * Get Stripe webhook secret
   */
  async getStripeWebhookSecret() {
    const secrets = await this.getSecrets();
    return secrets.stripe_webhook_secret;
  }

  /**
   * Invalidate cache (useful after secret rotation)
   */
  invalidateCache() {
    this.cache = null;
    this.cacheExpiry = null;
  }
}

// Singleton instance
const secretsService = new SecretsService();

module.exports = secretsService;
