# SSO Implementation Guide

This POC demonstrates Single Sign-On (SSO) across multiple internal applications using Auth0.

## Architecture Overview

The POC includes three application areas:

1. **Main Application** (`/dashboard`) - Primary authentication point
2. **Internal App 1** (`/internal-app-1`) - CRM System with SSO
3. **Internal App 2** (`/internal-app-2`) - Analytics Platform with SSO

All three share the same Auth0 session, enabling seamless navigation without repeated logins.

## How SSO Works in This POC

### Current Implementation (Single Auth0 Client)

In this POC, all applications use the same Auth0 application client:
- Users log in once via the main application
- Session is stored in an HTTP-only cookie
- Internal apps check for the session cookie
- If session exists, user is automatically authenticated
- Logout from any app terminates the session globally

### Production Implementation (Multiple Auth0 Clients)

For production, each internal app should be configured as a separate Auth0 application:

```
Main App (Client 1)
├── Domain: dev-57ctxx7z8j5mdir1.us.auth0.com
├── Client ID: EuJHc5oLY9zjntNQs6OAvSoUJDH5oh3F
└── Callback URL: https://yourapp.com/api/auth/callback

Internal App 1 (Client 2)
├── Domain: dev-57ctxx7z8j5mdir1.us.auth0.com (same)
├── Client ID: [new-client-id]
└── Callback URL: https://yourapp.com/internal-app-1/callback

Internal App 2 (Client 3)
├── Domain: dev-57ctxx7z8j5mdir1.us.auth0.com (same)
├── Client ID: [new-client-id]
└── Callback URL: https://yourapp.com/internal-app-2/callback
```

## Setting Up Production SSO

### Step 1: Create Additional Auth0 Applications

1. Go to Auth0 Dashboard → Applications
2. Click "Create Application"
3. Choose "Regular Web Application"
4. Configure for each internal app:
   - Name: "Internal App 1 - CRM"
   - Application Type: Regular Web Application
   - Token Endpoint Authentication Method: POST

### Step 2: Configure Application Settings

For each application:

**Allowed Callback URLs:**
```
https://yourapp.com/internal-app-1/api/auth/callback
http://localhost:5173/internal-app-1/api/auth/callback
```

**Allowed Logout URLs:**
```
https://yourapp.com
http://localhost:5173
```

**Allowed Web Origins:**
```
https://yourapp.com
http://localhost:5173
```

### Step 3: Enable SSO in Auth0

1. Go to Tenant Settings → Advanced
2. Enable "Skip consent for verifiable first-party clients"
3. This allows seamless SSO between your applications

### Step 4: Implement Silent Authentication

Update each internal app's login route to support `prompt=none`:

```typescript
// src/routes/internal-app-1/api/auth/login/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth0Config } from '$lib/config/auth0';

export const GET: RequestHandler = async ({ url }) => {
  const authUrl = new URL(`https://${auth0Config.domain}/authorize`);
  
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', 'INTERNAL_APP_1_CLIENT_ID');
  authUrl.searchParams.set('redirect_uri', `${url.origin}/internal-app-1/api/auth/callback`);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('prompt', 'none'); // Silent authentication
  
  throw redirect(302, authUrl.toString());
};
```

### Step 5: Handle Silent Auth Errors

When `prompt=none` is used, Auth0 returns an error if no session exists:

```typescript
// src/routes/internal-app-1/api/auth/callback/+server.ts
export const GET: RequestHandler = async ({ url }) => {
  const error = url.searchParams.get('error');
  
  if (error === 'login_required') {
    // No session exists, redirect to main app login
    throw redirect(302, '/api/auth/login');
  }
  
  // Handle successful callback...
};
```

## Session Management

### Current Session Storage

The POC uses JWT-based sessions stored in HTTP-only cookies:

```typescript
// src/lib/server/session.ts
export async function setSession(cookies: Cookies, session: SessionData) {
  const encrypted = await encryptSession(session);
  
  cookies.set('auth_session', encrypted, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}
```

### Production Considerations

For production SSO across subdomains:

```typescript
cookies.set('auth_session', encrypted, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  domain: '.yourapp.com', // Share across subdomains
  maxAge: 60 * 60 * 24 * 7,
  path: '/'
});
```

## Testing SSO Flow

1. **Login to Main App:**
   - Navigate to `/`
   - Click "Sign In"
   - Complete Auth0 login

2. **Access Internal App 1:**
   - From dashboard, click "CRM System"
   - Should automatically authenticate without login prompt

3. **Access Internal App 2:**
   - From any page, navigate to "Analytics Platform"
   - Should automatically authenticate without login prompt

4. **Test Logout:**
   - Click "Sign Out" from any application
   - Verify all apps require re-authentication

## Benefits of This Architecture

### User Experience
- ✅ Single login for all applications
- ✅ Seamless navigation between apps
- ✅ Consistent authentication state
- ✅ Single logout across all apps

### Security
- ✅ Centralized authentication in Auth0
- ✅ No credentials stored in applications
- ✅ Secure HTTP-only cookies
- ✅ HTTPS enforced in production

### Management
- ✅ Single user directory
- ✅ Centralized access control
- ✅ Unified audit logs
- ✅ Easy to add new applications

## Troubleshooting

### SSO Not Working

**Symptom:** Users prompted to login again in internal apps

**Solutions:**
1. Verify `domain` setting in cookie matches your setup
2. Check cookie `secure` flag (must be true in production)
3. Ensure `sameSite` is set to `lax` or `none`
4. Verify Auth0 tenant has SSO enabled

### Session Expires Too Quickly

**Symptom:** Users logged out unexpectedly

**Solutions:**
1. Increase session `maxAge` in cookie settings
2. Configure Auth0 session lifetime in tenant settings
3. Implement token refresh logic

### CORS Errors

**Symptom:** API calls from internal apps fail

**Solutions:**
1. Add internal app URLs to "Allowed Web Origins" in Auth0
2. Configure CORS headers in SvelteKit:

```typescript
// svelte.config.js
const config = {
  kit: {
    adapter: adapter(),
    csrf: {
      checkOrigin: true
    }
  }
};
```

## Next Steps

For a complete production SSO implementation:

1. [ ] Create separate Auth0 applications for each internal app
2. [ ] Implement proper callback handlers with `prompt=none`
3. [ ] Add token refresh logic
4. [ ] Configure session persistence
5. [ ] Set up monitoring and logging
6. [ ] Test cross-browser compatibility
7. [ ] Implement session timeout warnings
8. [ ] Add "Remember Me" functionality

## Resources

- [Auth0 SSO Documentation](https://auth0.com/docs/authenticate/single-sign-on)
- [Silent Authentication Guide](https://auth0.com/docs/authenticate/login/configure-silent-authentication)
- [Cookie Security Best Practices](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)
