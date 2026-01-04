# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "Koumpa API Gateway"

  cors_configuration {
    allow_origins = ["*"] # TODO: Restrict in production
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }

  tags = {
    Name = "${var.name_prefix}-api"
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    throttling_burst_limit = 1000
    throttling_rate_limit  = 500
  }

  tags = {
    Name = "${var.name_prefix}-api-stage"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = 7

  tags = {
    Name = "${var.name_prefix}-api-logs"
  }
}

# JWT Authorizer (Cognito)
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [var.user_pool_client_id]
    issuer   = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${var.user_pool_id}"
  }
}

# Lambda execution role
resource "aws_iam_role" "lambda_exec" {
  name = "${var.name_prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.name_prefix}-lambda-exec-role"
  }
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_exec.name
}

# Lambda policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.name_prefix}-lambda-dynamodb"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          var.plans_table_arn,
          var.users_table_arn,
          var.projects_table_arn,
          "${var.users_table_arn}/index/*",
          "${var.projects_table_arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda policy for S3 access
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.name_prefix}-lambda-s3"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ]
      Resource = "${var.apps_bucket_arn}/*"
    }]
  })
}

# Lambda policy for Secrets Manager
resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.name_prefix}-lambda-secrets"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "secretsmanager:GetSecretValue"
      Resource = var.secrets_arn
    }]
  })
}

# CloudWatch Log Groups for Lambdas
resource "aws_cloudwatch_log_group" "generate_app" {
  name              = "/aws/lambda/${var.name_prefix}-generate-app"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "stripe_webhook" {
  name              = "/aws/lambda/${var.name_prefix}-stripe-webhook"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "daily_bonus" {
  name              = "/aws/lambda/${var.name_prefix}-daily-bonus"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "get_user" {
  name              = "/aws/lambda/${var.name_prefix}-get-user"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "list_projects" {
  name              = "/aws/lambda/${var.name_prefix}-list-projects"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "admin_update_plan" {
  name              = "/aws/lambda/${var.name_prefix}-admin-update-plan"
  retention_in_days = 7
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
