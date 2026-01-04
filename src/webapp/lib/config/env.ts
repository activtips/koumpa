/**
 * Environment configuration
 * Centralizes all environment variables with type safety
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

function getEnvVar(key: string, defaultValue = ''): string {
  if (typeof window !== 'undefined') {
    return process.env[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
}

export const env: EnvConfig = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'https://api.staging.koumpa.com'),

  cognito: {
    userPoolId: getEnvVar('NEXT_PUBLIC_COGNITO_USER_POOL_ID', ''),
    clientId: getEnvVar('NEXT_PUBLIC_COGNITO_CLIENT_ID', ''),
    domain: getEnvVar('NEXT_PUBLIC_COGNITO_DOMAIN', ''),
    region: getEnvVar('NEXT_PUBLIC_AWS_REGION', 'eu-west-1'),
  },

  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'https://staging.koumpa.com'),
  isProduction: process.env.NODE_ENV === 'production',
};
