output "resource_group_name" {
  value = azurerm_resource_group.this.name
}

output "storage_account_name" {
  value = azurerm_storage_account.this.name
}

output "swa_name" {
  value = azurerm_static_web_app.this.name
}

output "swa_default_hostname" {
  value = azurerm_static_web_app.this.default_host_name
}

output "swa_api_key" {
  value     = azurerm_static_web_app.this.api_key
  sensitive = true
}
