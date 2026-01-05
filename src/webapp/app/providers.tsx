'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { configureAmplify } from '@/lib/auth/amplify-config';

// Configure Amplify synchronously before any render
// This ensures Cognito is ready when AuthProvider mounts
configureAmplify();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
