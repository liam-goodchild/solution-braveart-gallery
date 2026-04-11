locals {
  name_suffix = var.project
}

# ---------- Resource Group ----------

resource "azurerm_resource_group" "this" {
  name     = "rg-${local.name_suffix}"
  location = var.location
  tags     = var.tags
}

# ---------- Storage Account (Blob + Table) ----------

resource "azurerm_storage_account" "this" {
  name                     = "st${replace(local.name_suffix, "-", "")}"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.tags

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["PUT"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
}

# Container for artwork images (public blob access for serving)
resource "azurerm_storage_container" "artwork_images" {
  name                  = "artwork-images"
  storage_account_id    = azurerm_storage_account.this.id
  container_access_type = "blob"
}

# Table for artwork metadata
resource "azurerm_storage_table" "artworks" {
  name                 = "artworks"
  storage_account_name = azurerm_storage_account.this.name
}

# ---------- Static Web App (Free tier) ----------

resource "azurerm_static_web_app" "this" {
  name                = "swa-${local.name_suffix}"
  resource_group_name = azurerm_resource_group.this.name
  location            = "westeurope"
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}
