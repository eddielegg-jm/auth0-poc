// Simple in-app RBAC system (not Auth0-based)
// In production, this would be stored in a database

export type Role = 'admin' | 'user' | 'viewer';

export interface UserRole {
	userId: string;
	organizationId: string;
	role: Role;
}

// Hardcoded roles for POC - in production, store in database
const userRoles: UserRole[] = [
	// Example: Add your test users here
	// { userId: 'auth0|...', organizationId: 'org_...', role: 'admin' },
];

export function getUserRole(userId: string, organizationId: string): Role {
	const userRole = userRoles.find(
		(r) => r.userId === userId && r.organizationId === organizationId
	);
	return userRole?.role || 'viewer'; // Default to viewer
}

export function hasRole(userId: string, organizationId: string, requiredRole: Role): boolean {
	const userRole = getUserRole(userId, organizationId);
	const roleHierarchy: Record<Role, number> = {
		admin: 3,
		user: 2,
		viewer: 1
	};
	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(userId: string, organizationId: string): boolean {
	return hasRole(userId, organizationId, 'admin');
}

export function canInviteUsers(userId: string, organizationId: string): boolean {
	return hasRole(userId, organizationId, 'user');
}

export function setUserRole(userId: string, organizationId: string, role: Role): void {
	const existingIndex = userRoles.findIndex(
		(r) => r.userId === userId && r.organizationId === organizationId
	);
	
	if (existingIndex >= 0) {
		userRoles[existingIndex].role = role;
	} else {
		userRoles.push({ userId, organizationId, role });
	}
}

export function getAllUserRoles(userId: string): UserRole[] {
	return userRoles.filter((r) => r.userId === userId);
}
