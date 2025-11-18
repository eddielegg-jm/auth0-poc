# Organization Selection Flow

This POC demonstrates Auth0's flexible organization detection and selection capabilities.

## 🎯 How It Works

### Scenario 1: User Belongs to One Organization
1. User visits homepage
2. Application detects no session → Auto-redirects to Auth0
3. User enters credentials on Auth0's page
4. Auth0 authenticates the user
5. Application fetches user's organizations from Auth0
6. **Auto-selects** the single organization
7. Updates session with organization context
8. User sees dashboard with organization details

### Scenario 2: User Belongs to Multiple Organizations
1. User visits homepage
2. Application detects no session → Auto-redirects to Auth0
3. User enters credentials on Auth0's page
4. Auth0 authenticates the user
5. Application fetches user's organizations from Auth0
6. **Shows organization selection UI**
7. User clicks on desired organization
8. Session updated with selected organization
9. Dashboard reloads with organization context

### Scenario 3: User Belongs to Zero Organizations
1. User visits homepage
2. Application detects no session → Auto-redirects to Auth0
3. User enters credentials on Auth0's page
4. Auth0 authenticates the user
5. Application fetches user's organizations (empty list)
6. Dashboard shows "not a member of any organizations"

## 🔧 Implementation Details

### Backend Logic (`/routes/dashboard/+page.server.ts`)

```typescript
// Fetch user's organizations from Auth0
const organizations = await getUserOrganizations(session.user.sub);

// Handle organization selection logic
if (!session.user.org_id && organizations.length > 0) {
  if (organizations.length === 1) {
    // Auto-select single organization
    setSession(event, {
      ...session,
      user: { ...session.user, org_id: org.id, org_name: org.name }
    });
    throw redirect(303, '/dashboard');
  } else {
    // Show selection UI for multiple organizations
    return { requiresOrgSelection: true, organizations };
  }
}
```

### Frontend UI (`/routes/dashboard/+page.svelte`)

When `requiresOrgSelection` is true, shows:
- Centered selection card
- List of organizations with logos
- Click handler to select organization
- API call to `/api/select-organization`
- Page refresh with organization context

### API Endpoint (`/routes/api/select-organization/+server.ts`)

```typescript
POST /api/select-organization
Body: { organizationId: string }

Responsibilities:
1. Verify user belongs to organization
2. Fetch organization details
3. Update session with org_id and org_name
4. Return success response
```

## 🎨 User Experience

### Login Flow (Automatic Redirect)
```
1. User visits homepage (/)
2. Application detects no valid session
3. Automatic redirect to Auth0 Universal Login
4. User enters credentials on Auth0's page
5. Auth0 authenticates (may auto-detect org via email domain)
6. Callback to /api/auth/callback
7. Redirect to /dashboard
8. Dashboard detects organization membership and handles selection
```

### Organization Selection (Multiple Orgs)
```
Dashboard loads → Detects multiple orgs → Shows selection screen

+------------------------------------------+
|     Select Your Organization             |
|  You belong to multiple organizations    |
|                                          |
|  ┌────────────────────────────────────┐ |
|  │  [Logo] Acme Corp        →         │ |
|  │         @acme                      │ |
|  └────────────────────────────────────┘ |
|                                          |
|  ┌────────────────────────────────────┐ |
|  │  [Logo] Widget Inc       →         │ |
|  │         @widget                    │ |
|  └────────────────────────────────────┘ |
+------------------------------------------+
```

### Auto-Selection (Single Org)
```
Dashboard loads → Detects one org → Auto-selects → Refreshes

User sees: "Welcome to Acme Corp Dashboard"
(No selection screen shown)
```

## 🔄 Session Management

### Initial Session (No Organization)
```json
{
  "user": {
    "sub": "auth0|123",
    "email": "user@company.com",
    "name": "John Doe",
    "org_id": undefined,  // No organization yet
    "org_name": undefined
  }
}
```

### After Organization Selection
```json
{
  "user": {
    "sub": "auth0|123",
    "email": "user@company.com",
    "name": "John Doe",
    "org_id": "org_abc123",      // ← Selected
    "org_name": "Acme Corp"       // ← Selected
  }
}
```

## 🔀 Alternative: Auth0's Built-in Organization Prompt

Auth0 also supports organization prompts at the authentication level:

### Enable in Auth0 Dashboard:
1. **Applications** → [Your App] → **Settings**
2. Set **Organization Usage**: "Required" or "Optional"
3. **Organizations** → **Settings** → **Login Flow**
4. Configure prompt behavior

### When to Use Each Approach:

**Application-Level Selection (This Implementation)**
- ✅ More control over UI/UX
- ✅ Can customize selection screen
- ✅ Can add additional logic (permissions, etc.)
- ✅ Better for complex multi-tenant scenarios

**Auth0 Built-in Prompt**
- ✅ Less code to maintain
- ✅ Consistent with Auth0 Universal Login
- ✅ Better for simple organization selection
- ✅ Handles edge cases automatically

## 🧪 Testing Scenarios

### Test 1: Single Organization Auto-Select
1. Create user with email `user@acme.com`
2. Create organization "Acme Corp" with domain `acme.com`
3. Enable auto-membership
4. Login as user
5. **Expected**: Dashboard loads directly with "Acme Corp" context

### Test 2: Multiple Organizations Selection
1. Create user `admin@example.com`
2. Manually add user to "Acme Corp" and "Widget Inc"
3. Login as user
4. **Expected**: Organization selection screen appears
5. Click "Widget Inc"
6. **Expected**: Dashboard loads with "Widget Inc" context

### Test 3: No Organizations
1. Create user `newuser@example.com`
2. Don't add to any organizations
3. Login as user
4. **Expected**: Dashboard shows "not a member of any organizations"

## 📋 Auth0 Configuration

For this flow to work optimally:

### Application Settings:
```
Organization Usage: "Optional"
← Allows users to login without specifying org
```

### Organization Settings:
```
Email Domains: configured per org
Auto-membership: Enabled (optional)
Connections: At least one IDP enabled
```

### For Auto-Detection:
```
When organization has:
- Email domain configured (e.g., acme.com)
- User email matches domain (user@acme.com)
- Auto-membership enabled

→ User automatically becomes member
→ org_id appears in ID token
→ Application detects and uses it
```

## 🚀 Benefits of This Approach

1. **Flexible**: Supports users in 0, 1, or multiple organizations
2. **User-Friendly**: Auto-selects when obvious, prompts when needed
3. **Scalable**: Works with Auth0's organization membership API
4. **Secure**: Verifies user belongs to organization before selection
5. **Seamless**: Minimal friction for single-org users
6. **Clear**: Explicit selection for multi-org users

## 🔧 Customization Options

You can customize:
- Organization selection UI (styling, layout)
- Auto-selection logic (add rules, conditions)
- Default organization (last used, primary flag, etc.)
- Selection persistence (remember choice)
- Organization switching (add switcher in navbar)
- Pre-selection based on context (subdomain, referrer, etc.)
