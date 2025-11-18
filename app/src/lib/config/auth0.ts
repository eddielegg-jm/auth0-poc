import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const auth0Config = {
	domain: env.AUTH0_DOMAIN || '',
	clientId: env.AUTH0_CLIENT_ID || '',
	clientSecret: env.AUTH0_CLIENT_SECRET || '',
	callbackUrl: env.AUTH0_CALLBACK_URL || 'http://localhost:5173/api/auth/callback',
	audience: env.AUTH0_AUDIENCE || '',
	managementClientId: env.AUTH0_MANAGEMENT_API_CLIENT_ID || '',
	managementClientSecret: env.AUTH0_MANAGEMENT_API_CLIENT_SECRET || '',
	sessionSecret: env.SESSION_SECRET || 'your-session-secret-change-this',
	publicDomain: publicEnv.PUBLIC_AUTH0_DOMAIN || env.AUTH0_DOMAIN || '',
	publicClientId: publicEnv.PUBLIC_AUTH0_CLIENT_ID || env.AUTH0_CLIENT_ID || ''
};

// Email domain to IDP connection mapping (optional - Auth0 can auto-detect)
// If removed, Auth0 will use Home Realm Discovery to automatically route users
export const emailDomainToConnection: Record<string, string> = {
	// Example: 'company1.com': 'google-oauth2',
	// Leave empty to let Auth0 handle IDP detection automatically
};
