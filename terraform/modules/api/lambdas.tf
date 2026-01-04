# Lambda Layer for shared dependencies (AWS SDK, Anthropic SDK)
resource "aws_lambda_layer_version" "dependencies" {
  filename            = "${path.module}/../../../src/lambdas/layers/dependencies.zip"
  layer_name          = "${var.name_prefix}-dependencies"
  compatible_runtimes = ["nodejs20.x"]
  description         = "Shared dependencies for Koumpa lambdas"

  # Create layer only if zip exists
  lifecycle {
    ignore_changes = [filename]
  }
}

# Lambda: Generate App (Main AI generation endpoint)
resource "aws_lambda_function" "generate_app" {
  filename         = "${path.module}/../../../src/lambdas/generate-app/function.zip"
  function_name    = "${var.name_prefix}-generate-app"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/generate-app/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/generate-app/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 300 # 5 minutes for Claude API calls
  memory_size      = 512

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      PLANS_TABLE    = var.plans_table_name
      USERS_TABLE    = var.users_table_name
      PROJECTS_TABLE = var.projects_table_name
      APPS_BUCKET    = var.apps_bucket_name
      SECRETS_ARN    = var.secrets_arn
      CLOUDFRONT_URL = "https://${var.cloudfront_domain}"
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
    }
  }

  depends_on = [aws_cloudwatch_log_group.generate_app]

  tags = {
    Name = "${var.name_prefix}-generate-app"
  }
}

# Lambda: Stripe Webhook
resource "aws_lambda_function" "stripe_webhook" {
  filename         = "${path.module}/../../../src/lambdas/stripe-webhook/function.zip"
  function_name    = "${var.name_prefix}-stripe-webhook"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/stripe-webhook/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/stripe-webhook/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      PLANS_TABLE  = var.plans_table_name
      USERS_TABLE  = var.users_table_name
      SECRETS_ARN  = var.secrets_arn
    }
  }

  depends_on = [aws_cloudwatch_log_group.stripe_webhook]

  tags = {
    Name = "${var.name_prefix}-stripe-webhook"
  }
}

# Lambda: Daily Bonus Credits (Cron)
resource "aws_lambda_function" "daily_bonus" {
  filename         = "${path.module}/../../../src/lambdas/daily-bonus/function.zip"
  function_name    = "${var.name_prefix}-daily-bonus"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/daily-bonus/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/daily-bonus/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
      PLANS_TABLE = var.plans_table_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.daily_bonus]

  tags = {
    Name = "${var.name_prefix}-daily-bonus"
  }
}

# Lambda: Get User Info
resource "aws_lambda_function" "get_user" {
  filename         = "${path.module}/../../../src/lambdas/get-user/function.zip"
  function_name    = "${var.name_prefix}-get-user"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/get-user/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/get-user/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
      PLANS_TABLE = var.plans_table_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.get_user]

  tags = {
    Name = "${var.name_prefix}-get-user"
  }
}

# Lambda: List User Projects
resource "aws_lambda_function" "list_projects" {
  filename         = "${path.module}/../../../src/lambdas/list-projects/function.zip"
  function_name    = "${var.name_prefix}-list-projects"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/list-projects/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/list-projects/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.list_projects]

  tags = {
    Name = "${var.name_prefix}-list-projects"
  }
}

# Lambda: Admin Update Plan (SuperAdmin)
resource "aws_lambda_function" "admin_update_plan" {
  filename         = "${path.module}/../../../src/lambdas/admin-update-plan/function.zip"
  function_name    = "${var.name_prefix}-admin-update-plan"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/../../../src/lambdas/admin-update-plan/function.zip") ? filebase64sha256("${path.module}/../../../src/lambdas/admin-update-plan/function.zip") : null
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      PLANS_TABLE = var.plans_table_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.admin_update_plan]

  tags = {
    Name = "${var.name_prefix}-admin-update-plan"
  }
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "generate_app" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_app.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "stripe_webhook" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stripe_webhook.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "list_projects" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_update_plan" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_update_plan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
