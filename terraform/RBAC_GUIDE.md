# Auth0 RBAC Implementation Guide

This document explains how your RBAC system is implemented in Auth0 and how to use it in your applications.

## 🏗️ Architecture Overview

### Components

1. **API Resource Server** (`auth0_resource_server.api`)
   - Represents your backend API
   - Defines all permissions as scopes
   - Identifier: `https://api.auth0-poc.com` (configured via `api_identifier` variable)

2. **Roles** (4 roles defined)
   - **Platform Admin**: Cross-organization, full platform access
   - **Organization Admin**: Full access within a specific organization
   - **Organization Member**: Standard access within an organization
   - **Organization Viewer**: Read-only access within an organization

3. **Permissions (Scopes)**: Action:Resource format
   - Platform: `manage:platform`, `read:organizations`, `write:organizations`, etc.
   - Organization: `read:org_users`, `write:org_settings`, etc.
   - Environment: `read:environments`, `deploy:environments`, etc.
   - Resources: `read:applications`, `write:configs`, etc.

## 📊 Permission Matrix

| Permission | Platform Admin | Org Admin | Org Member | Org Viewer |
|-----------|----------------|-----------|------------|------------|
| `manage:platform` | ✅ | ❌ | ❌ | ❌ |
| `read:organizations` | ✅ | ❌ | ❌ | ❌ |
| `write:organizations` | ✅ | ❌ | ❌ | ❌ |
| `delete:organizations` | ✅ | ❌ | ❌ | ❌ |
| `read:org_users` | ✅ | ✅ | ✅ | ✅ |
| `write:org_users` | ✅ | ✅ | ❌ | ❌ |
| `delete:org_users` | ✅ | ✅ | ❌ | ❌ |
| `read:org_settings` | ✅ | ✅ | ✅ | ✅ |
| `write:org_settings` | ✅ | ✅ | ❌ | ❌ |
| `read:environments` | ✅ | ✅ | ✅ | ✅ |
| `write:environments` | ✅ | ✅ | ❌ | ❌ |
| `delete:environments` | ✅ | ✅ | ❌ | ❌ |
| `deploy:environments` | ✅ | ✅ | ✅ | ❌ |
| `read:applications` | ✅ | ✅ | ✅ | ✅ |
| `write:applications` | ✅ | ✅ | ✅ | ❌ |
| `delete:applications` | ✅ | ✅ | ❌ | ❌ |
| `read:configs` | ✅ | ✅ | ✅ | ✅ |
| `write:configs` | ✅ | ✅ | ✅ | ❌ |

## 🔧 Implementation

### 1. Update Your Applications to Request API Access

In your login flow, include the API audience:

```typescript
// src/routes/api/auth/login/+server.ts
const params = new URLSearchParams({
  client_id: auth0Config.clientId,
  response_type: 'code',
  redirect_uri: auth0Config.callbackUrl,
  scope: 'openid profile email', // OIDC scopes
  audience: 'https://api.auth0-poc.com', // ← Add this!
  state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
  organization: organizationId
});
```

### 2. Assign Roles to Users

#### Via Auth0 Dashboard:
1. Go to **User Management** → **Users**
2. Select a user
3. Click **Roles** tab
4. Click **Assign Roles**
5. Select the role(s)

#### Via Terraform (for testing):
```hcl
# Assign platform admin role to a user
resource "auth0_user_roles" "platform_admin_assignment" {
  user_id = "auth0|123456789"
  roles   = [auth0_role.platform_admin.id]
}
```

#### Via Management API (programmatically):
```typescript
// In your console app
async function assignRoleToUser(userId: string, roleId: string, orgId: string) {
  await fetch(`https://${auth0Config.domain}/api/v2/organizations/${orgId}/members/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${managementToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roles: [roleId]
    })
  });
}
```

### 3. Access Token with Permissions

When you request a token with the audience parameter, Auth0 returns an access token containing the user's permissions:

```json
{
  "iss": "https://dev-57ctxx7z8j5mdir1.us.auth0.com/",
  "sub": "github|12345",
  "aud": "https://api.auth0-poc.com",
  "permissions": [
    "read:org_users",
    "write:org_settings",
    "read:environments",
    "deploy:environments"
  ],
  "org_id": "org_v5DsB07TH5m7Icci",
  "org_name": "Eddie's Big House of Fudge"
}
```

### 4. Backend Authorization

In your API backend, verify the access token and check permissions:

```typescript
// middleware/auth.ts
export function requirePermission(permission: string) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Verify JWT
    const decoded = await verifyToken(token);
    
    // Check permission
    if (!decoded.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Store in request context
    req.user = decoded;
    req.organization = decoded.org_id;
    
    next();
  };
}

// Usage in routes
app.get('/api/environments', 
  requirePermission('read:environments'),
  async (req, res) => {
    // User has read:environments permission
    const environments = await getEnvironments(req.organization);
    res.json(environments);
  }
);

