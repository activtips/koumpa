output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "zone_name_servers" {
  description = "Route 53 hosted zone name servers"
  value       = data.aws_route53_zone.main.name_servers
}

output "cloudfront_certificate_arn" {
  description = "ACM certificate ARN for CloudFront (us-east-1)"
  value       = aws_acm_certificate_validation.cloudfront.certificate_arn
}

output "api_certificate_arn" {
  description = "ACM certificate ARN for API Gateway (regional)"
  value       = aws_acm_certificate_validation.api.certificate_arn
}

output "api_domain" {
  description = "API domain name"
  value       = var.api_domain
}
