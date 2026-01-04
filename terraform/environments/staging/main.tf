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

# Provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "Koumpa"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

locals {
  project_name = "koumpa"
  name_prefix  = "${local.project_name}-${var.environment}"
  domain_name  = var.domain_name
  apps_domain  = "apps.staging.${var.domain_name}"
  api_domain   = "api.staging.${var.domain_name}"

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

# =============================================================================
# DNS & Certificates Module
# =============================================================================
module "dns" {
  source = "../../modules/dns"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  name_prefix = local.name_prefix
  environment = var.environment
  domain_name = local.domain_name
  apps_domain = local.apps_domain
  api_domain  = local.api_domain
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

  name_prefix         = local.name_prefix
  environment         = var.environment
  domain_name         = local.apps_domain
  acm_certificate_arn = module.dns.cloudfront_certificate_arn
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
  user_pool_id        = module.auth.user_pool_id
  user_pool_arn       = module.auth.user_pool_arn
  user_pool_client_id = module.auth.user_pool_client_id

  # CloudFront
  cloudfront_domain = local.apps_domain

  # Custom Domain
  api_domain_name     = local.api_domain
  api_certificate_arn = module.dns.api_certificate_arn
}

# EventBridge Cron Jobs Module
module "cron" {
  source = "../../modules/cron"

  name_prefix = local.name_prefix
  environment = var.environment

  daily_bonus_lambda_arn = module.api.daily_bonus_lambda_arn
  users_table_name       = module.database.users_table_name
}

# =============================================================================
# Route 53 DNS Records
# =============================================================================

# CloudFront alias record (apps subdomain)
resource "aws_route53_record" "apps" {
  zone_id = module.dns.zone_id
  name    = local.apps_domain
  type    = "A"

  alias {
    name                   = module.storage.cloudfront_domain_name
    zone_id                = module.storage.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# API Gateway alias record
resource "aws_route53_record" "api" {
  zone_id = module.dns.zone_id
  name    = local.api_domain
  type    = "A"

  alias {
    name                   = module.api.api_domain_name
    zone_id                = module.api.api_domain_hosted_zone_id
    evaluate_target_health = false
  }
}
