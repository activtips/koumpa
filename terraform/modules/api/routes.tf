# API Routes and Integrations

# Route: POST /api/generate (Protected - requires auth)
resource "aws_apigatewayv2_integration" "generate_app" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.generate_app.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "generate_app" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /api/generate"
  target             = "integrations/${aws_apigatewayv2_integration.generate_app.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Route: POST /webhooks/stripe (Public - for Stripe webhooks)
resource "aws_apigatewayv2_integration" "stripe_webhook" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.stripe_webhook.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stripe_webhook" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /webhooks/stripe"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_webhook.id}"
}

# Route: GET /api/user (Protected)
resource "aws_apigatewayv2_integration" "get_user" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_user.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_user" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /api/user"
  target             = "integrations/${aws_apigatewayv2_integration.get_user.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Route: GET /api/projects (Protected)
resource "aws_apigatewayv2_integration" "list_projects" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.list_projects.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "list_projects" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /api/projects"
  target             = "integrations/${aws_apigatewayv2_integration.list_projects.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Route: PUT /api/admin/plans/{planId} (Protected - SuperAdmin only)
resource "aws_apigatewayv2_integration" "admin_update_plan" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.admin_update_plan.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "admin_update_plan" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /api/admin/plans/{planId}"
  target             = "integrations/${aws_apigatewayv2_integration.admin_update_plan.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Note: Additional routes to add:
# - GET /api/plans (list all plans)
# - POST /api/checkout (create Stripe checkout session)
# - GET /api/admin/users (list all users - SuperAdmin)
# - PUT /api/admin/users/{userId}/credits (modify user credits - SuperAdmin)
# - GET /api/admin/analytics (dashboard stats - SuperAdmin)
