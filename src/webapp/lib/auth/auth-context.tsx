'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signIn,
  signOut,
  signUp,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  type SignInInput,
  type SignUpInput,
} from 'aws-amplify/auth';
import type { User, AuthState } from '@/types';
import { env } from '@/lib/config/env';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<{ needsConfirmation: boolean }>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (cognitoUser && session.tokens) {
        // Fetch user details from our API
        const user = await fetchUserFromApi(session.tokens.accessToken.toString());
        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
        });
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  const fetchUserFromApi = async (accessToken: string): Promise<User> => {
    try {
      const response = await fetch(`${env.apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user from API:', error);
    }

    // Return default user if API fails
    return {
      id: '',
      email: '',
      plan: 'free',
      creditsRemaining: 0,
      createdAt: new Date().toISOString(),
    };
  };

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const signInInput: SignInInput = {
        username: email,
        password,
      };

      await signIn(signInInput);
      await checkAuthStatus();
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [checkAuthStatus]);

  const register = useCallback(async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ needsConfirmation: boolean }> => {
    const signUpInput: SignUpInput = {
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          ...(name && { name }),
        },
      },
    };

    const result = await signUp(signUpInput);
    return { needsConfirmation: !result.isSignUpComplete };
  }, []);

  const confirmRegistration = useCallback(async (email: string, code: string) => {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch {
      return null;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    confirmRegistration,
    logout,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
