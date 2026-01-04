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
