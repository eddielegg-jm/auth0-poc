import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { auth0Config } from '$lib/config/auth0';
import {
	generateState,
	generateCodeVerifier,
	generateCodeChallenge,
	getConnectionForEmail,
	getOrganizationForEmail
} from '$lib/server/auth-utils';

/**
 * GET handler for direct login links (e.g., from internal apps)
 * Supports returnTo parameter to redirect after authentication
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		// Get return URL from query params (for standalone internal app access)
		const returnTo = url.searchParams.get('returnTo') || '/dashboard';
		const email = url.searchParams.get('email');

		// Generate PKCE parameters
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const codeChallenge = await generateCodeChallenge(codeVerifier);

		// Store state, code verifier, and return URL in cookies
		cookies.set('auth_state', state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 10 // 10 minutes
		});

		cookies.set('auth_code_verifier', codeVerifier, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 10 // 10 minutes
		});

		cookies.set('auth_return_to', returnTo, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 10 // 10 minutes
		});

		// Build authorization URL
		const params = new URLSearchParams({
			client_id: auth0Config.clientId,
			response_type: 'code',
			redirect_uri: auth0Config.callbackUrl,
			scope: 'openid profile email',
			state,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256'
		});

		// Add login_hint if email provided
		if (email) {
			params.set('login_hint', email);

			// Add connection if we can determine it from email domain
			const connection = getConnectionForEmail(email);
			if (connection) {
				params.set('connection', connection);
			}

			// Add organization if we can determine it from email domain
			const organization = getOrganizationForEmail(email);
			if (organization) {
				params.set('organization', organization);
			}
		}

		const authorizationUrl = `https://${auth0Config.domain}/authorize?${params.toString()}`;

		throw redirect(302, authorizationUrl);
	} catch (error) {
		if (error instanceof Response) throw error;
		console.error('Login error:', error);
		throw redirect(302, '/?error=login_failed');
	}
};

/**
 * POST handler for JSON-based login (e.g., from client-side JavaScript)
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, returnTo } = await request.json();

		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Generate PKCE parameters
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const codeChallenge = await generateCodeChallenge(codeVerifier);

		// Store state and code verifier in cookies for verification later
		cookies.set('auth_state', state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 10 // 10 minutes
		});
		
		cookies.set('auth_code_verifier', codeVerifier, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 10 // 10 minutes
		});

		if (returnTo) {
			cookies.set('auth_return_to', returnTo, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 10 // 10 minutes
			});
		}

		// Build authorization URL
		const params = new URLSearchParams({
			client_id: auth0Config.clientId,
			response_type: 'code',
			redirect_uri: auth0Config.callbackUrl,
			scope: 'openid profile email',
			state,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
			login_hint: email
		});

		// Add connection if we can determine it from email domain
		// This is optional - Auth0 can auto-detect via Home Realm Discovery
		const connection = getConnectionForEmail(email);
		if (connection) {
			params.set('connection', connection);
		}

		// Add organization if we can determine it from email domain
		// This is optional - Auth0 can auto-route to organization
		// But explicitly setting it provides better UX and control
		const organization = getOrganizationForEmail(email);
		if (organization) {
			params.set('organization', organization);
		}
		
		// Note: If you want to let Auth0 auto-detect the organization entirely:
		// 1. Remove the organization lookup above
		// 2. Just pass login_hint with the email
		// 3. Auth0 will route based on Organization Connections and email domain
		// This works if you have Home Realm Discovery configured in Auth0

		const authorizationUrl = `https://${auth0Config.domain}/authorize?${params.toString()}`;

		return json({ authorizationUrl });
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Failed to initiate login' }, { status: 500 });
	}
};
