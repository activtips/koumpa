output "apps_bucket_name" {
  description = "S3 bucket name for generated apps"
  value       = aws_s3_bucket.apps.id
}

output "apps_bucket_arn" {
  description = "S3 bucket ARN for generated apps"
  value       = aws_s3_bucket.apps.arn
}

output "apps_bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.apps.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.apps.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.apps.domain_name
}

output "cloudfront_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.apps.arn
}
