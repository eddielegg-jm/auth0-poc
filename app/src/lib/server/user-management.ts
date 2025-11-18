import { auth0Config } from '$lib/config/auth0';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getManagementToken(): Promise<string> {
	if (accessToken && Date.now() < tokenExpiry) {
		return accessToken;
	}

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

export interface CreateUserParams {
	email: string;
	name: string;
	password?: string;
	organizationId: string;
	sendVerificationEmail?: boolean;
}

/**
 * Creates a new user in Auth0 and assigns them to an organization
 */
export async function createUser(params: CreateUserParams): Promise<{
	success: boolean;
	userId?: string;
	error?: string;
}> {
	try {
		// Create user in Auth0
		const user = await makeManagementRequest('users', {
			method: 'POST',
			body: JSON.stringify({
				email: params.email,
				name: params.name,
				password: params.password,
				connection: 'Username-Password-Authentication',
				email_verified: false,
				verify_email: params.sendVerificationEmail !== false
			})
		});

		// Add user to organization
		await makeManagementRequest(`organizations/${encodeURIComponent(params.organizationId)}/members`, {
			method: 'POST',
			body: JSON.stringify({
				members: [user.user_id]
			})
		});

		// Send password reset email if no password provided
		if (!params.password) {
			await makeManagementRequest('tickets/password-change', {
				method: 'POST',
				body: JSON.stringify({
					user_id: user.user_id,
					client_id: auth0Config.clientId,
					mark_email_as_verified: true,
					ttl_sec: 86400 // 24 hours
				})
			});
		}

		return { success: true, userId: user.user_id };
	} catch (error: any) {
		console.error('Error creating user:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Updates a user's organization membership
 */
export async function addUserToOrganization(
	userId: string,
	organizationId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await makeManagementRequest(`organizations/${encodeURIComponent(organizationId)}/members`, {
			method: 'POST',
			body: JSON.stringify({
				members: [userId]
			})
		});
		return { success: true };
	} catch (error: any) {
		console.error('Error adding user to organization:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Removes a user from an organization
 */
export async function removeUserFromOrganization(
	userId: string,
	organizationId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await makeManagementRequest(
			`organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(userId)}`,
			{
				method: 'DELETE'
			}
		);
		return { success: true };
	} catch (error: any) {
		console.error('Error removing user from organization:', error);
		return { success: false, error: error.message };
	}
}
