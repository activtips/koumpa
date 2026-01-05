/**
 * Plan Repository
 * Handles all subscription plan related database operations
 */

const BaseRepository = require('./base.repository');
const config = require('../config');
const { NotFoundError } = require('../errors');

class PlanRepository extends BaseRepository {
  constructor() {
    super(config.tables.plans);
    this.cache = new Map();
    this.cacheTTL = config.cache.plansTTL;
    this.lastCacheUpdate = null;
  }

  /**
   * Get plan by ID (with caching)
   */
  async getPlanById(planId) {
    // Check cache first
    const cached = this.getFromCache(planId);
    if (cached) {
      return cached;
    }

    const plan = await this.get({ id: planId });
    if (!plan) {
      // Return default free plan if not found (fallback for missing plans)
      const defaultPlan = this.getDefaultFreePlan();
      this.setCache(planId, defaultPlan);
      return defaultPlan;
    }

    // Cache the result
    this.setCache(planId, plan);
    return plan;
  }

  /**
   * Get default free plan (fallback when plans table is empty)
   */
  getDefaultFreePlan() {
    return {
      id: 'free',
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      creditsPerMonth: 5,
      dailyBonusCredits: 1,
      maxRolloverCredits: 3,
      maxProjects: 3,
      maxPrivateProjects: 0,
      features: {
        codeGeneration: true,
        publicProjects: true
      },
      maxTeamMembers: 1,
      displayOrder: 0,
      isVisible: true,
      recommended: false
    };
  }

  /**
   * Get all visible plans (cached)
   */
  async getAllPlans() {
    // Check if cache is valid
    if (this.isCacheValid()) {
      const cachedPlans = this.cache.get('all-plans');
      if (cachedPlans) {
        return cachedPlans;
      }
    }

    const result = await this.scan({
      FilterExpression: 'isVisible = :true',
      ExpressionAttributeValues: {
        ':true': true
      }
    });

    // Sort by displayOrder
    const plans = result.items.sort((a, b) => a.displayOrder - b.displayOrder);

    // Cache all plans
    this.cache.set('all-plans', plans);
    this.lastCacheUpdate = Date.now();

    return plans;
  }

  /**
   * Update plan (SuperAdmin only)
   */
  async updatePlan(planId, updates) {
    // Invalidate cache
    this.invalidateCache();

    const allowedUpdates = [
      'name',
      'priceMonthly',
      'priceYearly',
      'stripePriceIdMonthly',
      'stripePriceIdYearly',
      'creditsPerMonth',
      'dailyBonusCredits',
      'maxRolloverCredits',
      'maxProjects',
      'maxPrivateProjects',
      'features',
      'maxTeamMembers',
      'displayOrder',
      'isVisible',
      'recommended'
    ];

    // Filter only allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updated timestamp
    filteredUpdates.updatedAt = new Date().toISOString();

    return await this.update({ id: planId }, filteredUpdates);
  }

  /**
   * Create new plan (SuperAdmin only)
   */
  async createPlan(planData) {
    // Invalidate cache
    this.invalidateCache();

    const plan = {
      id: planData.id,
      name: planData.name,
      priceMonthly: planData.priceMonthly || 0,
      priceYearly: planData.priceYearly || 0,
      stripePriceIdMonthly: planData.stripePriceIdMonthly || null,
      stripePriceIdYearly: planData.stripePriceIdYearly || null,
      
      // Quotas
      creditsPerMonth: planData.creditsPerMonth || 0,
      dailyBonusCredits: planData.dailyBonusCredits || 0,
      maxRolloverCredits: planData.maxRolloverCredits || 0,
      maxProjects: planData.maxProjects || 999,
      maxPrivateProjects: planData.maxPrivateProjects || 0,
      
      // Features
      features: planData.features || {},
      
      // Limits
      maxTeamMembers: planData.maxTeamMembers || 1,
      
      // Display
      displayOrder: planData.displayOrder || 0,
      isVisible: planData.isVisible !== false,
      recommended: planData.recommended || false,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.put(plan);
  }

  /**
   * Delete plan (SuperAdmin only)
   */
  async deletePlan(planId) {
    // Don't allow deleting default plans
    const protectedPlans = ['free', 'pro', 'teams', 'business'];
    if (protectedPlans.includes(planId)) {
      throw new Error('Cannot delete default plans');
    }

    // Invalidate cache
    this.invalidateCache();

    return await this.delete({ id: planId });
  }

  /**
   * Get recommended plan
   */
  async getRecommendedPlan() {
    const plans = await this.getAllPlans();
    return plans.find(p => p.recommended) || plans[1]; // Default to second plan if no recommended
  }

  /**
   * Cache helpers
   */
  getFromCache(key) {
    if (!this.isCacheValid()) {
      return null;
    }
    return this.cache.get(key);
  }

  setCache(key, value) {
    this.cache.set(key, value);
    if (!this.lastCacheUpdate) {
      this.lastCacheUpdate = Date.now();
    }
  }

  isCacheValid() {
    if (!this.lastCacheUpdate) {
      return false;
    }
    return (Date.now() - this.lastCacheUpdate) < this.cacheTTL;
  }

  invalidateCache() {
    this.cache.clear();
    this.lastCacheUpdate = null;
  }

  /**
   * Compare plan features (for upgrade suggestions)
   */
  comparePlans(currentPlanId, targetPlanId) {
    return Promise.all([
      this.getPlanById(currentPlanId),
      this.getPlanById(targetPlanId)
    ]).then(([current, target]) => {
      return {
        creditsDiff: target.creditsPerMonth - current.creditsPerMonth,
        priceDiff: target.priceMonthly - current.priceMonthly,
        newFeatures: Object.keys(target.features).filter(
          feature => target.features[feature] && !current.features[feature]
        )
      };
    });
  }
}

module.exports = PlanRepository;
