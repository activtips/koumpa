variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "domain_name" {
  description = "Root domain name (e.g., koumpa.com)"
  type        = string
}

variable "api_domain" {
  description = "Domain for API Gateway (e.g., api.koumpa.com or api.staging.koumpa.com)"
  type        = string
}
