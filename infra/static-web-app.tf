resource "azurerm_static_web_app" "this" {
  name                = "stapp-${local.name_suffix}"
  resource_group_name = azurerm_resource_group.this.name
  location            = "westeurope"
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}
