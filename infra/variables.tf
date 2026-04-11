variable "project" {
  description = "Short project name used in resource naming"
  type        = string
  default     = "buffybraveart"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "uksouth"
}

variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    project = "buffy-braveart-gallery"
  }
}
