resource "azurerm_static_web_app" "this" {
  name                = "stapp-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.this.name
  location            = "westeurope"
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = local.tags

  app_settings = {
    STRIPE_SECRET_KEY = var.stripe_secret_key
    FRONTEND_URL      = "https://${var.domain_name}"
  }

  lifecycle {
    ignore_changes = [
      repository_branch,
      repository_url,
    ]
  }
}

resource "azurerm_static_web_app_custom_domain" "apex" {
  count             = var.dns_delegated ? 1 : 0
  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = var.domain_name
  validation_type   = "dns-txt-token"
}
