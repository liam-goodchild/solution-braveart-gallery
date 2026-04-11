terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terrastate-prd-uks-01"
    storage_account_name = "stterrastateprduks01"
    container_name       = "solution-buffybraveart-gallery"
    key                  = "terraform.tfstate"
  }
}
