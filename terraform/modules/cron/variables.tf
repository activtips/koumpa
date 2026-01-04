variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "daily_bonus_lambda_arn" {
  description = "ARN of the daily bonus Lambda function"
  type        = string
}

variable "users_table_name" {
  description = "DynamoDB users table name"
  type        = string
}
