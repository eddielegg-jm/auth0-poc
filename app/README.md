# Auth0 Multi-Tenant POC - SvelteKit Application

This is a proof of concept application demonstrating Auth0 integration with SvelteKit for OIDC authentication and multi-tenancy support.

## Features

This POC demonstrates core Auth0 capabilities:

### Authentication & Multi-Tenancy
✅ **OIDC Authentication with PKCE**: Secure authorization code flow with proof key for code exchange  
✅ **Email Domain-Based Routing**: Automatically routes users to their Identity Provider based on email domain  
✅ **Auth0 Organizations**: Multi-tenant architecture using Auth0's Organizations feature  
✅ **Secure Session Management**: JWT-based sessions with HTTP-only cookies

### Organization Management
✅ **Organization Dashboard**: View user profile and organization memberships (from Auth0 as source of truth)  
✅ **Cross-Organization Invitations**: Invite users to join organizations  
✅ **Management API Integration**: Demonstrates Auth0 Management API for organization operations

### Single Sign-On (SSO)
✅ **Shared Authentication**: Single login provides access to multiple applications  
✅ **Internal App 1 (CRM)**: Example internal application with SSO  
✅ **Internal App 2 (Analytics)**: Second internal application demonstrating SSO  
✅ **Standalone Access**: Internal apps can be accessed directly with Auth0 redirects  

## Prerequisites

- Node.js 18+ and pnpm
- An Auth0 account with:
  - A Regular Web Application configured
  - Auth0 Organizations set up
  - Auth0 Management API application for organization management
  - Identity Providers configured (Google, Microsoft, etc.)

## Auth0 Setup

### 1. Create a Regular Web Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications** → **Create Application**
3. Choose **Regular Web Applications** and give it a name
4. Note the **Domain**, **Client ID**, and **Client Secret**

### 2. Configure Application Settings

In your application settings:

- **Allowed Callback URLs**: `http://localhost:5173/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:5173`
- **Allowed Web Origins**: `http://localhost:5173`

### 3. Set Up Auth0 Organizations

1. Navigate to **Organizations** in the Auth0 Dashboard
2. Create organizations for your tenants (e.g., "Company 1", "Company 2")
3. Note the **Organization ID** for each
4. Configure organization connections (link to your IDPs)

### 4. Create a Management API Application

1. Go to **Applications** → **APIs** → **Auth0 Management API**
2. Go to **Machine to Machine Applications** tab
3. Authorize your application or create a new M2M application
4. Grant the following permissions:
   - `read:organizations`
   - `read:organization_members`
   - `create:organization_invitations`
   - `read:users`

### 5. Configure Identity Providers

1. Navigate to **Authentication** → **Social** (or **Enterprise**)
2. Set up your Identity Providers (Google, Microsoft, etc.)
3. Configure email domain verification for automatic routing

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:

Copy `.env.example` to `.env` and fill in your Auth0 credentials:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_CALLBACK_URL=http://localhost:5173/api/auth/callback
AUTH0_LOGOUT_URL=http://localhost:5173
AUTH0_AUDIENCE=your-api-identifier

# Auth0 Management API
AUTH0_MANAGEMENT_API_CLIENT_ID=your-management-client-id
AUTH0_MANAGEMENT_API_CLIENT_SECRET=your-management-client-secret

# Application Configuration
PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
PUBLIC_AUTH0_CLIENT_ID=your-client-id
PUBLIC_AUTH0_CALLBACK_URL=http://localhost:5173/api/auth/callback

# Session Secret (generate a random string)
SESSION_SECRET=your-random-secret-string-here
```

3. Update email domain mappings in `src/lib/config/auth0.ts`:

```typescript
export const emailDomainToConnection: Record<string, string> = {
  'company1.com': 'google-oauth2',
  'company2.com': 'microsoft',
  'company3.com': 'okta',
  // Add your domains here
};

export const emailDomainToOrganization: Record<string, string> = {
  'company1.com': 'org_xxxxxxxxxxxx',  // Your Auth0 Organization ID
  'company2.com': 'org_yyyyyyyyyyyy',
  'company3.com': 'org_zzzzzzzzzzzz',
  // Add your mappings here
};
```

## Running the Application

Start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

## Usage Flow

### 1. Login

1. Navigate to `http://localhost:5173`
2. Enter your email address
3. The application will automatically:
   - Detect your email domain
   - Route you to the appropriate IDP
   - Associate you with the correct organization

### 2. Dashboard

After successful authentication:
- View your user profile information
- See all organizations you belong to
- View organization member counts
- Access organization details

### 3. Invite Users

