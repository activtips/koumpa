import { apiClient } from './client';
import type { Project, GenerateAppRequest, GenerateAppResponse } from '@/types';

/**
 * Projects API service
 * Handles all project-related API calls
 */
export const projectsApi = {
  /**
   * Generate a new app from a prompt
   */
  async generate(request: GenerateAppRequest): Promise<GenerateAppResponse> {
    return apiClient.post<GenerateAppResponse>('/generate', request);
  },

  /**
   * Get all projects for the current user
   */
  async list(): Promise<Project[]> {
    const response = await apiClient.get<{ projects: Project[] }>('/projects');
    return response.projects;
  },

  /**
   * Get a specific project by ID
   */
  async get(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`);
  },

  /**
   * Delete a project
   */
  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  },

  /**
   * Update a project
   */
  async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/projects/${projectId}`, updates);
  },
};
