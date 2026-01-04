# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.name_prefix}-users"

  # Email as username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # User attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = false

    string_attribute_constraints {
      min_length = 5
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = false
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # MFA configuration (optional, can enable later)
  mfa_configuration = "OFF"

  # Device tracking
  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = true
  }

  # Lambda triggers (can add pre-signup, post-confirmation, etc.)
  # lambda_config {
  #   pre_sign_up = aws_lambda_function.pre_signup.arn
  # }

  tags = {
    Name = "${var.name_prefix}-user-pool"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.name_prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth flows
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  # Callback and logout URLs
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Token validity
  id_token_validity      = 60  # minutes
  access_token_validity  = 60  # minutes
  refresh_token_validity = 30  # days

  token_validity_units {
    id_token      = "minutes"
    access_token  = "minutes"
    refresh_token = "days"
  }

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]

  # Read/write attributes
  read_attributes = [
    "email",
    "email_verified",
    "name",
  ]

  write_attributes = [
    "email",
    "name",
  ]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Enable secret for server-side auth (if needed)
  generate_secret = false
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.name_prefix}-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Random suffix for unique domain
resource "random_string" "domain_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Cognito Identity Pool (for AWS credentials if needed)
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.name_prefix}-identity"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = true
  }

  tags = {
    Name = "${var.name_prefix}-identity-pool"
  }
}

# IAM roles for authenticated users
resource "aws_iam_role" "authenticated" {
  name = "${var.name_prefix}-cognito-authenticated"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "cognito-identity.amazonaws.com"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
        }
        "ForAnyValue:StringLike" = {
          "cognito-identity.amazonaws.com:amr" = "authenticated"
        }
      }
    }]
  })

  tags = {
    Name = "${var.name_prefix}-cognito-authenticated-role"
  }
}

# Attach role to identity pool
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated = aws_iam_role.authenticated.arn
  }
}
