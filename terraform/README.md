# Auth0 POC Terraform Configuration

This directory contains Terraform configuration to manage the Auth0 infrastructure for the POC project as code.

## Architecture Overview

This Terraform configuration creates:

- **2 Applications:**
  - `auth0-poc-console`: Multi-tenant console with organization selection
  - `auth0-poc-internal`: Single-tenant internal app (restricted to org-02)

- **3 Social Connections:**
  - GitHub OAuth
  - Google OAuth2
  - Username-Password-Authentication (Database)

- **2 Organizations:**
  - org-01: Organization 01
  - org-02: Organization 02 (for internal app)

- **Application Grants:**
  - Management API access for the console app (to manage invitations)

## Prerequisites

1. **Terraform installed** (v1.0+)
   ```bash
   brew install terraform
   ```

2. **Auth0 Account** with Management API access

3. **OAuth Provider Credentials:**
   - GitHub OAuth App
   - Google OAuth Client

## Setup Instructions

### 1. Create Management API Application

First, you need a Management API application for Terraform to use:

1. Go to **Auth0 Dashboard** → **Applications** → **Applications**
2. Click **Create Application**
3. Name: "Terraform Management"
4. Type: **Machine to Machine**
5. Authorize for **Auth0 Management API**
6. Grant ALL permissions (or at minimum):
   - `read:clients`, `create:clients`, `update:clients`, `delete:clients`
   - `read:connections`, `create:connections`, `update:connections`, `delete:connections`
   - `read:organizations`, `create:organizations`, `update:organizations`, `delete:organizations`
   - `read:organization_connections`, `create:organization_connections`, `update:organization_connections`, `delete:organization_connections`
   - `read:organization_clients`, `create:organization_clients`, `update:organization_clients`, `delete:organization_clients`
   - `read:client_grants`, `create:client_grants`, `update:client_grants`, `delete:client_grants`

### 2. Configure Variables

Copy the example tfvars file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your actual values:

```hcl
auth0_domain = "dev-57ctxx7z8j5mdir1.us.auth0.com"

auth0_management_client_id     = "from-step-1"
auth0_management_client_secret = "from-step-1"

github_client_id     = "your-github-oauth-app-client-id"
github_client_secret = "your-github-oauth-app-client-secret"

google_client_id     = "your-google-client-id.apps.googleusercontent.com"
google_client_secret = "your-google-client-secret"
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Review the Plan

See what Terraform will create:

```bash
terraform plan
```

### 5. Apply the Configuration

Create the resources:

```bash
terraform apply
```

Type `yes` when prompted.

### 6. Get Application Credentials

After applying, get the credentials for your apps:

```bash
# Console app credentials
terraform output -raw console_app_env_vars

# Internal app credentials
terraform output -raw internal_app_env_vars

# All organization IDs
terraform output organizations
```

### 7. Update Your .env Files

Copy the output from step 6 into your respective `.env` files:

**Console App** (`/Users/eddie.legg/Code/auth0-poc/app/.env`):
```bash
terraform output -raw console_app_env_vars > ../app/.env.terraform
# Review and merge with existing .env
```

**Internal App** (`/Users/eddie.legg/Code/auth0-internal-app/.env`):
```bash
terraform output -raw internal_app_env_vars > ../../auth0-internal-app/.env.terraform
# Review and merge with existing .env
```

## Managing Changes

### Modify Organizations

Edit the `organizations` variable in `terraform.tfvars`:

```hcl
organizations = {
  org-01 = {
    display_name = "Acme Corp"
    branding = {
      colors = {
        primary         = "#FF6B6B"
        page_background = "#FFFFFF"
      }
    }
    metadata = {
      tier     = "enterprise"
      industry = "technology"
    }
  }
  org-03 = {
    display_name = "New Organization"
    branding = {
      colors = {
        primary = "#10B981"
      }
    }
  }
}
```

Then apply:
```bash
terraform apply
```

### Update Application URLs

When deploying to new environments, update URLs in `terraform.tfvars`:

```hcl
console_app_urls = {
  callback_urls = [
    "http://localhost:5173/api/auth/callback",
    "https://auth0-poc.vercel.app/api/auth/callback",
    "https://auth0-poc-staging.vercel.app/api/auth/callback"
  ]
  # ... etc
}
```

### Add New Connections

Create a new connection resource in `connections.tf`:

```hcl
resource "auth0_connection" "microsoft" {
  name     = "windowslive"
  strategy = "windowslive"
  
  options {
    client_id     = var.microsoft_client_id
    client_secret = var.microsoft_client_secret
    scopes        = ["email", "profile"]
  }
  
  enabled_clients = [
    auth0_client.console_app.id,
    auth0_client.internal_app.id
  ]
}
```

## State Management

⚠️ **Important:** The Terraform state file (`terraform.tfstate`) contains sensitive information.

### For Teams:

Use remote state with Terraform Cloud or S3:

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "auth0-poc/terraform.tfstate"
    region = "us-east-1"
  }
}
```

Or Terraform Cloud:

```hcl
terraform {
  cloud {
    organization = "my-org"
    workspaces {
      name = "auth0-poc"
    }
  }
}
```

### For Solo Development:

Keep `terraform.tfstate` locally but **DO NOT** commit it to git (already in `.gitignore`).

## Importing Existing Resources

If you already have Auth0 resources configured manually, you can import them:

```bash
# Import existing console app
terraform import auth0_client.console_app YOUR_EXISTING_CLIENT_ID

# Import existing organization
terraform import 'auth0_organization.orgs["org-01"]' org_XXXXXXXXXXXXX

# Import existing connection
terraform import auth0_connection.github con_XXXXXXXXXXXXX
```

## Useful Commands

```bash
# Show current state
terraform show

# List all resources
terraform state list

# Show specific resource
terraform state show auth0_client.console_app

# Format code
terraform fmt

# Validate configuration
terraform validate

# Destroy all resources (careful!)
terraform destroy
```

## Troubleshooting

### Error: "Insufficient scopes"

Your management API application needs more permissions. Go to Auth0 Dashboard and add the required scopes.

### Error: "Connection already exists"

Either:
1. Import the existing connection: `terraform import auth0_connection.github con_XXXXX`
2. Or delete it manually and let Terraform recreate it

### Getting Org IDs After Creation

```bash
terraform output -json organizations | jq
```

## CI/CD Integration

### GitHub Actions Example:

```yaml
name: Terraform Apply

on:
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0
      
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
        env:
          TF_VAR_auth0_management_client_id: ${{ secrets.AUTH0_MANAGEMENT_CLIENT_ID }}
          TF_VAR_auth0_management_client_secret: ${{ secrets.AUTH0_MANAGEMENT_CLIENT_SECRET }}
      
      - name: Terraform Plan
        run: terraform plan
        working-directory: ./terraform
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
        working-directory: ./terraform
```

## Best Practices

1. **Never commit** `terraform.tfvars` or `*.tfstate` files
2. **Use remote state** for team collaboration
3. **Review plans** before applying changes
4. **Use workspaces** for multiple environments (dev, staging, prod)
5. **Tag resources** using metadata for better organization
6. **Document changes** in version control
7. **Test in dev** before applying to production

## Resources

- [Auth0 Terraform Provider Docs](https://registry.terraform.io/providers/auth0/auth0/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
