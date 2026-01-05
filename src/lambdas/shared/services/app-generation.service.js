/**
 * App Generation Service
 * Main business logic for generating apps
 * Orchestrates Claude, Storage, and Database operations
 */

const ClaudeService = require('./claude.service');
const StorageService = require('./storage.service');
const { UserRepository, ProjectRepository, PlanRepository } = require('../repositories');
const { InsufficientCreditsError, ValidationError, AuthorizationError } = require('../errors');
const { createLogger } = require('../utils/logger');

class AppGenerationService {
  constructor() {
    this.claudeService = new ClaudeService();
    this.storageService = new StorageService();
    this.userRepo = new UserRepository();
    this.projectRepo = new ProjectRepository();
    this.planRepo = new PlanRepository();
    this.logger = createLogger('AppGenerationService');
  }

  /**
   * Generate new app (main entry point)
   */
  async generateApp(userId, prompt, options = {}) {
    this.logger.info('Starting app generation', { userId, promptLength: prompt.length });

    // 1. Get user (or create if not exists - fallback for users created before trigger)
    const user = await this.userRepo.getOrCreateUser(userId);
    
    // Check if user is banned
    if (user.banned) {
      throw new AuthorizationError('Account is suspended');
    }

    // 2. Get plan limits
    const plan = await this.planRepo.getPlanById(user.subscriptionPlan);

    // 3. Check credits
    await this.checkAndValidateCredits(user, plan);

    // 4. Check project limits
    await this.checkProjectLimits(user, plan, options);

    // 5. Generate code with Claude
    const generationStart = Date.now();
    const { code, usage } = await this.claudeService.generateApp(prompt, {
      framework: options.framework || 'vanilla',
      additionalInstructions: options.additionalInstructions
    });
    const generationDuration = Date.now() - generationStart;

    this.logger.info('Code generated successfully', {
      duration: generationDuration,
      codeLength: code.length,
      tokensUsed: usage.inputTokens + usage.outputTokens
    });

    // 6. Generate project ID
    const projectId = this.generateProjectId(userId);

    // 7. Upload to S3
    const deployUrl = await this.storageService.uploadApp(projectId, code);

    // 8. Save project to database
    const project = await this.projectRepo.createProject({
      projectId,
      userId,
      name: this.generateProjectName(prompt),
      prompt,
      code,
      deployUrl,
      framework: options.framework || 'vanilla',
      isPublic: options.isPublic !== false
    });

    // 9. Decrement user credits (atomic operation)
    const updatedUser = await this.userRepo.decrementCredits(userId, 1);

    // 10. Increment projects count
    await this.userRepo.incrementProjectsCount(userId);

    this.logger.info('App generated and deployed', {
      projectId,
      deployUrl,
      creditsRemaining: updatedUser.creditsBalance
    });

    return {
      project: {
        id: projectId,
        name: project.name,
        deployUrl,
        createdAt: project.createdAt
      },
      creditsRemaining: updatedUser.creditsBalance,
      usage: {
        tokensUsed: usage.inputTokens + usage.outputTokens,
        generationTime: generationDuration
      }
    };
  }

  /**
   * Modify existing app
   */
  async modifyApp(userId, projectId, modificationPrompt) {
    this.logger.info('Modifying app', { userId, projectId });

    // 1. Get project and verify ownership
    const project = await this.projectRepo.getProjectById(projectId);
    if (project.userId !== userId) {
      throw new AuthorizationError('Not authorized to modify this project');
    }

    // 2. Check credits
    const user = await this.userRepo.getUserById(userId);
    const plan = await this.planRepo.getPlanById(user.subscriptionPlan);
    await this.checkAndValidateCredits(user, plan);

    // 3. Modify code with Claude
    const modifiedCode = await this.claudeService.modifyCode(project.code, modificationPrompt);

    // 4. Upload new version
    const deployUrl = await this.storageService.uploadApp(projectId, modifiedCode);

    // 5. Update project in database (with versioning)
    const updatedProject = await this.projectRepo.updateProjectCode(projectId, modifiedCode, deployUrl);

    // 6. Decrement credits
    const updatedUser = await this.userRepo.decrementCredits(userId, 1);

    return {
      project: {
        id: projectId,
        version: updatedProject.version,
        deployUrl,
        updatedAt: updatedProject.updatedAt
      },
      creditsRemaining: updatedUser.creditsBalance
    };
  }

