provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Koumpa"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Mohamed Tounkara"
      CostCenter  = "Platform"
    }
  }
}

locals {
  project_name = "koumpa"
  name_prefix  = "${local.project_name}-${var.environment}"

  common_tags = {
    Application = "AI App Builder"
    Repository  = "github.com/activtips/koumpa"
  }
}

# Secrets Manager for sensitive data
resource "aws_secretsmanager_secret" "api_keys" {
  name        = "${local.name_prefix}-api-keys"
  description = "API keys for Claude and Stripe"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    claude_api_key         = var.claude_api_key
    stripe_secret_key      = var.stripe_secret_key
    stripe_webhook_secret  = var.stripe_webhook_secret
  })
}

# DynamoDB Module
module "database" {
  source = "../../modules/database"

  name_prefix = local.name_prefix
  environment = var.environment
}

# Cognito Auth Module
module "auth" {
  source = "../../modules/auth"

  name_prefix = local.name_prefix
  environment = var.environment

  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls
}

# S3 + CloudFront Module
module "storage" {
  source = "../../modules/storage"

  name_prefix = local.name_prefix
  environment = var.environment
}

# Lambda Functions Module
module "api" {
  source = "../../modules/api"

  name_prefix = local.name_prefix
  environment = var.environment

  # Tables
  plans_table_name    = module.database.plans_table_name
  users_table_name    = module.database.users_table_name
  projects_table_name = module.database.projects_table_name

  plans_table_arn    = module.database.plans_table_arn
  users_table_arn    = module.database.users_table_arn
  projects_table_arn = module.database.projects_table_arn

  # S3
  apps_bucket_name = module.storage.apps_bucket_name
  apps_bucket_arn  = module.storage.apps_bucket_arn

  # Secrets
  secrets_arn = aws_secretsmanager_secret.api_keys.arn

  # Cognito
  user_pool_id     = module.auth.user_pool_id
  user_pool_arn    = module.auth.user_pool_arn
  user_pool_client_id = module.auth.user_pool_client_id

  # CloudFront
  cloudfront_domain = module.storage.cloudfront_domain_name
}

# EventBridge Cron Jobs Module
module "cron" {
  source = "../../modules/cron"

  name_prefix = local.name_prefix
  environment = var.environment

  daily_bonus_lambda_arn = module.api.daily_bonus_lambda_arn
  users_table_name       = module.database.users_table_name
}
