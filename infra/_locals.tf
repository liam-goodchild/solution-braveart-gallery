locals {
  resource_suffix      = "${var.workload}-${var.environment}-${var.location_short}-${var.instance}"
  resource_suffix_flat = "${var.workload}${var.environment}${var.location_short}${var.instance}"

  cloudflare_dns_zones = var.cloudflare_enabled ? {
    (var.domain_name) = var.domain_name
  } : {}

  tags = {
    managed-by = "terraform"
  }
}
