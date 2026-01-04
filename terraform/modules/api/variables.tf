variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# DynamoDB Tables
variable "plans_table_name" {
  description = "DynamoDB plans table name"
  type        = string
}

variable "users_table_name" {
  description = "DynamoDB users table name"
  type        = string
}

variable "projects_table_name" {
  description = "DynamoDB projects table name"
  type        = string
}

variable "plans_table_arn" {
  description = "DynamoDB plans table ARN"
  type        = string
}

variable "users_table_arn" {
  description = "DynamoDB users table ARN"
  type        = string
}

variable "projects_table_arn" {
  description = "DynamoDB projects table ARN"
  type        = string
}

# S3
variable "apps_bucket_name" {
  description = "S3 bucket name for generated apps"
  type        = string
}

variable "apps_bucket_arn" {
  description = "S3 bucket ARN for generated apps"
  type        = string
}

# Secrets
variable "secrets_arn" {
  description = "ARN of Secrets Manager secret containing API keys"
  type        = string
}

# Cognito
variable "user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

# CloudFront
variable "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  type        = string
}
