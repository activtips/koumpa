# EventBridge Rule: Daily Bonus Credits (every day at midnight UTC)
resource "aws_cloudwatch_event_rule" "daily_bonus" {
  name                = "${var.name_prefix}-daily-bonus"
  description         = "Trigger daily bonus credits distribution"
  schedule_expression = "cron(0 0 * * ? *)" # Every day at 00:00 UTC

  tags = {
    Name = "${var.name_prefix}-daily-bonus-rule"
  }
}

# EventBridge Target: Lambda function
resource "aws_cloudwatch_event_target" "daily_bonus" {
  rule      = aws_cloudwatch_event_rule.daily_bonus.name
  target_id = "DailyBonusLambda"
  arn       = var.daily_bonus_lambda_arn
}

# Lambda Permission for EventBridge
resource "aws_lambda_permission" "daily_bonus" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = var.daily_bonus_lambda_arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_bonus.arn
}

# Optional: Monthly credits reset (first day of month at 00:00 UTC)
resource "aws_cloudwatch_event_rule" "monthly_reset" {
  name                = "${var.name_prefix}-monthly-reset"
  description         = "Reset monthly credits on the 1st of each month"
  schedule_expression = "cron(0 0 1 * ? *)" # 1st day of month at 00:00 UTC

  tags = {
    Name = "${var.name_prefix}-monthly-reset-rule"
  }
}

# Note: This would trigger the same daily_bonus lambda
# The lambda should handle both daily bonus and monthly reset logic
resource "aws_cloudwatch_event_target" "monthly_reset" {
  rule      = aws_cloudwatch_event_rule.monthly_reset.name
  target_id = "MonthlyResetLambda"
  arn       = var.daily_bonus_lambda_arn
  
  input = jsonencode({
    type = "monthly_reset"
  })
}

resource "aws_lambda_permission" "monthly_reset" {
  statement_id  = "AllowExecutionFromEventBridgeMonthly"
  action        = "lambda:InvokeFunction"
  function_name = var.daily_bonus_lambda_arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.monthly_reset.arn
}