1. From the dashboard, click "Invite Member" on any organization card
2. Enter the email address of the user you want to invite
3. The user will receive an invitation email from Auth0
4. They can accept the invitation and join the organization

## Project Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── config/
│   │   │   └── auth0.ts              # Auth0 configuration
│   │   ├── server/
│   │   │   ├── auth0.ts              # Auth0 Management API client
│   │   │   ├── auth-utils.ts         # Authentication utilities
│   │   │   └── session.ts            # Session management
│   │   └── stores/
│   │       └── auth.ts               # Client-side auth store
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/+server.ts    # Login initiation
│   │   │   │   ├── callback/+server.ts # OAuth callback
│   │   │   │   └── logout/+server.ts   # Logout
│   │   │   └── invite/+server.ts        # Invitations
│   │   ├── dashboard/
│   │   │   ├── +page.svelte            # Dashboard UI
│   │   │   └── +page.server.ts         # Dashboard loader
│   │   ├── +page.svelte                # Login page
│   │   └── +page.server.ts             # Login loader
│   └── app.html
├── .env                                 # Environment variables
├── .env.example                         # Environment template
└── package.json
```

## Key Features Explained

### Email Domain-Based IDP Selection

The application uses email domains to automatically determine which Identity Provider to use:

1. User enters their email on the login page
2. The server extracts the domain (e.g., `user@company1.com` → `company1.com`)
3. Domain is matched to a configured IDP connection
4. Auth0 authorization URL is built with the appropriate connection parameter
5. User is redirected directly to their organization's IDP

### Organization Management

Auth0 Organizations provide built-in multi-tenancy:

- **Isolation**: Each organization has its own member list and settings
- **Branding**: Organizations can have custom logos and colors
- **Invitations**: Built-in invitation system with email templates
- **Metadata**: Store custom data per organization

### Session Management

Sessions are managed using JWT tokens stored in HTTP-only cookies:

- Tokens are encrypted with a secret key
- Contain user information and Auth0 tokens
- Automatically expire after 7 days
- Secure in production (HTTPS only)

## Security Considerations

- ✅ PKCE (Proof Key for Code Exchange) is used for the OAuth flow
- ✅ State parameter validates OAuth callbacks
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ Session tokens are encrypted
- ✅ Management API tokens are cached and auto-refreshed
- ✅ Server-side validation of organization membership for invitations

## Troubleshooting

### "Module has no exported member" errors

Run the dev server once to generate SvelteKit types:
```bash
pnpm run dev
```

### Authentication fails

1. Verify Auth0 callback URLs match exactly
2. Check that environment variables are set correctly
3. Ensure IDPs are properly configured in Auth0
4. Check browser console and server logs for errors

### Organization invitations fail

1. Verify Management API application has required permissions
2. Check that organization IDs are correct
3. Ensure the inviting user is a member of the organization
4. Review Auth0 logs in the dashboard

## Application Structure

```
src/
├── lib/
│   ├── config/
│   │   └── auth0.ts           # Auth0 configuration & domain mappings
│   ├── rbac/
│   │   └── roles.ts           # RBAC implementation
│   ├── server/
│   │   ├── auth0.ts           # Management API client
│   │   ├── auth-utils.ts      # Auth utilities
│   │   ├── session.ts         # Session management
│   │   └── user-management.ts # User creation & management
│   └── stores/
│       └── auth.ts            # Client-side auth store
├── routes/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── callback/      # OAuth callback handler
│   │   │   ├── login/         # Login initiation
│   │   │   └── logout/        # Logout handler
│   │   └── invite/            # User invitation API
│   ├── admin/                 # Admin console (RBAC protected)
│   ├── dashboard/             # Main dashboard
│   ├── internal-app-1/        # CRM System (SSO enabled)
│   └── internal-app-2/        # Analytics Platform (SSO enabled)
└── app.html                   # HTML template
```

## Documentation

- **[SETUP.md](./SETUP.md)** - Initial setup and configuration guide
- **[AUTH0_CHECKLIST.md](./AUTH0_CHECKLIST.md)** - Complete Auth0 configuration checklist
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - GitHub deployment and secrets management
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel-specific deployment guide
- **[SSO_GUIDE.md](./SSO_GUIDE.md)** - Single Sign-On implementation details
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Technical architecture overview

## Production Deployment

Before deploying to production:

1. Update callback URLs in Auth0 to match your production domain
2. Set `NODE_ENV=production`
3. Use a strong, random SESSION_SECRET
4. Enable HTTPS
5. Update CORS and cookie settings for your domain
6. Review and update rate limiting
7. Set up proper error logging and monitoring

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations)
- [OIDC Specification](https://openid.net/connect/)
