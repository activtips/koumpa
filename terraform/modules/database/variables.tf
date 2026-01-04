variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# Stripe Price IDs (create these in Stripe Dashboard first)
variable "stripe_price_id_pro_monthly" {
  description = "Stripe Price ID for Pro monthly plan"
  type        = string
  default     = "price_pro_monthly_placeholder"
}

variable "stripe_price_id_pro_yearly" {
  description = "Stripe Price ID for Pro yearly plan"
  type        = string
  default     = "price_pro_yearly_placeholder"
}

variable "stripe_price_id_teams_monthly" {
  description = "Stripe Price ID for Teams monthly plan"
  type        = string
  default     = "price_teams_monthly_placeholder"
}

variable "stripe_price_id_teams_yearly" {
  description = "Stripe Price ID for Teams yearly plan"
  type        = string
  default     = "price_teams_yearly_placeholder"
}

variable "stripe_price_id_business_monthly" {
  description = "Stripe Price ID for Business monthly plan"
  type        = string
  default     = "price_business_monthly_placeholder"
}

variable "stripe_price_id_business_yearly" {
  description = "Stripe Price ID for Business yearly plan"
  type        = string
  default     = "price_business_yearly_placeholder"
}
