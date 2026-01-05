/**
 * User Repository
 * Handles all user-related database operations
 */

const BaseRepository = require('./base.repository');
const config = require('../config');
const { NotFoundError } = require('../errors');

class UserRepository extends BaseRepository {
  constructor() {
    super(config.tables.users);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await this.get({ userId });
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return user;
  }

  /**
   * Get user by ID or create if not exists
   * Used as fallback when Cognito trigger didn't create user
   */
  async getOrCreateUser(userId, email = null) {
    try {
      return await this.getUserById(userId);
    } catch (error) {
      if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
        // Create user with default values
        const userData = {
          userId,
          email: email || `user-${userId.substring(0, 8)}@unknown.com`,
          name: null
        };
        return await this.createUser(userData);
      }
      throw error;
    }
  }

  /**
   * Get user by email (using GSI)
   */
  async getUserByEmail(email) {
    const result = await this.query({
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      Limit: 1
    });

    return result.items[0] || null;
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    const now = new Date().toISOString();
    
    const user = {
      userId: userData.userId,
      email: userData.email,
      name: userData.name || null,
      subscriptionPlan: 'free',
      billingCycle: 'monthly',
      
      // Credits
      creditsBalance: 5,
      creditsUsedToday: 0,
      lastDailyBonusAt: null,
      
      // Tracking
      projectsCreated: 0,
      
      // Billing
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: 'active',
      currentPeriodEnd: null,
      
      // Admin
      isAdmin: false,
      banned: false,
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    };

    return await this.put(user);
  }

  /**
   * Update user credits
   */
  async updateCredits(userId, creditsChange) {
    return await this.update(
      { userId },
      {
        creditsBalance: { $add: creditsChange },
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Decrement credits (atomic operation)
   */
  async decrementCredits(userId, amount = 1) {
    try {
      const command = {
        TableName: this.tableName,
        Key: { userId },
        UpdateExpression: 'SET creditsBalance = creditsBalance - :amount, creditsUsedToday = creditsUsedToday + :amount, updatedAt = :now',
        ExpressionAttributeValues: {
          ':amount': amount,
          ':now': new Date().toISOString(),
          ':minCredits': 0
        },
        ConditionExpression: 'creditsBalance >= :minCredits',
        ReturnValues: 'ALL_NEW'
      };

      const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
      const response = await this.docClient.send(new UpdateCommand(command));
      return response.Attributes;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Insufficient credits');
      }
      throw error;
    }
  }

  /**
   * Apply daily bonus credits
   */
  async applyDailyBonus(userId, bonusAmount, maxRollover) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current user
    const user = await this.getUserById(userId);
    
    // Check if bonus already applied today
    if (user.lastDailyBonusAt === today) {
      return user; // Already applied
    }

    // Calculate new balance with rollover cap
    const maxBalance = user.creditsPerMonth + maxRollover;
    const newBalance = Math.min(user.creditsBalance + bonusAmount, maxBalance);

    return await this.update(
      { userId },
      {
        creditsBalance: newBalance,
        creditsUsedToday: 0,
        lastDailyBonusAt: today,
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Update subscription
   */
  async updateSubscription(userId, subscriptionData) {
    return await this.update(
      { userId },
      {
        subscriptionPlan: subscriptionData.plan,
        billingCycle: subscriptionData.billingCycle,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.status,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Get all users (admin only, with pagination)
   */
  async getAllUsers(limit = 50, lastKey = null) {
    const params = {
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    return await this.scan(params);
  }

  /**
   * Ban/unban user
   */
  async setBanStatus(userId, banned) {
    return await this.update(
      { userId },
      {
        banned,
        updatedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Increment projects count
   */
  async incrementProjectsCount(userId) {
    return await this.update(
      { userId },
      {
        projectsCreated: { $add: 1 },
        updatedAt: new Date().toISOString()
      }
    );
  }
}

module.exports = UserRepository;
