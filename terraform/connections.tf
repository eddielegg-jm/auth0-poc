# GitHub Social Connection
resource "auth0_connection" "github_connection" {
  name     = "github-poc"
  strategy = "github"

  options {
    scopes = [
      "email",
      "profile",
      "read:user"
    ]
    
    set_user_root_attributes = "on_first_login"
    non_persistent_attrs      = []
  }
}

resource "auth0_connection_clients" "github_clients" {
  connection_id = auth0_connection.github_connection.id
  enabled_clients = [
    auth0_client.console_app.id,
    auth0_client.internal_app.id
  ]
}

# Google OAuth2 Connection
resource "auth0_connection" "google_oauth2_connection" {
  name     = "google-oauth2-poc"
  strategy = "google-oauth2"

  options {
    allowed_audiences = []
    
    scopes = [
      "email",
      "profile"
    ]
    
    set_user_root_attributes = "on_first_login"
  }
}

resource "auth0_connection_clients" "google_oauth2_clients" {
  connection_id = auth0_connection.google_oauth2_connection.id
  enabled_clients = [
    auth0_client.console_app.id,
    auth0_client.internal_app.id
  ]
}

# Username-Password-Authentication (Database Connection)
resource "auth0_connection" "database_connection" {
  name     = "Username-Password-Authentication-poc"
  strategy = "auth0"

  options {
    password_policy                = "good"
    brute_force_protection         = true
    enabled_database_customization = false
    import_mode                    = false
    requires_username              = false
    disable_signup                 = false
    
    password_history {
      enable = true
      size   = 5
    }
    
    password_no_personal_info {
      enable = true
    }
    
    password_dictionary {
      enable = true
    }
    
    password_complexity_options {
      min_length = 8
    }
    
    validation {
      username {
        min = 1
        max = 50
      }
    }
  }


}

resource "auth0_connection_clients" "database_clients" {
  connection_id = auth0_connection.database_connection.id
  enabled_clients = [
    auth0_client.console_app.id,
  ]
}
