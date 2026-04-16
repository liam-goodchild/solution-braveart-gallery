resource "azurerm_static_web_app" "this" {
  name                = "stapp-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.this.name
  location            = "westeurope"
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = local.tags
}

resource "azurerm_static_web_app_custom_domain" "apex" {
  count             = var.dns_delegated ? 1 : 0
  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = var.domain_name
  validation_type   = "dns-txt-token"
}

resource "azurerm_static_web_app_custom_domain" "www" {
  count             = var.dns_delegated ? 1 : 0
  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = "www.${var.domain_name}"
  validation_type   = "cname-delegation"
}
