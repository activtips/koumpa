output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "daily_bonus_lambda_arn" {
  description = "Daily bonus Lambda function ARN"
  value       = aws_lambda_function.daily_bonus.arn
}

output "daily_bonus_lambda_name" {
  description = "Daily bonus Lambda function name"
  value       = aws_lambda_function.daily_bonus.function_name
}

output "generate_app_lambda_arn" {
  description = "Generate app Lambda function ARN"
  value       = aws_lambda_function.generate_app.arn
}

output "stripe_webhook_lambda_arn" {
  description = "Stripe webhook Lambda function ARN"
  value       = aws_lambda_function.stripe_webhook.arn
}

output "api_domain_name" {
  description = "API Gateway custom domain target domain name"
  value       = length(aws_apigatewayv2_domain_name.api) > 0 ? aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].target_domain_name : ""
}

output "api_domain_hosted_zone_id" {
  description = "API Gateway custom domain hosted zone ID"
  value       = length(aws_apigatewayv2_domain_name.api) > 0 ? aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].hosted_zone_id : ""
}
