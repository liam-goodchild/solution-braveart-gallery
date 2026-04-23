output "cloudflare_nameservers" {
  description = "Cloudflare nameservers to configure manually at the registrar after the zone is created."
  value       = { for zone_name, zone in cloudflare_zone.public : zone_name => zone.name_servers }
}
