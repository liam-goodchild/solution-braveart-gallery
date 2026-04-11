variable "subscription_id" {
  description = "Azure subscription ID for the customer environment"
  type        = string
  default     = "1c26c084-763b-4d2d-86aa-af36b444b6bb"
}

variable "project" {
  description = "Short project name used in resource naming"
  type        = string
  default     = "bbgart"
}

variable "environment" {
  description = "Environment abbreviation (prd, dev, etc.)"
  type        = string
  default     = "prd"
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

variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    project     = "buffy-braveart-gallery"
    environment = "production"
  }
}

variable "stripe_secret_key" {
  description = "Stripe secret key for checkout"
  type        = string
  sensitive   = true
}
