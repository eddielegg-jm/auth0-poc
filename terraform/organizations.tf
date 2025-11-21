# Organizations
resource "auth0_organization" "orgs" {
  for_each = var.organizations
  
  name         = each.key
  display_name = each.value.display_name
  
  branding {
    logo_url = try(each.value.branding.logo_url, null)
  }
  
  metadata = try(each.value.metadata, {})
}

resource "auth0_organization_connections" "leap_brain_connections" {  
  organization_id = auth0_organization.orgs["org-01"].id
  
  enabled_connections {
    connection_id          = auth0_connection.google_oauth2_connection.id
    assign_membership_on_login = true
    show_as_button        = true
  }
}

resource "auth0_organization_connections" "fudge_connections" {
  organization_id = auth0_organization.orgs["org-02"].id

   enabled_connections {
    connection_id          = auth0_connection.database_connection.id
    assign_membership_on_login = false
    show_as_button        = true
  }
}

resource "auth0_organization_connections" "cheese_connections" {
  organization_id = auth0_organization.orgs["org-03"].id

  enabled_connections {
    connection_id          = auth0_connection.github_connection.id
    assign_membership_on_login = false
    show_as_button        = true
  }

  enabled_connections {
    connection_id          = auth0_connection.google_oauth2_connection.id
    assign_membership_on_login = true
    show_as_button        = true
  }
}
