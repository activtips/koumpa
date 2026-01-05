// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  plan: PlanType;
  creditsRemaining: number;
  createdAt: string;
}

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

// Project types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  deployUrl: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'pending' | 'generating' | 'deployed' | 'failed';

// API types
export interface GenerateAppRequest {
  prompt: string;
  name?: string;
}

export interface GenerateAppResponse {
  projectId: string;
  deployUrl: string;
  name: string;
  status: ProjectStatus;
  creditsRemaining?: number;
}

export interface ApiError {
  code: string;
  message: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}
