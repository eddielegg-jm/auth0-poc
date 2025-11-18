import { json, type RequestHandler } from '@sveltejs/kit';
import { auth0Config } from '$lib/config/auth0';
import { generateState, generateCodeVerifier, generateCodeChallenge, getConnectionForEmail, getOrganizationForEmail } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email } = await request.json();

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
		const connection = getConnectionForEmail(email);
		if (connection) {
			params.set('connection', connection);
		}

		// Add organization if we can determine it from email domain
		const organization = getOrganizationForEmail(email);
		if (organization) {
			params.set('organization', organization);
		}

		const authorizationUrl = `https://${auth0Config.domain}/authorize?${params.toString()}`;

		return json({ authorizationUrl });
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Failed to initiate login' }, { status: 500 });
	}
};
