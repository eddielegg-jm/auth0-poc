import { auth0Config } from '$lib/config/auth0';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getManagementToken(): Promise<string> {
	// Check if we have a valid cached token
	if (accessToken && Date.now() < tokenExpiry) {
		return accessToken;
	}

	// Get a new token
	const response = await fetch(`https://${auth0Config.domain}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: auth0Config.managementClientId,
			client_secret: auth0Config.managementClientSecret,
			audience: `https://${auth0Config.domain}/api/v2/`,
			grant_type: 'client_credentials'
		})
	});

	const data = await response.json();
	accessToken = data.access_token;
	// Set expiry to 5 minutes before actual expiry
	tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
	return accessToken as string;
}

async function makeManagementRequest(endpoint: string, options: RequestInit = {}) {
	const token = await getManagementToken();
	const response = await fetch(`https://${auth0Config.domain}/api/v2/${endpoint}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Auth0 API error: ${error}`);
	}

	return response.json();
}

export interface UserProfile {
	user_id: string;
	email: string;
	name: string;
	picture?: string;
	org_id?: string;
	org_name?: string;
}

export interface Organization {
	id: string;
	name: string;
	display_name: string;
	branding?: {
		logo_url?: string;
		colors?: Record<string, string>;
	};
	metadata?: Record<string, any>;
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
	try {
		const orgs = await makeManagementRequest(`users/${encodeURIComponent(userId)}/organizations`);
		return orgs;
	} catch (error) {
		console.error('Error fetching user organizations:', error);
		return [];
	}
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
	try {
		const org = await makeManagementRequest(`organizations/${encodeURIComponent(orgId)}`);
		return org;
	} catch (error) {
		console.error('Error fetching organization:', error);
		return null;
	}
}

export async function inviteUserToOrganization(
	orgId: string,
	inviterName: string,
	inviteeEmail: string,
	clientId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await makeManagementRequest(`organizations/${encodeURIComponent(orgId)}/invitations`, {
			method: 'POST',
			body: JSON.stringify({
				inviter: { name: inviterName },
				invitee: { email: inviteeEmail },
				client_id: clientId,
				send_invitation_email: true
			})
		});
		return { success: true };
	} catch (error: any) {
		console.error('Error inviting user to organization:', error);
		return { success: false, error: error.message };
	}
}

export async function getOrganizationMembers(orgId: string) {
	try {
		const members = await makeManagementRequest(`organizations/${encodeURIComponent(orgId)}/members`);
		return members;
	} catch (error) {
		console.error('Error fetching organization members:', error);
		return [];
	}
}
