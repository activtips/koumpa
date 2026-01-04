variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "koumpa.com"
}

# Secrets (should be passed via TF_VAR_ or .tfvars file, NEVER commit)
variable "claude_api_key" {
  description = "Anthropic Claude API key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key (LIVE key for production)"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret"
  type        = string
  sensitive   = true
}

# Cognito
variable "cognito_callback_urls" {
  description = "Allowed callback URLs for Cognito"
  type        = list(string)
  default     = ["https://koumpa.com/auth/callback", "https://www.koumpa.com/auth/callback"]
}

variable "cognito_logout_urls" {
  description = "Allowed logout URLs for Cognito"
  type        = list(string)
  default     = ["https://koumpa.com", "https://www.koumpa.com"]
}
