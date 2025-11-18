# RBAC Implementation Guide

This POC demonstrates Role-Based Access Control (RBAC) at the application level, independent of Auth0's role system.

## Architecture Overview

The RBAC system is implemented entirely within the application:

- **Roles:** `admin`, `user`, `viewer`
- **Storage:** In-memory (for POC) - use database in production
- **Scope:** Per-organization roles (users can have different roles in different orgs)
- **Independence:** Not tied to Auth0 roles or permissions

## Role Hierarchy

```
admin
├── Full access to organization
├── Can invite/create users
├── Can manage organization settings
├── Can assign roles to other users
└── Access to admin console

user
├── Standard organization access
├── Can invite users (if permitted)
├── Can view organization data
└── Cannot manage settings

viewer
├── Read-only access
├── Cannot invite users
├── Cannot modify data
└── Cannot access admin features
```

## Implementation Files

### Core RBAC Module

**File:** `src/lib/rbac/roles.ts`

```typescript
export type Role = 'admin' | 'user' | 'viewer';

export interface UserRole {
  userId: string;
  email: string;
  organizationId: string;
  role: Role;
}

// In-memory storage (use database in production)
export const userRoles: UserRole[] = [];

export function getUserRole(userId: string, organizationId: string): Role | null {
  const userRole = userRoles.find(
    (r) => r.userId === userId && r.organizationId === organizationId
  );
  return userRole?.role || null;
}

export function hasRole(userId: string, organizationId: string, role: Role): boolean {
  const userRole = getUserRole(userId, organizationId);
  if (!userRole) return false;

  const hierarchy: Record<Role, number> = {
    admin: 3,
    user: 2,
    viewer: 1
  };

  return hierarchy[userRole] >= hierarchy[role];
}

export function isAdmin(userId: string, organizationId?: string): boolean {
  if (organizationId) {
    return getUserRole(userId, organizationId) === 'admin';
  }
  
  // Check if user is admin in ANY organization
  return userRoles.some((r) => r.userId === userId && r.role === 'admin');
}

export function canInviteUsers(userId: string, organizationId: string): boolean {
  return hasRole(userId, organizationId, 'user');
}

export function setUserRole(
  userId: string,
  email: string,
  organizationId: string,
  role: Role
): void {
  const existingIndex = userRoles.findIndex(
    (r) => r.userId === userId && r.organizationId === organizationId
  );

  const userRole: UserRole = {
    userId,
    email,
    organizationId,
    role
  };

  if (existingIndex >= 0) {
    userRoles[existingIndex] = userRole;
  } else {
    userRoles.push(userRole);
  }
}
```

## Usage Examples

### Protecting Routes

**Admin Console Protection:**

```typescript
// src/routes/admin/+page.server.ts
import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { isAdmin, userRoles } from '$lib/rbac/roles';

export const load: ServerLoad = async (event) => {
  const session = getSession(event);

  if (!session || !session.user) {
    throw redirect(303, '/');
  }

  // Check if user is admin in ANY organization
  if (!isAdmin(session.user.sub)) {
    throw redirect(303, '/dashboard');
  }

  return {
    user: session.user,
    userRoles,
    organizations: [] // Load user's organizations
  };
};
```

### Permission Checks in API Routes

**Invite API with RBAC:**

```typescript
// src/routes/api/invite/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { canInviteUsers } from '$lib/rbac/roles';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const session = getSession({ cookies });

  if (!session || !session.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, organizationId } = await request.json();

  // Check RBAC permission
  if (!canInviteUsers(session.user.sub, organizationId)) {
    return json(
      { error: 'You do not have permission to invite users to this organization' },
      { status: 403 }
    );
  }

  // Proceed with invitation...
};
```

### Conditional UI Elements

**Show/Hide Based on Permissions:**

```svelte
<script lang="ts">
  import { hasRole } from '$lib/rbac/roles';

  export let data;
  
  $: canManage = hasRole(data.user.sub, data.currentOrg.id, 'admin');
</script>

{#if canManage}
  <button on:click={openSettings}>
    Manage Organization
  </button>
{/if}
```

## Setting User Roles

### During User Creation

```typescript
// src/lib/server/user-management.ts
import { setUserRole } from '$lib/rbac/roles';

export async function createUser(params: CreateUserParams) {
  // Create user in Auth0...
  const user = await managementClient.users.create({...});
  
  // Assign default role
  setUserRole(user.user_id, user.email, params.organizationId, 'user');
  
  return user;
}
```

### Manual Role Assignment

```typescript
import { setUserRole } from '$lib/rbac/roles';

// Promote user to admin
setUserRole('auth0|123456', 'user@example.com', 'org_abc123', 'admin');

// Demote to viewer
setUserRole('auth0|123456', 'user@example.com', 'org_abc123', 'viewer');
```

## Production Implementation

### Database Schema

For production, replace in-memory storage with a database:

**PostgreSQL Example:**

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  organization_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_org_id ON user_roles(organization_id);
```

**Updated roles.ts:**

```typescript
import { db } from '$lib/server/database';

export async function getUserRole(userId: string, organizationId: string): Promise<Role | null> {
  const result = await db.query(
    'SELECT role FROM user_roles WHERE user_id = $1 AND organization_id = $2',
    [userId, organizationId]
  );
  
  return result.rows[0]?.role || null;
}

