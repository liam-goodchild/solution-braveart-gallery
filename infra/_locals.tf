locals {
  name_suffix = "${var.project}-${var.environment}-${var.location_short}-${var.instance}"
  name_flat   = "${var.project}${var.environment}${var.location_short}${var.instance}"
}
