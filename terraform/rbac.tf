# API Resource Server (Your Backend API)
resource "auth0_resource_server" "api" {
  name       = "Auth0 POC API"
  identifier = var.api_identifier # e.g., "https://api.auth0-poc.com"
  
  # Token settings
  token_lifetime                                  = 86400  # 24 hours
  signing_alg                                     = "RS256"
  skip_consent_for_verifiable_first_party_clients = true
  allow_offline_access                            = true
  
  # Enable RBAC
  enforce_policies = true
  token_dialect    = "access_token_authz"  # Include permissions in access token
}

# API Resource Server Scopes (Permissions)
resource "auth0_resource_server_scopes" "api_scopes" {
  resource_server_identifier = auth0_resource_server.api.identifier

  # Platform-level permissions (permission_level = 'platform')
  scopes {
    name        = "read:user"
    description = "View platform users"
  }
  
  scopes {
    name        = "write:user"
    description = "Manage platform users"
  }
  
  scopes {
    name        = "read:platform_role"
    description = "View platform roles"
  }
  
  scopes {
    name        = "write:platform_role"
    description = "Manage platform roles"
  }
  
  scopes {
    name        = "read:system_role"
    description = "View details for system-managed roles"
  }
  
  scopes {
    name        = "write:system_role"
    description = "Modify system-managed roles"
  }
  
  scopes {
    name        = "read:platform_audit_log"
    description = "View platform audit logs"
  }
  
  scopes {
    name        = "write:org"
    description = "Manage orgs"
  }
  
  scopes {
    name        = "write:org_env"
    description = "Manage org environments"
  }
  
  # Organization-level permissions (permission_level = 'org')
  scopes {
    name        = "read:org"
    description = "Access organization"
  }
  
  scopes {
    name        = "read:org_env"
    description = "View organization environments"
  }
  
  scopes {
    name        = "read:details"
    description = "View organization details and settings"
  }
  
  scopes {
    name        = "write:details"
    description = "Modify organization details and settings"
  }
  
  scopes {
    name        = "read:member"
    description = "View organization members"
  }
  
  scopes {
    name        = "write:member"
    description = "Invite and manage organization members"
  }
  
  scopes {
    name        = "read:role"
    description = "View organization roles"
  }
  
  scopes {
    name        = "write:role"
    description = "Create and manage organization roles"
  }
  
  scopes {
    name        = "read:audit_log"
    description = "View organization audit logs"
  }
  
  scopes {
    name        = "read:business-unit"
    description = "View organization business units"
  }
  
  scopes {
    name        = "write:business-unit"
    description = "Create and manage organization business units"
  }
  
  scopes {
    name        = "read:device"
    description = "View organization devices"
  }
  
  scopes {
    name        = "write:device"
    description = "Create and manage organization devices"
  }
  
  scopes {
    name        = "read:grafana"
    description = "View organization grafana logs"
  }
}

# Platform Roles
# ===============

# Platform Admin - Full platform access and management
resource "auth0_role" "platform_admin" {
  name        = "Platform Admin"
  description = "Full platform access and management"
}

# Platform Support - Most platform read access and full access to all organizations
resource "auth0_role" "platform_support" {
  name        = "Platform Support"
  description = "Most platform read access and full access to all organizations"
}

# Platform Viewer - Read access to all organizations
resource "auth0_role" "platform_viewer" {
  name        = "Platform Viewer"
  description = "Read access to all organizations"
}

# Organization Roles
# ==================

# Admin - Full access and management
resource "auth0_role" "org_admin" {
  name        = "Admin"
  description = "Full access and management"
}

# Member - Most read perms except audit log; write devices
resource "auth0_role" "org_member" {
  name        = "Member"
  description = "Standard access and management"
}

# Viewer - Most read perms except audit log
resource "auth0_role" "org_viewer" {
  name        = "Viewer"
  description = "Read-only access"
}

# Device Manager - Minimal necessary org read + device management
resource "auth0_role" "device_manager" {
  name        = "Device Manager"
  description = "Device management"
}

# Role Permissions
# ================

# Platform Admin Permissions - All permissions
resource "auth0_role_permissions" "platform_admin_perms" {
  role_id = auth0_role.platform_admin.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # All platform permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:user"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:user"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:platform_role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:platform_role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:system_role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:system_role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:platform_audit_log"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:org_env"
  }
  
  # All org permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:audit_log"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
}

# Platform Support Permissions
resource "auth0_role_permissions" "platform_support_perms" {
  role_id = auth0_role.platform_support.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # Platform read: system_role only
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:system_role"
  }
  
  # All org permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:audit_log"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
}

# Platform Viewer Permissions
resource "auth0_role_permissions" "platform_viewer_perms" {
  role_id = auth0_role.platform_viewer.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # All org read permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:audit_log"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
}

# Org Admin Permissions
resource "auth0_role_permissions" "org_admin_perms" {
  role_id = auth0_role.org_admin.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # All org permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:audit_log"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
}

# Org Member Permissions
resource "auth0_role_permissions" "org_member_perms" {
  role_id = auth0_role.org_member.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # Read permissions (most except audit_log)
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
  
  # Write permissions (device only)
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:device"
  }
}

# Org Viewer Permissions
resource "auth0_role_permissions" "org_viewer_perms" {
  role_id = auth0_role.org_viewer.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:details"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:member"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:role"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:grafana"
  }
}

# Device Manager Permissions
resource "auth0_role_permissions" "device_manager_perms" {
  role_id = auth0_role.device_manager.id
  
  depends_on = [auth0_resource_server_scopes.api_scopes]

  # Minimal read permissions
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:org_env"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:business-unit"
  }
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "read:device"
  }
  
  # Device management
  permissions {
    resource_server_identifier = auth0_resource_server.api.identifier
    name                       = "write:device"
  }
}