export async function setUserRole(
  userId: string,
  email: string,
  organizationId: string,
  role: Role
): Promise<void> {
  await db.query(
    `INSERT INTO user_roles (user_id, email, organization_id, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, organization_id)
     DO UPDATE SET role = $4, updated_at = CURRENT_TIMESTAMP`,
    [userId, email, organizationId, role]
  );
}
```

### Caching Strategy

For high-traffic applications, implement caching:

```typescript
import { LRUCache } from 'lru-cache';

const roleCache = new LRUCache<string, Role>({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
});

export async function getUserRole(userId: string, organizationId: string): Promise<Role | null> {
  const cacheKey = `${userId}:${organizationId}`;
  
  // Check cache first
  const cached = roleCache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from database
  const role = await fetchRoleFromDatabase(userId, organizationId);
  
  // Cache result
  if (role) roleCache.set(cacheKey, role);
  
  return role;
}
```

## Role Assignment UI

### Admin Console Role Management

```svelte
<!-- src/routes/admin/users/+page.svelte -->
<script lang="ts">
  async function updateUserRole(userId: string, orgId: string, newRole: Role) {
    const response = await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, organizationId: orgId, role: newRole })
    });
    
    if (response.ok) {
      // Refresh user list
    }
  }
</script>

<table>
  <thead>
    <tr>
      <th>User</th>
      <th>Email</th>
      <th>Role</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each users as user}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <select value={user.role} on:change={(e) => updateUserRole(user.id, orgId, e.target.value)}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </select>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
```

## Testing RBAC

### Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setUserRole, hasRole, isAdmin, canInviteUsers, userRoles } from './roles';

describe('RBAC', () => {
  beforeEach(() => {
    userRoles.length = 0; // Clear roles before each test
  });

  it('should assign and retrieve user roles', () => {
    setUserRole('user1', 'user@example.com', 'org1', 'admin');
    expect(hasRole('user1', 'org1', 'admin')).toBe(true);
  });

  it('should respect role hierarchy', () => {
    setUserRole('user1', 'user@example.com', 'org1', 'admin');
    expect(hasRole('user1', 'org1', 'user')).toBe(true);
    expect(hasRole('user1', 'org1', 'viewer')).toBe(true);
  });

  it('should check admin status correctly', () => {
    setUserRole('user1', 'admin@example.com', 'org1', 'admin');
    expect(isAdmin('user1', 'org1')).toBe(true);
    expect(isAdmin('user1', 'org2')).toBe(false);
  });

  it('should verify invite permissions', () => {
    setUserRole('user1', 'user@example.com', 'org1', 'viewer');
    expect(canInviteUsers('user1', 'org1')).toBe(false);
    
    setUserRole('user1', 'user@example.com', 'org1', 'user');
    expect(canInviteUsers('user1', 'org1')).toBe(true);
  });
});
```

## Security Considerations

### 1. Server-Side Enforcement

**Always check permissions on the server:**

```typescript
// ❌ BAD - Client-side only
if (isAdmin) {
  // Show admin UI
}

// ✅ GOOD - Server-side enforcement
export const load: ServerLoad = async ({ locals }) => {
  if (!isAdmin(locals.user.id)) {
    throw redirect(303, '/');
  }
};
```

### 2. Principle of Least Privilege

**Start with minimal permissions:**

```typescript
// Default new users to viewer
export async function createUser(params: CreateUserParams) {
  const user = await createAuth0User(params);
  setUserRole(user.user_id, user.email, params.organizationId, 'viewer');
  return user;
}
```

### 3. Audit Logging

**Track role changes:**

```typescript
export async function setUserRole(
  userId: string,
  email: string,
  organizationId: string,
  role: Role,
  changedBy: string
): Promise<void> {
  const oldRole = await getUserRole(userId, organizationId);
  
  // Update role...
  
  // Log the change
  await auditLog.create({
    action: 'ROLE_CHANGE',
    userId,
    organizationId,
    oldRole,
    newRole: role,
    changedBy,
    timestamp: new Date()
  });
}
```

## Why App-Level RBAC?

### Benefits Over Auth0 Roles

1. **Flexibility:** Easy to customize role hierarchy
2. **Performance:** No extra Auth0 API calls needed
3. **Multi-tenancy:** Per-organization roles without complex Auth0 setup
4. **Cost:** No additional Auth0 API requests
5. **Control:** Full ownership of role management logic

### When to Use Auth0 Roles Instead

- Single-tenant applications
- Need for Auth0 Rules/Actions based on roles
- Want centralized role management in Auth0 dashboard
- Using Auth0 Authorization Extension

## Next Steps

For a complete production RBAC implementation:

1. [ ] Migrate from in-memory to database storage
2. [ ] Implement role caching
3. [ ] Add audit logging
4. [ ] Create admin UI for role management
5. [ ] Write comprehensive tests
6. [ ] Add role-based API rate limiting
7. [ ] Implement role inheritance
8. [ ] Document permission matrix

## Resources

- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Auth0 Authorization Core Concepts](https://auth0.com/docs/manage-users/access-control)
- [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)