  /**
   * Check and validate user credits
   */
  async checkAndValidateCredits(user, plan) {
    if (user.creditsBalance < 1) {
      throw new InsufficientCreditsError(1, user.creditsBalance);
    }

    // Log low credits warning
    if (user.creditsBalance <= 5) {
      this.logger.warn('User has low credits', {
        userId: user.userId,
        creditsRemaining: user.creditsBalance
      });
    }
  }

  /**
   * Check project limits
   */
  async checkProjectLimits(user, plan, options) {
    // Check total projects limit
    if (user.projectsCreated >= plan.maxProjects) {
      throw new ValidationError(
        `Project limit reached. Maximum ${plan.maxProjects} projects allowed on ${plan.name} plan.`
      );
    }

    // Check private projects limit
    if (options.isPublic === false) {
      const stats = await this.projectRepo.getUserProjectStats(user.userId);
      if (stats.private >= plan.maxPrivateProjects) {
        throw new ValidationError(
          `Private project limit reached. Maximum ${plan.maxPrivateProjects} private projects allowed on ${plan.name} plan.`
        );
      }
    }
  }

  /**
   * Generate unique project ID
   */
  generateProjectId(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId.substring(0, 8)}-${timestamp}-${random}`;
  }

  /**
   * Generate project name from prompt
   */
  generateProjectName(prompt) {
    // Take first 100 characters and clean up
    let name = prompt.substring(0, 100).trim();
    
    // Remove special characters
    name = name.replace(/[^\w\s-]/g, '');
    
    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    return name || 'Untitled Project';
  }

  /**
   * Get user's generation stats
   */
  async getUserStats(userId) {
    const user = await this.userRepo.getUserById(userId);
    const projectStats = await this.projectRepo.getUserProjectStats(userId);
    const plan = await this.planRepo.getPlanById(user.subscriptionPlan);

    return {
      credits: {
        balance: user.creditsBalance,
        limit: plan.creditsPerMonth,
        usedToday: user.creditsUsedToday
      },
      projects: {
        total: projectStats.total,
        public: projectStats.public,
        private: projectStats.private,
        limit: plan.maxProjects,
        totalViews: projectStats.totalViews
      },
      plan: {
        name: plan.name,
        features: plan.features
      }
    };
  }

  /**
   * Suggest plan upgrade
   */
  async suggestUpgrade(userId) {
    const user = await this.userRepo.getUserById(userId);
    
    // If already on highest plan, no upgrade needed
    if (user.subscriptionPlan === 'business') {
      return null;
    }

    const currentPlan = await this.planRepo.getPlanById(user.subscriptionPlan);
    const allPlans = await this.planRepo.getAllPlans();

    // Find next higher plan
    const higherPlans = allPlans.filter(p => p.displayOrder > currentPlan.displayOrder);
    if (higherPlans.length === 0) {
      return null;
    }

    const suggestedPlan = higherPlans[0];
    const comparison = await this.planRepo.comparePlans(user.subscriptionPlan, suggestedPlan.id);

    return {
      plan: suggestedPlan,
      benefits: {
        additionalCredits: comparison.creditsDiff,
        newFeatures: comparison.newFeatures,
        monthlyPrice: suggestedPlan.priceMonthly,
        savings: suggestedPlan.priceYearly - (suggestedPlan.priceMonthly * 12)
      }
    };
  }
}

module.exports = AppGenerationService;
