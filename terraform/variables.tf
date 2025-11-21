variable "auth0_domain" {
  description = "Auth0 domain (e.g., dev-57ctxx7z8j5mdir1.us.auth0.com)"
  type        = string
}

variable "auth0_management_client_id" {
  description = "Auth0 Management API Client ID"
  type        = string
  sensitive   = true
}

variable "auth0_management_client_secret" {
  description = "Auth0 Management API Client Secret"
  type        = string
  sensitive   = true
}

variable "api_identifier" {
  description = "API identifier/audience for the resource server (e.g., https://api.auth0-poc.com)"
  type        = string
  default     = "https://api.auth0-poc.com"
}

variable "console_app_urls" {
  description = "URLs for the multi-tenant console application"
  type = object({
    login_url = string
    callback_urls = list(string)
    logout_urls   = list(string)
    web_origins   = list(string)
  })
  default = {
    login_url = "https://auth0-poc-xi.vercel.app"
    callback_urls = [
      "http://localhost:5173/api/auth/callback",
      "https://auth0-poc-xi.vercel.app/api/auth/callback"
    ]
    logout_urls = [
      "http://localhost:5173",
      "https://auth0-poc-xi.vercel.app"
    ]
    web_origins = [
      "http://localhost:5173",
      "https://auth0-poc-xi.vercel.app"
    ]
  }
}

variable "internal_app_urls" {
  description = "URLs for the single-tenant internal application"
  type = object({
    login_url = string
    callback_urls = list(string)
    logout_urls   = list(string)
    web_origins   = list(string)
  })
  default = {
    login_url = "https://auth0-poc-internal.vercel.app"
    callback_urls = [
      "http://localhost:3001/api/auth/callback",
      "https://auth0-poc-internal.vercel.app/api/auth/callback"
    ]
    logout_urls = [
      "http://localhost:3001",
      "https://auth0-poc-internal.vercel.app"
    ]
    web_origins = [
      "http://localhost:3001",
      "https://auth0-poc-internal.vercel.app"
    ]
  }
}

variable "github_client_id" {
  description = "GitHub OAuth App Client ID"
  type        = string
  sensitive   = true
}

variable "github_client_secret" {
  description = "GitHub OAuth App Client Secret"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "organizations" {
  description = "Organizations to create"
  type = map(object({
    display_name = string
    branding = optional(object({
      logo_url = optional(string)
      colors = optional(object({
        primary         = optional(string)
        page_background = optional(string)
      }))
    }))
    metadata = optional(map(string))
  }))
  default = {
    org-01 = {
      display_name = "Leap Brain"
      branding = {
        colors = {
          primary         = "#4F46E5"
          page_background = "#FFFFFF"
        }
      }
      metadata = {
        tier = "enterprise"
      }
    }
    org-02 = {
      display_name = "Eddie's Big House of Fudge"
      branding = {
        colors = {
          primary         = "#7C3AED"
          page_background = "#FFFFFF"
        }
      }
      metadata = {
        tier = "business"
      }
    }
    org-03 = {
      display_name = "Grandma's Cheese Shed"
      branding = {
        colors = {
          primary         = "#7C3AED"
          page_background = "#FFFFFF"
        }
      }
      metadata = {
        tier = "business"
      }
    }
  }
}
