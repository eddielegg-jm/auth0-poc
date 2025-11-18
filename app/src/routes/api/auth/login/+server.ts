import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { auth0Config } from '$lib/config/auth0';
import {
	generateState,
	generateCodeVerifier,
	generateCodeChallenge,
	getConnectionForEmail
} from '$lib/server/auth-utils';

/**
 * GET handler for direct login links (e.g., from internal apps)
 * Supports returnTo parameter to redirect after authentication
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	console.log('Login GET handler called');
	
	// Get return URL from query params (for standalone internal app access)
	const returnTo = url.searchParams.get('returnTo') || '/dashboard';
	const email = url.searchParams.get('email');

	// Generate PKCE parameters
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	
	console.log('PKCE parameters generated, preparing redirect to Auth0');

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

		// Optionally add connection if configured
		// Otherwise Auth0 will use Home Realm Discovery to auto-detect
		const connection = getConnectionForEmail(email);
		if (connection) {
			params.set('connection', connection);
		}

		// Let Auth0 automatically detect organization based on:
		// - Email domain
		// - Organization connections configuration
		// - Home Realm Discovery settings
	}

	const authorizationUrl = `https://${auth0Config.domain}/authorize?${params.toString()}`;

	console.log('Redirecting to Auth0:', authorizationUrl);
	throw redirect(302, authorizationUrl);
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

		// Optionally add connection if configured
		// Otherwise Auth0 will use Home Realm Discovery to auto-detect
		const connection = getConnectionForEmail(email);
		if (connection) {
			params.set('connection', connection);
		}

		// Auth0 automatically detects organization based on:
		// 1. Email domain configuration in Organization settings
		// 2. Organization Connections (which IDPs are linked to which orgs)
		// 3. Home Realm Discovery settings
		// No need to pass organization parameter explicitly

		const authorizationUrl = `https://${auth0Config.domain}/authorize?${params.toString()}`;

		return json({ authorizationUrl });
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Failed to initiate login' }, { status: 500 });
	}
};
