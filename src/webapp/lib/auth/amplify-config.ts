import { Amplify } from 'aws-amplify';
import { env } from '@/lib/config/env';

/**
 * Configure AWS Amplify for Cognito authentication
 */
export function configureAmplify(): void {
  if (!env.cognito.userPoolId || !env.cognito.clientId) {
    console.warn('Cognito configuration missing. Auth features will be disabled.');
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.cognito.userPoolId,
        userPoolClientId: env.cognito.clientId,
        loginWith: {
          oauth: {
            domain: env.cognito.domain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [`${env.appUrl}/auth/callback`],
            redirectSignOut: [`${env.appUrl}/`],
            responseType: 'code',
          },
        },
      },
    },
  });
}
