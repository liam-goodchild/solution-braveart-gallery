resource "azurerm_dns_zone" "this" {
  name                = var.domain_name
  resource_group_name = azurerm_resource_group.this.name
  tags                = local.tags
}

resource "azurerm_dns_a_record" "apex" {
  count               = var.dns_delegated ? 1 : 0
  name                = "@"
  zone_name           = azurerm_dns_zone.this.name
  resource_group_name = azurerm_resource_group.this.name
  ttl                 = 3600
  target_resource_id  = azurerm_static_web_app.this.id
  tags                = local.tags
}

resource "azurerm_dns_txt_record" "apex_validation" {
  count               = var.dns_delegated ? 1 : 0
  name                = "@"
  zone_name           = azurerm_dns_zone.this.name
  resource_group_name = azurerm_resource_group.this.name
  ttl                 = 3600
  tags                = local.tags

  record {
    value = azurerm_static_web_app_custom_domain.apex[0].validation_token
  }
}

resource "azurerm_dns_cname_record" "www" {
  count               = var.dns_delegated ? 1 : 0
  name                = "www"
  zone_name           = azurerm_dns_zone.this.name
  resource_group_name = azurerm_resource_group.this.name
  ttl                 = 3600
  record              = azurerm_static_web_app.this.default_host_name
  tags                = local.tags
}
