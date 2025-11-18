# Auth0 POC - What This Demonstrates

This is a focused demonstration of **Auth0's core capabilities** for multi-tenant OIDC authentication with SSO.

## Core Auth0 Features Demonstrated

### 1. **OIDC Authentication with PKCE** ✅
- Authorization Code Flow with Proof Key for Code Exchange
- Secure token exchange
- Session management with encrypted JWT cookies

**See:** `src/routes/api/auth/login/+server.ts` and `src/routes/api/auth/callback/+server.ts`

### 2. **Auth0 Organizations** ✅
- Multi-tenant architecture using Auth0's Organizations feature
- User membership across multiple organizations
- Organization-scoped authentication

**See:** `src/lib/server/auth0.ts` - `getUserOrganizations()` and `getOrganization()`

### 3. **Auth0 Home Realm Discovery** ✅
- Auth0 automatically detects the correct Identity Provider based on email domain
- Auth0 automatically detects the correct Organization based on email domain
- No manual domain-to-organization mapping needed in application code
- Configured entirely within Auth0 dashboard

**See:** `src/routes/api/auth/login/+server.ts` - Login flow with `login_hint` parameter

### 4. **Single Sign-On (SSO)** ✅
- Shared authentication across multiple applications
- Single login provides access to all internal apps
- Standalone app access with Auth0 redirects

**Try it:** Login → Dashboard → Navigate to Internal App 1 or Internal App 2 (no re-login required)

### 5. **Auth0 Management API** ✅
- Organization member management
- Cross-organization invitations
- Token caching and refresh

**See:** `src/lib/server/auth0.ts` - Management API integration

### 6. **Return URL Handling** ✅
- Deep linking to internal apps
- Auth0 redirects back to original destination after login
- Supports standalone internal app access

**Try it:** Navigate directly to `/internal-app-1` while logged out

## What's NOT in This POC

To keep this focused on Auth0, we've intentionally excluded:

- ❌ Application-level RBAC (use Auth0 Actions/Rules instead)
- ❌ User creation via Management API (use Auth0 Dashboard)
- ❌ Admin console (use Auth0 Dashboard)
- ❌ Custom domain configuration (out of scope for basic demo)
- ❌ Database operations (session stored in cookies only)

## Architecture

```
User Browser
    ↓
SvelteKit Application (Main App)
    ↓
Auth0 (OIDC Provider)
    ├── Organizations (Multi-tenancy)
    ├── Identity Providers (Google, Microsoft, etc.)
    └── Management API (Organization operations)
    
SvelteKit Apps (SSO)
    ├── Internal App 1 (CRM)
    └── Internal App 2 (Analytics)
```

## Key Files

### Authentication Flow
- `src/routes/api/auth/login/+server.ts` - Initiates OIDC flow with PKCE, uses `login_hint` for Auth0 auto-detection
- `src/routes/api/auth/callback/+server.ts` - Handles OAuth callback and token exchange
- `src/routes/api/auth/logout/+server.ts` - Clears session and logs out from Auth0

### Session Management
- `src/lib/server/session.ts` - JWT-based session with HTTP-only cookies

### Auth0 Integration
- `src/lib/server/auth0.ts` - Management API client for organization operations
- `src/lib/server/auth-utils.ts` - PKCE helper functions
- `src/lib/config/auth0.ts` - Auth0 configuration (optional IDP connection mapping)

### UI
- `src/routes/+page.svelte` - Login page
- `src/routes/dashboard/+page.svelte` - Main dashboard showing organizations
- `src/routes/internal-app-1/+page.svelte` - Internal app with SSO
- `src/routes/internal-app-2/+page.svelte` - Another internal app with SSO

## Testing the POC

### 1. Basic Authentication
1. Navigate to `http://localhost:5173`
2. Enter your email
3. Auth0 routes you to your IDP (Google, Microsoft, etc.)
4. After authentication, redirected to dashboard

### 2. Organizations
- Dashboard shows all organizations you're a member of
- Organization data comes from Auth0 (source of truth)

### 3. SSO
1. From dashboard, click on "Internal App 1 (CRM)"
2. You're automatically authenticated (no login prompt)
3. Navigate to "Internal App 2 (Analytics)"
4. Again, automatic authentication
5. Logout from any app logs you out of all apps

### 4. Standalone Access
1. Open new browser window
2. Navigate directly to `/internal-app-1`
3. Redirected to Auth0 for login
4. After authentication, redirected back to `/internal-app-1`

### 5. Invitations
1. From dashboard, click "Invite Member" on any organization
2. Enter email address
3. Auth0 sends invitation email
4. Invited user can accept and join organization

## Auth0 Configuration Required

See `AUTH0_CHECKLIST.md` for complete setup, but at minimum:

1. **Auth0 Application** (Regular Web App)
   - Domain, Client ID, Client Secret
   - Callback URLs configured
   
2. **Auth0 Organizations**
   - At least one organization created
   - Connections configured per organization
   
3. **Identity Providers**
   - Google, Microsoft, or other social/enterprise IDPs
   - Mapped to organizations

4. **Management API**
   - Machine-to-Machine application
   - Permissions: `read:organizations`, `read:organization_members`, `create:organization_invitations`

## Security Features

✅ PKCE protects against authorization code interception  
✅ HTTP-only cookies prevent XSS attacks  
✅ State parameter validates OAuth callbacks  
✅ JWT sessions are encrypted  
✅ Management API tokens are cached and auto-refreshed  
✅ Server-side validation of organization membership  

## Production Considerations

For production deployment:

1. **Environment Variables** - Store secrets in secure vault
2. **Custom Domains** - Use custom Auth0 domain for branding
3. **Rate Limiting** - Add rate limits to auth endpoints
4. **Monitoring** - Track auth success/failure rates
5. **Multiple Auth0 Clients** - Separate client per internal app (see `SSO_GUIDE.md`)
6. **Database** - Move from JWT sessions to database-backed sessions for revocation

## Summary

This POC demonstrates that Auth0 can handle:
- ✅ Multi-tenant authentication via Organizations
- ✅ Email domain-based IDP routing
- ✅ OIDC authentication with PKCE
- ✅ SSO across multiple applications
- ✅ Organization management via Management API
- ✅ Secure session handling

**The focus is Auth0's capabilities, not application-level features.**
