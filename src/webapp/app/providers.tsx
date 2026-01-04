'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { configureAmplify } from '@/lib/auth/amplify-config';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';

function ApiClientSetup({ children }: { children: ReactNode }) {
  const { getAccessToken } = useAuth();

  useEffect(() => {
    apiClient.setAccessTokenGetter(getAccessToken);
  }, [getAccessToken]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <AuthProvider>
      <ApiClientSetup>{children}</ApiClientSetup>
    </AuthProvider>
  );
}
