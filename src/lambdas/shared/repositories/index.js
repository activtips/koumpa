/**
 * Repositories Index
 * Export all repositories
 */

const UserRepository = require('./user.repository');
const ProjectRepository = require('./project.repository');
const PlanRepository = require('./plan.repository');

module.exports = {
  UserRepository,
  ProjectRepository,
  PlanRepository
};
