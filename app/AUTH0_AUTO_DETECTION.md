# Auth0 Auto-Detection: How It Works

This POC relies on **Auth0's built-in auto-detection** capabilities rather than maintaining mappings in application code.

## 🎯 The Goal

Users should be able to log in with just their email, and Auth0 automatically:
1. Routes them to the correct Identity Provider (IDP)
2. Associates them with the correct Organization
3. No manual domain-to-organization mapping in code

## 🔧 How Auth0 Handles This

### Organization Detection

When you configure email domains in Auth0 Organizations:

```
Organization: Company One
├── Email Domains: company1.com
├── Connections: Google OAuth
└── Members: auto-assigned based on email domain
```

**What happens during login:**
1. User enters `user@company1.com`
2. Application passes `login_hint=user@company1.com` to Auth0
3. Auth0 sees `@company1.com` matches "Company One" organization
4. Auth0 automatically routes to that organization
5. User is assigned to that organization after authentication

### IDP Detection (Home Realm Discovery)

Auth0 can also auto-detect the IDP based on:

**Option 1: Organization Connections**
- Each organization has specific connections enabled
- Auth0 routes based on which organization was detected
- Example: Company One → Google OAuth only

**Option 2: Connection Domain Matching**
- Configure Google/Microsoft connections with specific domains
- Auth0 matches email domain to connection domain
- Example: `@company1.com` → Google OAuth

**Option 3: Universal Login Prompt**
- If multiple IDPs are available, show login page
- User selects their IDP manually

## ⚙️ Configuration in Auth0

### Step 1: Configure Organizations with Email Domains

In Auth0 Dashboard → Organizations → [Your Organization]:

1. Go to **Settings** tab
2. Find **Email Domains** section
3. Add domain(s): `company1.com`, `company2.com`, etc.
4. Enable **Auto-membership** (optional - automatically adds users to org)

### Step 2: Enable Organization Connections

In Auth0 Dashboard → Organizations → [Your Organization]:

1. Go to **Connections** tab
2. Enable the IDP connections this organization should use
3. Example: Enable "Google OAuth" for company using Google Workspace

### Step 3: Application Code

All the application needs to do:

```typescript
// Build authorization URL with just login_hint
const params = new URLSearchParams({
  client_id: auth0Config.clientId,
  response_type: 'code',
  redirect_uri: auth0Config.callbackUrl,
  scope: 'openid profile email',
  state: state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
  login_hint: email // Auth0 auto-detects everything from this!
});

const authorizationUrl = `https://${auth0Config.domain}/authorize?${params}`;
```

**That's it!** No `organization` parameter needed. No manual mapping needed.

## 🔍 What Auth0 Returns

After authentication, the ID token includes:

```json
{
  "sub": "google-oauth2|123456",
  "email": "user@company1.com",
  "name": "John Doe",
  "org_id": "org_abc123",        // ← Automatically set by Auth0
  "org_name": "Company One"       // ← Automatically set by Auth0
}
```

## 📊 Flow Diagram

```
User enters email
       ↓
Application → Auth0 /authorize?login_hint=user@company1.com
       ↓
Auth0 checks email domain
       ↓
    @company1.com matches "Company One" org
       ↓
Auth0 checks "Company One" enabled connections
       ↓
    Only Google OAuth enabled
       ↓
Auth0 → Google for authentication
       ↓
User authenticates with Google
       ↓
Auth0 ← Token from Google
       ↓
Auth0 adds user to "Company One" org
       ↓
Application ← Auth0 callback with org_id in token
```

## 🎨 Application Benefits

### Before (Manual Mapping)
```typescript
// ❌ Maintain in application code
const emailDomainToOrganization = {
  'company1.com': 'org_abc123',
  'company2.com': 'org_def456',
  'company3.com': 'org_ghi789'
};

const emailDomainToConnection = {
  'company1.com': 'google-oauth2',
  'company2.com': 'microsoft',
  'company3.com': 'okta'
};
```

### After (Auth0 Auto-Detection)
```typescript
// ✅ Just pass email to Auth0
const params = new URLSearchParams({
  // ... other OIDC params
  login_hint: email
});
```

## 🚀 Testing Auto-Detection

1. **Configure Organizations in Auth0:**
   - Organization 1: Email domain `company1.com`, Google OAuth connection
   - Organization 2: Email domain `company2.com`, Microsoft connection

2. **Test User 1:**
   - Enter `user@company1.com`
   - Should route to Google OAuth automatically
   - Should be assigned to Organization 1

3. **Test User 2:**
   - Enter `user@company2.com`
   - Should route to Microsoft OAuth automatically
   - Should be assigned to Organization 2

## 📝 Important Notes

### When Auto-Detection Works Best

✅ **Clear domain boundaries** - Each organization owns specific email domains  
✅ **Consistent IDP usage** - Each org uses one primary IDP  
✅ **Well-configured Auth0** - Email domains and connections properly set up

### When You Might Need Manual Mapping

❌ **Multiple orgs share domains** - e.g., `@gmail.com` users in different orgs  
❌ **Complex routing logic** - Business rules beyond email domain  
❌ **Legacy systems** - Existing custom authentication logic

### Fallback Option

The application still supports optional connection mapping in `src/lib/config/auth0.ts`:

```typescript
export const emailDomainToConnection: Record<string, string> = {
  // Leave empty for full Auth0 auto-detection
  // Or add explicit mappings if needed:
  // 'specialdomain.com': 'google-oauth2'
};
```

## 🔒 Security Considerations

✅ **Auth0 is source of truth** - Organization membership controlled by Auth0  
✅ **No hardcoded mappings** - Reduces code maintenance and security risks  
✅ **Centralized control** - All routing logic in Auth0 dashboard  
✅ **Audit trail** - Auth0 logs all organization assignments

## 📚 Auth0 Documentation

- [Organizations](https://auth0.com/docs/manage-users/organizations)
- [Organization Email Domains](https://auth0.com/docs/manage-users/organizations/configure-organizations/configure-email-domains)
- [Home Realm Discovery](https://auth0.com/docs/authenticate/login/auth0-universal-login/identifier-first)
- [Auto-membership](https://auth0.com/docs/manage-users/organizations/configure-organizations/enable-auto-membership)

---

**Bottom Line:** Let Auth0 do the work! Configure once in the dashboard, never touch application code for new organizations.
