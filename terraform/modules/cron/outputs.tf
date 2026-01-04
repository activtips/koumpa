output "daily_bonus_rule_arn" {
  description = "ARN of the daily bonus EventBridge rule"
  value       = aws_cloudwatch_event_rule.daily_bonus.arn
}

output "monthly_reset_rule_arn" {
  description = "ARN of the monthly reset EventBridge rule"
  value       = aws_cloudwatch_event_rule.monthly_reset.arn
}
