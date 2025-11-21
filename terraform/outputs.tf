output "auth0_domain" {
  description = "Auth0 tenant domain"
  value       = var.auth0_domain
}

output "console_app_client_id" {
  description = "Console application client ID"
  value       = auth0_client.console_app.id
}

output "console_app_client_secret" {
  description = "Console application client secret"
  value       = auth0_client_credentials.console_app_credentials.client_secret
  sensitive   = true
}

output "internal_app_client_id" {
  description = "Internal application client ID"
  value       = auth0_client.internal_app.id
}

output "internal_app_client_secret" {
  description = "Internal application client secret"
  value       = auth0_client_credentials.internal_app_credentials.client_secret
  sensitive   = true
}

output "organizations" {
  description = "Created organizations with their IDs"
  value = {
    for key, org in auth0_organization.orgs : key => {
      id           = org.id
      name         = org.name
      display_name = org.display_name
    }
  }
}

output "connection_ids" {
  description = "Connection IDs for reference"
  value = {
    github   = auth0_connection.github_connection.id
    google   = auth0_connection.google_oauth2_connection.id
    database = auth0_connection.database_connection.id
  }
}

# Output for copying to .env files
output "console_app_env_vars" {
  description = "Environment variables for console app (.env file)"
  value = <<-EOT
    AUTH0_DOMAIN=${var.auth0_domain}
    AUTH0_CLIENT_ID=${auth0_client.console_app.id}
    AUTH0_CLIENT_SECRET=${auth0_client_credentials.console_app_credentials.client_secret}
    AUTH0_CALLBACK_URL=https://auth0-poc.vercel.app/api/auth/callback
    AUTH0_MANAGEMENT_API_CLIENT_ID=${var.auth0_management_client_id}
    AUTH0_MANAGEMENT_API_CLIENT_SECRET=${var.auth0_management_client_secret}
  EOT
  sensitive = true
}

output "internal_app_env_vars" {
  description = "Environment variables for internal app (.env file)"
  value = <<-EOT
    AUTH0_DOMAIN=${var.auth0_domain}
    AUTH0_CLIENT_ID=${auth0_client.internal_app.id}
    AUTH0_CLIENT_SECRET=${auth0_client_credentials.internal_app_credentials.client_secret}
    AUTH0_CALLBACK_URL=https://auth0-poc-internal.vercel.app/api/auth/callback
    AUTH0_ORGANIZATION_ID=${auth0_organization.orgs["org-02"].id}
    AUTH0_AUDIENCE=${auth0_resource_server.api.identifier}
  EOT
  sensitive = true
}

# RBAC Outputs
output "api_identifier" {
  description = "API Resource Server identifier (audience)"
  value       = auth0_resource_server.api.identifier
}

output "roles" {
  description = "Created roles with their IDs"
  value = {
    # Platform roles
    platform_admin = {
      id          = auth0_role.platform_admin.id
      name        = auth0_role.platform_admin.name
      description = auth0_role.platform_admin.description
    }
    platform_support = {
      id          = auth0_role.platform_support.id
      name        = auth0_role.platform_support.name
      description = auth0_role.platform_support.description
    }
    platform_viewer = {
      id          = auth0_role.platform_viewer.id
      name        = auth0_role.platform_viewer.name
      description = auth0_role.platform_viewer.description
    }
    
    # Organization roles
    org_admin = {
      id          = auth0_role.org_admin.id
      name        = auth0_role.org_admin.name
      description = auth0_role.org_admin.description
    }
    org_member = {
      id          = auth0_role.org_member.id
      name        = auth0_role.org_member.name
      description = auth0_role.org_member.description
    }
    org_viewer = {
      id          = auth0_role.org_viewer.id
      name        = auth0_role.org_viewer.name
      description = auth0_role.org_viewer.description
    }
    device_manager = {
      id          = auth0_role.device_manager.id
      name        = auth0_role.device_manager.name
      description = auth0_role.device_manager.description
    }
  }
}
