# Multi-Tenant Console Application
resource "auth0_client" "console_app" {
  name        = "auth0-poc-console"
  description = "Multi-tenant console application with organization selection"
  
  app_type              = "regular_web"
  is_first_party        = true
  oidc_conformant       = true
  is_token_endpoint_ip_header_trusted = true
  
  callbacks  = var.console_app_urls.callback_urls
  allowed_logout_urls = var.console_app_urls.logout_urls
  web_origins = var.console_app_urls.web_origins
  initiate_login_uri = var.console_app_urls.login_url
  
  grant_types = [
    "authorization_code",
    "refresh_token",
    "client_credentials"
  ]
  
  organization_usage = "require"  # allow, deny, or require
  organization_require_behavior = "post_login_prompt"
  
  jwt_configuration {
    alg                 = "RS256"
    lifetime_in_seconds = 36000
  }
  
  refresh_token {
    rotation_type                = "rotating"
    expiration_type              = "expiring"
    leeway                       = 0
    token_lifetime               = 2592000  # 30 days
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    idle_token_lifetime          = 1296000  # 15 days
  }
}

# Client Grant for Console App (Management API)
resource "auth0_client_grant" "console_app_management_grant" {
  client_id = auth0_client.console_app.id
  audience  = "https://${var.auth0_domain}/api/v2/"
  
  scopes = [
    "read:users",
    "read:organizations",
    "read:organization_members",
    "read:organization_member_roles",
    "create:organization_invitations",
    "create:organization_member_roles",
    "delete:organization_member_roles"
  ]
}

# Single-Tenant Internal Application
resource "auth0_client" "internal_app" {
  name        = "auth0-poc-internal"
  description = "Single-tenant internal application restricted to specific organization"
  
  app_type              = "regular_web"
  is_first_party        = true
  oidc_conformant       = true
  is_token_endpoint_ip_header_trusted = true
  
  initiate_login_uri = var.internal_app_urls.login_url
  callbacks  = var.internal_app_urls.callback_urls
  allowed_logout_urls = var.internal_app_urls.logout_urls
  web_origins = var.internal_app_urls.web_origins
  
  grant_types = [
    "authorization_code",
    "refresh_token"
  ]
  
  jwt_configuration {
    alg                 = "RS256"
    lifetime_in_seconds = 36000
  }
  
  refresh_token {
    rotation_type                = "rotating"
    expiration_type              = "expiring"
    leeway                       = 0
    token_lifetime               = 2592000  # 30 days
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    idle_token_lifetime          = 1296000  # 15 days
  }
  
  organization_usage = "require"
  
  organization_require_behavior = "no_prompt"
}

# Retrieve client credentials (secrets)
resource "auth0_client_credentials" "console_app_credentials" {
  client_id = auth0_client.console_app.id
  
  authentication_method = "client_secret_post"
}

resource "auth0_client_credentials" "internal_app_credentials" {
  client_id = auth0_client.internal_app.id
  
  authentication_method = "client_secret_post"
}
