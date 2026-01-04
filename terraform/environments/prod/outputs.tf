output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api.api_gateway_url
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for generated apps"
  value       = module.storage.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.storage.cloudfront_distribution_id
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.auth.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.auth.user_pool_client_id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = module.auth.cognito_domain
}

output "plans_table_name" {
  description = "DynamoDB plans table name"
  value       = module.database.plans_table_name
}

output "users_table_name" {
  description = "DynamoDB users table name"
  value       = module.database.users_table_name
}

output "projects_table_name" {
  description = "DynamoDB projects table name"
  value       = module.database.projects_table_name
}

output "apps_bucket_name" {
  description = "S3 bucket for generated apps"
  value       = module.storage.apps_bucket_name
}

output "landing_domain" {
  description = "Landing page domain (koumpa.com)"
  value       = local.root_domain
}

output "wildcard_domain" {
  description = "Wildcard domain for user apps (*.koumpa.com)"
  value       = local.wildcard_domain
}

output "api_domain" {
  description = "API domain"
  value       = local.api_domain
}

output "name_servers" {
  description = "Route 53 name servers (configure in your domain registrar)"
  value       = module.dns.zone_name_servers
}

# Instructions for frontend configuration
output "frontend_env_variables" {
  description = "Environment variables needed for frontend"
  value = <<-EOT
    NEXT_PUBLIC_API_URL=${module.api.api_gateway_url}
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=${module.auth.user_pool_id}
    NEXT_PUBLIC_COGNITO_CLIENT_ID=${module.auth.user_pool_client_id}
    NEXT_PUBLIC_COGNITO_DOMAIN=${module.auth.cognito_domain}
    NEXT_PUBLIC_AWS_REGION=${var.aws_region}
    NEXT_PUBLIC_CLOUDFRONT_DOMAIN=${module.storage.cloudfront_domain_name}
  EOT
}
