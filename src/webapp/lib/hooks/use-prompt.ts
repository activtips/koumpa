'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { projectsApi } from '@/lib/api/projects';
import type { GenerateAppResponse } from '@/types';

interface UsePromptReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
  error: string | null;
  result: GenerateAppResponse | null;
  handleSubmit: () => Promise<boolean>;
  clearError: () => void;
  clearResult: () => void;
}

/**
 * Hook for managing the app generation prompt
 */
export function usePrompt(): UsePromptReturn {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateAppResponse | null>(null);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Return false to indicate auth is needed
      return false;
    }

    if (!prompt.trim()) {
      setError('Veuillez entrer une description pour votre application');
      return true;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await projectsApi.generate({ prompt: prompt.trim() });
      setResult(response);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return true;
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isAuthenticated]);

  const clearError = useCallback(() => setError(null), []);
  const clearResult = useCallback(() => setResult(null), []);

  return {
    prompt,
    setPrompt,
    isGenerating,
    error,
    result,
    handleSubmit,
    clearError,
    clearResult,
  };
}
