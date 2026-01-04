/**
 * Project Repository
 * Handles all project (generated app) related database operations
 */

const BaseRepository = require('./base.repository');
const config = require('../config');
const { NotFoundError } = require('../errors');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(config.tables.projects);
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId) {
    const project = await this.get({ projectId });
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    return project;
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    const now = new Date().toISOString();
    
    const project = {
      projectId: projectData.projectId,
      userId: projectData.userId,
      name: projectData.name,
      prompt: projectData.prompt,
      code: projectData.code,
      deployUrl: projectData.deployUrl,
      
      // Metadata
      framework: projectData.framework || 'vanilla',
      isPublic: projectData.isPublic !== false, // Default true
      
      // Stats
      views: 0,
      lastViewedAt: null,
      
      // Versioning
      version: 1,
      previousVersions: [],
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    };

    return await this.put(project);
  }

  /**
   * Get user's projects (using GSI)
   */
  async getUserProjects(userId, limit = 20, lastKey = null) {
    const params = {
      IndexName: 'userId-createdAt-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Sort descending (newest first)
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    return await this.query(params);
  }

  /**
   * Update project code (new version)
   */
  async updateProjectCode(projectId, newCode, newDeployUrl) {
    const project = await this.getProjectById(projectId);
    
    // Save previous version
    const previousVersion = {
      version: project.version,
      code: project.code,
      deployUrl: project.deployUrl,
      createdAt: project.updatedAt
    };

    const previousVersions = project.previousVersions || [];
    previousVersions.push(previousVersion);

    // Keep only last 5 versions
    if (previousVersions.length > 5) {
      previousVersions.shift();
    }

    return await this.update(
      { projectId },
      {
        code: newCode,
        deployUrl: newDeployUrl,
        version: project.version + 1,
        previousVersions,
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Update project visibility
   */
  async updateVisibility(projectId, isPublic) {
    return await this.update(
      { projectId },
      {
        isPublic,
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Increment view count
   */
  async incrementViews(projectId) {
    return await this.update(
      { projectId },
      {
        views: { $add: 1 },
        lastViewedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    // Verify ownership
    const project = await this.getProjectById(projectId);
    if (project.userId !== userId) {
      throw new Error('Not authorized to delete this project');
    }

    return await this.delete({ projectId });
  }

  /**
   * Get public projects (for discovery/showcase)
   */
  async getPublicProjects(limit = 20, lastKey = null) {
    const params = {
      FilterExpression: 'isPublic = :true',
      ExpressionAttributeValues: {
        ':true': true
      },
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    return await this.scan(params);
  }

  /**
   * Search projects by name (user's projects only)
   */
  async searchUserProjects(userId, searchTerm) {
    const result = await this.query({
      IndexName: 'userId-createdAt-index',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'contains(#name, :searchTerm)',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':searchTerm': searchTerm
      }
    });

    return result.items;
  }

  /**
   * Get project stats for user
   */
  async getUserProjectStats(userId) {
    const result = await this.query({
      IndexName: 'userId-createdAt-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const projects = result.items;

    return {
      total: projects.length,
      public: projects.filter(p => p.isPublic).length,
      private: projects.filter(p => !p.isPublic).length,
      totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0)
    };
  }
}

module.exports = ProjectRepository;
