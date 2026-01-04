output "plans_table_name" {
  description = "DynamoDB plans table name"
  value       = aws_dynamodb_table.plans.name
}

output "plans_table_arn" {
  description = "DynamoDB plans table ARN"
  value       = aws_dynamodb_table.plans.arn
}

output "users_table_name" {
  description = "DynamoDB users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "DynamoDB users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "projects_table_name" {
  description = "DynamoDB projects table name"
  value       = aws_dynamodb_table.projects.name
}

output "projects_table_arn" {
  description = "DynamoDB projects table ARN"
  value       = aws_dynamodb_table.projects.arn
}
