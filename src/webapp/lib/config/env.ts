/**
 * Environment configuration
 * Centralizes all environment variables with type safety
 *
 * IMPORTANT: Next.js requires direct access to process.env.NEXT_PUBLIC_*
 * for static builds. Dynamic access like process.env[key] won't be inlined.
 */

interface EnvConfig {
  // API
  apiUrl: string;

  // AWS Cognito
  cognito: {
    userPoolId: string;
    clientId: string;
    domain: string;
    region: string;
  };

  // App
  appUrl: string;
  isProduction: boolean;
}

export const env: EnvConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.staging.koumpa.com',

  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-west-1',
  },

  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://staging.koumpa.com',
  isProduction: process.env.NODE_ENV === 'production',
};
