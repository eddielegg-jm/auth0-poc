# Auth0 Multi-Tenant POC - Quick Start Guide

## What You Have

A complete SvelteKit application demonstrating:
1. ✅ Email domain-based IDP selection
2. ✅ Auth0 Organizations for multi-tenancy
3. ✅ Secure OIDC authentication with PKCE
4. ✅ Dashboard showing user and organization info
5. ✅ Organization invitation functionality

## Next Steps

### 1. Configure Auth0

You need to set up the following in your Auth0 account:

#### A. Create a Regular Web Application
- Go to Applications → Create Application
- Select "Regular Web Applications"
- Configure:
  - Allowed Callback URLs: `http://localhost:5173/api/auth/callback`
  - Allowed Logout URLs: `http://localhost:5173`
  - Allowed Web Origins: `http://localhost:5173`

#### B. Set Up Organizations
- Go to Organizations
- Create at least one organization
- Note the Organization ID (starts with `org_`)
- Add connections (IDPs) to the organization

#### C. Configure Management API Access
- Go to APIs → Auth0 Management API
- Machine to Machine Applications tab
- Authorize your app with these scopes:
  - `read:organizations`
  - `read:organization_members`
  - `create:organization_invitations`
  - `read:users`

#### D. Set Up Identity Providers
- Go to Authentication → Social or Enterprise
- Configure Google, Microsoft, or other IDPs
- Enable email domain verification

### 2. Update Configuration Files

#### Update `.env`
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your Auth0 credentials.

#### Update Domain Mappings
Edit `src/lib/config/auth0.ts` to map your email domains to IDPs and organizations:

```typescript
export const emailDomainToConnection: Record<string, string> = {
  'yourcompany.com': 'google-oauth2',  // Replace with your domains
  'example.com': 'microsoft',
};

export const emailDomainToOrganization: Record<string, string> = {
  'yourcompany.com': 'org_xxxxxxxxxxxxx',  // Replace with your Org IDs
  'example.com': 'org_yyyyyyyyyyyyyyy',
};
```

### 3. Run the Application

```bash
# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm run dev
```

Visit `http://localhost:5173` and test the login flow!

### 4. Test the Features

#### Test Login Flow
1. Enter an email address with a configured domain
2. You should be redirected to the appropriate IDP
3. After authentication, you'll land on the dashboard

#### Test Organization Dashboard
1. View your user profile information
2. See all organizations you belong to
3. Check organization member counts

#### Test Invitations
1. Click "Invite Member" on an organization
2. Enter an email address
3. User should receive an invitation email from Auth0

## Troubleshooting

### TypeScript Errors on First Run
Run `pnpm run dev` once to generate SvelteKit types. The errors will disappear.

### Authentication Not Working
- Double-check callback URLs in Auth0 match exactly
- Verify all environment variables are set correctly
- Check browser console and terminal for error messages
- Review Auth0 logs in the dashboard

### Can't See Organizations
- Ensure your user is added to at least one organization in Auth0
- Check that Management API credentials are correct
- Verify the Management API has the required permissions

## Architecture Overview

```
Login Page (Email Input)
    ↓
Email Domain Detection
    ↓
Auth0 Authorization (with connection & organization)
    ↓
IDP Authentication (Google, Microsoft, etc.)
    ↓
OAuth Callback
    ↓
Token Exchange & User Info
    ↓
Session Creation
    ↓
Dashboard (User Info + Organizations)
    ↓
Invite Members
```

## File Structure Summary

- `src/lib/config/auth0.ts` - Auth0 configuration and domain mappings
- `src/lib/server/auth0.ts` - Auth0 Management API client
- `src/lib/server/auth-utils.ts` - Authentication utilities
- `src/lib/server/session.ts` - Session management
- `src/routes/+page.svelte` - Login page
- `src/routes/dashboard/+page.svelte` - Dashboard page
- `src/routes/api/auth/login/+server.ts` - Login endpoint
- `src/routes/api/auth/callback/+server.ts` - OAuth callback
- `src/routes/api/auth/logout/+server.ts` - Logout endpoint
- `src/routes/api/invite/+server.ts` - Invitation endpoint

## Need Help?

Check the full README.md for detailed documentation, security considerations, and production deployment guidelines.
