# DynamoDB Table: Subscription Plans
resource "aws_dynamodb_table" "plans" {
  name         = "${var.name_prefix}-plans"
  billing_mode = "PAY_PER_REQUEST" # On-demand pricing (no capacity planning needed)
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.name_prefix}-plans"
  }
}

# DynamoDB Table: Users
resource "aws_dynamodb_table" "users" {
  name         = "${var.name_prefix}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "stripeCustomerId"
    type = "S"
  }

  # GSI for email lookup
  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  # GSI for Stripe customer lookup
  global_secondary_index {
    name            = "stripe-customer-index"
    hash_key        = "stripeCustomerId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.name_prefix}-users"
  }
}

# DynamoDB Table: Projects (Generated Apps)
resource "aws_dynamodb_table" "projects" {
  name         = "${var.name_prefix}-projects"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "projectId"

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # GSI for user's projects lookup
  global_secondary_index {
    name            = "userId-createdAt-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.name_prefix}-projects"
  }
}

# Seed initial plans data
resource "aws_dynamodb_table_item" "plan_free" {
  table_name = aws_dynamodb_table.plans.name
  hash_key   = aws_dynamodb_table.plans.hash_key

  item = jsonencode({
    id                   = { S = "free" }
    name                 = { S = "Free" }
    priceMonthly         = { N = "0" }
    priceYearly          = { N = "0" }
    stripePriceIdMonthly = { NULL = true }
    stripePriceIdYearly  = { NULL = true }
    creditsPerMonth      = { N = "5" }
    dailyBonusCredits    = { N = "5" }
    maxRolloverCredits   = { N = "0" }
    maxProjects          = { N = "999" }
    maxPrivateProjects   = { N = "0" }
    features = { M = {
      publicProjects  = { BOOL = true }
      githubSync      = { BOOL = true }
      oneClickDeploy  = { BOOL = true }
      customDomains   = { BOOL = false }
      codeExport      = { BOOL = false }
      privateProjects = { BOOL = false }
    } }
    maxTeamMembers = { N = "1" }
    displayOrder   = { N = "0" }
    isVisible      = { BOOL = true }
    recommended    = { BOOL = false }
  })
}

resource "aws_dynamodb_table_item" "plan_pro" {
  table_name = aws_dynamodb_table.plans.name
  hash_key   = aws_dynamodb_table.plans.hash_key

  item = jsonencode({
    id                   = { S = "pro" }
    name                 = { S = "Pro" }
    priceMonthly         = { N = "25" }
    priceYearly          = { N = "240" }
    stripePriceIdMonthly = { S = var.stripe_price_id_pro_monthly }
    stripePriceIdYearly  = { S = var.stripe_price_id_pro_yearly }
    creditsPerMonth      = { N = "100" }
    dailyBonusCredits    = { N = "5" }
    maxRolloverCredits   = { N = "50" }
    maxProjects          = { N = "999" }
    maxPrivateProjects   = { N = "999" }
    features = { M = {
      publicProjects  = { BOOL = true }
      githubSync      = { BOOL = true }
      oneClickDeploy  = { BOOL = true }
      customDomains   = { BOOL = true }
      codeExport      = { BOOL = true }
      privateProjects = { BOOL = true }
    } }
    maxTeamMembers = { N = "1" }
    displayOrder   = { N = "1" }
    isVisible      = { BOOL = true }
    recommended    = { BOOL = true }
  })
}

resource "aws_dynamodb_table_item" "plan_teams" {
  table_name = aws_dynamodb_table.plans.name
  hash_key   = aws_dynamodb_table.plans.hash_key

  item = jsonencode({
    id                   = { S = "teams" }
    name                 = { S = "Teams" }
    priceMonthly         = { N = "30" }
    priceYearly          = { N = "288" }
    stripePriceIdMonthly = { S = var.stripe_price_id_teams_monthly }
    stripePriceIdYearly  = { S = var.stripe_price_id_teams_yearly }
    creditsPerMonth      = { N = "100" }
    dailyBonusCredits    = { N = "5" }
    maxRolloverCredits   = { N = "50" }
    maxProjects          = { N = "999" }
    maxPrivateProjects   = { N = "999" }
    features = { M = {
      publicProjects   = { BOOL = true }
      githubSync       = { BOOL = true }
      oneClickDeploy   = { BOOL = true }
      customDomains    = { BOOL = true }
      codeExport       = { BOOL = true }
      privateProjects  = { BOOL = true }
      sharedWorkspace  = { BOOL = true }
    } }
    maxTeamMembers = { N = "20" }
    displayOrder   = { N = "2" }
    isVisible      = { BOOL = true }
    recommended    = { BOOL = false }
  })
}

resource "aws_dynamodb_table_item" "plan_business" {
  table_name = aws_dynamodb_table.plans.name
  hash_key   = aws_dynamodb_table.plans.hash_key

  item = jsonencode({
    id                   = { S = "business" }
    name                 = { S = "Business" }
    priceMonthly         = { N = "50" }
    priceYearly          = { N = "480" }
    stripePriceIdMonthly = { S = var.stripe_price_id_business_monthly }
    stripePriceIdYearly  = { S = var.stripe_price_id_business_yearly }
    creditsPerMonth      = { N = "200" }
    dailyBonusCredits    = { N = "10" }
    maxRolloverCredits   = { N = "100" }
    maxProjects          = { N = "999" }
    maxPrivateProjects   = { N = "999" }
    features = { M = {
      publicProjects   = { BOOL = true }
      githubSync       = { BOOL = true }
      oneClickDeploy   = { BOOL = true }
      customDomains    = { BOOL = true }
      codeExport       = { BOOL = true }
      privateProjects  = { BOOL = true }
      sharedWorkspace  = { BOOL = true }
      sso              = { BOOL = true }
      dataPrivacy      = { BOOL = true }
      prioritySupport  = { BOOL = true }
    } }
    maxTeamMembers = { N = "50" }
    displayOrder   = { N = "3" }
    isVisible      = { BOOL = true }
    recommended    = { BOOL = false }
  })
}
