import { apiClient } from './client';
import type { Project, GenerateAppRequest, GenerateAppResponse } from '@/types';

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Backend generate response format
interface BackendGenerateResponse {
  project: {
    id: string;
    name: string;
    deployUrl: string;
    createdAt: string;
  };
  creditsRemaining: number;
  usage: {
    tokensUsed: number;
    generationTime: number;
  };
}

/**
 * Projects API service
 * Handles all project-related API calls
 */
export const projectsApi = {
  /**
   * Generate a new app from a prompt
   */
  async generate(request: GenerateAppRequest): Promise<GenerateAppResponse> {
    const response = await apiClient.post<ApiResponse<BackendGenerateResponse>>('/api/generate', request);

    // Map backend response to frontend format
    return {
      projectId: response.data.project.id,
      deployUrl: response.data.project.deployUrl,
      name: response.data.project.name,
      status: 'deployed', // Backend generates synchronously
      creditsRemaining: response.data.creditsRemaining,
    };
  },

  /**
   * Get all projects for the current user
   */
  async list(): Promise<Project[]> {
    const response = await apiClient.get<{ projects: Project[] }>('/api/projects');
    return response.projects;
  },

  /**
   * Get a specific project by ID
   */
  async get(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  },

  /**
   * Delete a project
   */
  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}`);
  },

  /**
   * Update a project
   */
  async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/api/projects/${projectId}`, updates);
  },
};
