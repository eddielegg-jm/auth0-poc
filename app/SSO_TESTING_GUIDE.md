# SSO Testing Guide

## What We Added

Visual indicators to show when SSO authentication is happening:

1. **Toast Notification**: A green notification that slides in from the right when SSO completes
2. **Enhanced SSO Badge**: The badge glows green and updates its text when SSO just completed
3. **URL Tracking**: Uses `?sso=true` parameter to detect SSO redirects (cleaned from URL after display)

## How SSO Works in This POC

When a user clicks a link to Internal App 1 or Internal App 2:

1. **Check Session**: Server checks if user has a valid session
2. **Redirect if Needed**: If no session, redirects to `/api/auth/login?returnTo=/internal-app-X&sso=true`
3. **Auth0 Check**: Auth0 checks if user has an active Auth0 session
4. **Silent SSO**: If Auth0 session exists, user is silently authenticated (no login screen!)
5. **Callback**: Auth0 redirects back with auth code
6. **Session Created**: Server creates app session and redirects to return URL with `?sso=true`
7. **Visual Feedback**: App displays notification and glowing badge

## Testing Steps

### Test 1: SSO from Main App to Internal Apps

1. **Login to main app** at `/dashboard`
2. **Click "Access CRM System"** link
3. **Watch for**:
   - Brief redirect to Auth0 (may be very fast!)
   - Green notification sliding in: "SSO Authentication Complete"
   - SSO badge glowing green with "Single Sign-On Completed"
   - Notification auto-dismisses after 5 seconds
4. **Repeat** by clicking "Access Analytics Platform"

### Test 2: Direct Access to Internal Apps (SSO)

1. **Login to main app** at `/dashboard`
2. **Open new tab** and go directly to `/internal-app-1`
3. **Should see**: Same SSO indicators appear
4. **Try** `/internal-app-2` in another new tab

### Test 3: SSO Between Internal Apps

1. **Access Internal App 1** (CRM System)
2. **Click "Analytics"** in the navigation
3. **Should see**: SSO notification appears in Internal App 2

### Test 4: No SSO (Fresh Login)

1. **Logout** from any app
2. **Close all browser tabs** with your app
3. **Open new incognito window**
4. **Go to** `/internal-app-1` directly
5. **Should see**: 
   - Full Auth0 login screen (because no session exists)
   - After login, you'll see the SSO notification (marking first authentication)

### Test 5: Session Expiry

1. **Login normally**
2. **Wait for session to expire** (or delete session cookie in dev tools)
3. **Try to access internal app**
4. **Should see**: Auth0 login screen → SSO notification after re-auth

## What You're Testing

### ✅ SSO is Working If:
- You DON'T see Auth0 login screen when moving between apps
- Redirect to Auth0 happens but returns immediately
- User info is consistent across all apps
- Logout from one app signs out of all apps

### ✅ Visual Indicators Working If:
- Green notification appears after authentication
- SSO badge glows and updates text
- Notification dismisses after 5 seconds or on click
- URL parameter `?sso=true` disappears (check URL bar)

### ❌ SSO is NOT Working If:
- You see Auth0 login screen every time you switch apps
- Have to enter credentials multiple times
- Different user info appears in different apps

## Technical Details

### How We Detect SSO

```typescript
// Server adds ?sso=true to return URL
throw redirect(303, `/api/auth/login?returnTo=${encodeURIComponent('/internal-app-1?sso=true')}`);

// Server checks for SSO parameter
const ssoIndicator = event.url.searchParams.get('sso');
return { user: session.user, ssoLogin: ssoIndicator === 'true' };

// Client shows notification if SSO
if (data.ssoLogin) {
  showSsoNotification = true;
  // Clean URL
  url.searchParams.delete('sso');
  window.history.replaceState({}, '', url);
}
```

### Auth0 SSO Flow

```
User → App (no session) 
     → /api/auth/login?returnTo=X&sso=true
     → Auth0 (checks for Auth0 session)
     → Silent authentication (if Auth0 session exists)
     → /api/auth/callback
     → Create app session
     → Redirect to returnTo URL
     → App shows SSO notification ✨
```

## Browser Console Checks

Open browser DevTools console and look for:

```
Login GET handler called
PKCE parameters generated, preparing redirect to Auth0
Redirecting to Auth0: https://...
Callback received from Auth0
Successfully exchanged code for tokens
User authenticated successfully
```

## What This Demonstrates

1. **Auth0 SSO**: Single authentication across multiple applications
2. **Session Management**: Shared Auth0 session, separate app sessions
3. **PKCE Flow**: Secure OAuth2 authentication
4. **UX Enhancement**: Visual feedback for technical process
5. **Seamless Experience**: No re-authentication needed when session exists
