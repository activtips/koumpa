# =============================================================================
# DNS Module - Route 53 & ACM Certificates
# =============================================================================

terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

# Data source for existing hosted zone
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# =============================================================================
# ACM Certificate for CloudFront (must be in us-east-1)
# Wildcard certificate for user apps + base domain for landing page
# =============================================================================

resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  validation_method = "DNS"

  # Production: *.koumpa.com + koumpa.com
  # Staging: *.staging.koumpa.com + staging.koumpa.com
  domain_name = var.environment == "staging" ? "*.staging.${var.domain_name}" : "*.${var.domain_name}"

  subject_alternative_names = var.environment == "staging" ? [
    "staging.${var.domain_name}"
  ] : [
    var.domain_name
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.name_prefix}-cloudfront-cert"
    Environment = var.environment
  }
}

# DNS validation records for CloudFront certificate
resource "aws_route53_record" "cloudfront_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cloudfront.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Certificate validation for CloudFront
resource "aws_acm_certificate_validation" "cloudfront" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [for record in aws_route53_record.cloudfront_validation : record.fqdn]
}

# =============================================================================
# ACM Certificate for API Gateway (regional)
# =============================================================================

resource "aws_acm_certificate" "api" {
  domain_name       = var.api_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.name_prefix}-api-cert"
    Environment = var.environment
  }
}

# DNS validation records for API certificate
resource "aws_route53_record" "api_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Certificate validation for API
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_validation : record.fqdn]
}