app.post('/api/environments',
  requirePermission('write:environments'),
  async (req, res) => {
    // User has write:environments permission
    const env = await createEnvironment(req.organization, req.body);
    res.json(env);
  }
);
```

### 5. Frontend Permission Checks

Store permissions in your auth store:

```typescript
// src/lib/stores/auth.ts
interface User {
  sub: string;
  email: string;
  name: string;
  org_id: string;
  permissions: string[];
}

export function hasPermission(user: User | null, permission: string): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}
```

Use in components:

```svelte
<script lang="ts">
  import { hasPermission } from '$lib/stores/auth';
  export let data: PageData;
  
  $: canManageUsers = hasPermission(data.user, 'write:org_users');
  $: canDeploy = hasPermission(data.user, 'deploy:environments');
</script>

{#if canManageUsers}
  <button on:click={inviteUser}>Invite User</button>
{/if}

{#if canDeploy}
  <button on:click={deployToEnvironment}>Deploy</button>
{/if}
```

## 🎯 Environment-Level Scoping

Auth0 roles are organization-scoped by default. For environment-level permissions, you have two options:

### Option 1: Custom Claims (Recommended)

Add environment information to the token using Auth0 Actions:

```javascript
// Auth0 Action: Add Environment Context
exports.onExecutePostLogin = async (event, api) => {
  // Get user's environment assignments from your database
  const userEnvironments = await getUserEnvironments(event.user.user_id, event.organization.id);
  
  // Add to token
  if (event.authorization) {
    api.accessToken.setCustomClaim('environments', userEnvironments);
  }
};
```

Then in your backend:

```typescript
function requireEnvironmentAccess(environmentId: string) {
  return (req, res, next) => {
    const allowedEnvs = req.user.environments || [];
    
    if (!allowedEnvs.includes(environmentId)) {
      return res.status(403).json({ error: 'No access to this environment' });
    }
    
    next();
  };
}
```

### Option 2: User Metadata

Store environment assignments in `user_metadata`:

```typescript
// Update user metadata
await managementAPI.updateUser(userId, {
  user_metadata: {
    environments: {
      'org_123': ['env_prod', 'env_staging'],
      'org_456': ['env_dev']
    }
  }
});
```

Retrieve in your backend and check access based on metadata.

## 🔄 Role Management UI

Build role management into your console app:

```svelte
<!-- src/routes/dashboard/organization/[id]/members/+page.svelte -->
<script lang="ts">
  async function assignRole(userId: string, roleId: string) {
    await fetch('/api/organization/members/roles', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId, organizationId })
    });
  }
  
  async function removeRole(userId: string, roleId: string) {
    await fetch('/api/organization/members/roles', {
      method: 'DELETE',
      body: JSON.stringify({ userId, roleId, organizationId })
    });
  }
</script>

{#each members as member}
  <div class="member">
    <span>{member.name}</span>
    <select on:change={(e) => assignRole(member.id, e.target.value)}>
      <option value="">Select role...</option>
      <option value="{orgAdminRoleId}">Organization Admin</option>
      <option value="{orgMemberRoleId}">Organization Member</option>
      <option value="{orgViewerRoleId}">Organization Viewer</option>
    </select>
  </div>
{/each}
```

## 📝 Testing RBAC

After applying the Terraform configuration:

1. **Get role IDs:**
   ```bash
   terraform output roles
   ```

2. **Assign a role to yourself:**
   - Go to Auth0 Dashboard → Organizations → [Your Org] → Members
   - Find your user
   - Click "Assign Roles"
   - Select "Organization Admin"

3. **Test in your app:**
   ```bash
   # Update .env with API audience
   AUTH0_AUDIENCE=https://api.auth0-poc.com
   
   # Login and check token
   # Decode the access token at jwt.io
   # Verify "permissions" array is present
   ```

4. **Test API endpoints:**
   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     https://your-api.com/api/environments
   ```

## 🚀 Migration from App RBAC

To migrate from your current app-based RBAC:

1. **Map existing roles** to Auth0 roles (already done in Terraform)
2. **Export current role assignments** from your database
3. **Import into Auth0** via Management API:
   ```typescript
   for (const assignment of roleAssignments) {
     await assignRoleToOrgMember(
       assignment.organizationId,
       assignment.userId,
       getRoleId(assignment.roleName)
     );
   }
   ```
4. **Update applications** to use Auth0 permissions
5. **Remove app database** role tables once verified

## 📚 Additional Resources

- [Auth0 RBAC Documentation](https://auth0.com/docs/manage-users/access-control/rbac)
- [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations)
- [Custom Claims](https://auth0.com/docs/secure/tokens/json-web-tokens/create-custom-claims)
- [Auth0 Management API - Roles](https://auth0.com/docs/api/management/v2#!/Roles)
