resource "azurerm_key_vault" "this" {
  name                       = "kv-${local.resource_suffix}"
  resource_group_name        = azurerm_resource_group.this.name
  location                   = azurerm_resource_group.this.location
  tenant_id                  = data.azurerm_client_config.this.tenant_id
  sku_name                   = "standard"
  rbac_authorization_enabled = true
  tags                       = local.tags
}

resource "azurerm_role_assignment" "kv_terraform" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.this.object_id
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.this.primary_connection_string
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.kv_terraform]
}

resource "azurerm_key_vault_secret" "storage_account_name" {
  name         = "storage-account-name"
  value        = azurerm_storage_account.this.name
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.kv_terraform]
}

resource "azurerm_key_vault_secret" "storage_account_key" {
  name         = "storage-account-key"
  value        = azurerm_storage_account.this.primary_access_key
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.kv_terraform]
}

resource "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "stripe-secret-key"
  value        = var.stripe_secret_key
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.kv_terraform]
}

resource "azurerm_key_vault_secret" "swa_deployment_token" {
  name         = "swa-deployment-token"
  value        = azurerm_static_web_app.this.api_key
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.kv_terraform]
}
