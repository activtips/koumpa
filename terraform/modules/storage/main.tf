# S3 Bucket for generated apps
resource "aws_s3_bucket" "apps" {
  bucket = "${var.name_prefix}-apps"

  tags = {
    Name = "${var.name_prefix}-apps"
  }
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "apps" {
  bucket = aws_s3_bucket.apps.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "apps" {
  bucket = aws_s3_bucket.apps.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket CORS (for frontend access)
resource "aws_s3_bucket_cors_configuration" "apps" {
  bucket = aws_s3_bucket.apps.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# S3 Bucket Public Access Block (we'll use CloudFront OAC instead)
resource "aws_s3_bucket_public_access_block" "apps" {
  bucket = aws_s3_bucket.apps.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "apps" {
  name                              = "${var.name_prefix}-apps-oac"
  description                       = "OAC for generated apps bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "apps" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribution for Koumpa generated apps"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Use only North America and Europe (cheapest)

  # Custom domain aliases (supports wildcard like *.koumpa.com)
  aliases = var.domain_aliases

  origin {
    domain_name              = aws_s3_bucket.apps.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.apps.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.apps.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.apps.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    min_ttl     = 0
    default_ttl = 3600    # 1 hour
    max_ttl     = 86400   # 24 hours

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # Cache behavior for HTML files (shorter TTL)
  ordered_cache_behavior {
    path_pattern           = "*.html"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.apps.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    min_ttl     = 0
    default_ttl = 300     # 5 minutes
    max_ttl     = 3600    # 1 hour

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # Custom error responses
  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = length(var.domain_aliases) == 0 ? true : false
    acm_certificate_arn            = length(var.domain_aliases) > 0 ? var.acm_certificate_arn : null
    ssl_support_method             = length(var.domain_aliases) > 0 ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.name_prefix}-apps-distribution"
  }
}

# S3 Bucket Policy to allow CloudFront OAC
resource "aws_s3_bucket_policy" "apps" {
  bucket = aws_s3_bucket.apps.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowCloudFrontServicePrincipal"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.apps.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.apps.arn
        }
      }
    }]
  })
}
