variable "subscription_id" {
  description = "Azure subscription ID for the customer environment"
  type        = string
  default     = "1c26c084-763b-4d2d-86aa-af36b444b6bb"
}

variable "workload" {
  description = "Workload name used in resource naming"
  type        = string
  default     = "braveart"
}

variable "environment" {
  description = "Environment abbreviation (prd, dev, etc.)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "uksouth"
}

variable "location_short" {
  description = "Short region code used in resource naming"
  type        = string
  default     = "uks"
}

variable "instance" {
  description = "Instance number for resource naming"
  type        = string
  default     = "01"
}

variable "domain_name" {
  description = "Custom domain name for the static web app"
  type        = string
  default     = "buffybraveart.com"
}

variable "dns_delegated" {
  description = "Set to true after GoDaddy nameservers point to Azure DNS"
  type        = bool
  default     = false
}

variable "stripe_secret_key" {
  description = "Stripe secret API key"
  type        = string
  sensitive   = true
  default     = ""
}