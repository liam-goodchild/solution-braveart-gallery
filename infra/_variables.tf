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
  description = "Create Azure DNS records and Static Web App custom domains once DNS is ready"
  type        = bool
  default     = false
}

variable "yoco_secret_key" {
  description = "Yoco secret API key for Checkout API"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_enabled" {
  description = "Create the Cloudflare zone and DNS records for the custom domain."
  type        = bool
  default     = false
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone and DNS edit permissions."
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID that will own the DNS zone."
  type        = string
  default     = ""
}
