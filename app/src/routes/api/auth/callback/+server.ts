import { redirect, type RequestHandler } from '@sveltejs/kit';
import { auth0Config } from '$lib/config/auth0';
import { setSession } from '$lib/server/session';

export const GET: RequestHandler = async (event) => {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');

	// Handle errors from Auth0
	if (error) {
		console.error('Auth0 error:', error, errorDescription);
		throw redirect(303, `/?error=${encodeURIComponent(error)}`);
	}

	// Verify state
	const storedState = cookies.get('auth_state');
	if (!state || state !== storedState) {
		throw redirect(303, '/?error=invalid_state');
	}

	// Get code verifier
	const codeVerifier = cookies.get('auth_code_verifier');
	if (!code || !codeVerifier) {
		throw redirect(303, '/?error=missing_parameters');
	}

	try {
		// Exchange code for tokens
		const tokenResponse = await fetch(`https://${auth0Config.domain}/oauth/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: auth0Config.clientId,
				client_secret: auth0Config.clientSecret,
				code,
				code_verifier: codeVerifier,
				redirect_uri: auth0Config.callbackUrl
			})
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error('Token exchange error:', errorData);
			throw redirect(303, '/?error=token_exchange_failed');
		}

		const tokens = await tokenResponse.json();

		// Get user info
		const userInfoResponse = await fetch(`https://${auth0Config.domain}/userinfo`, {
			headers: {
				Authorization: `Bearer ${tokens.access_token}`
			}
		});

		if (!userInfoResponse.ok) {
			throw redirect(303, '/?error=userinfo_failed');
		}

		const userInfo = await userInfoResponse.json();

		// Store basic session (without org initially)
		setSession(event, {
			user: {
				sub: userInfo.sub,
				email: userInfo.email,
				name: userInfo.name,
				picture: userInfo.picture,
				org_id: userInfo.org_id, // May be undefined if no org in token
				org_name: userInfo.org_name
			},
			accessToken: tokens.access_token,
			idToken: tokens.id_token,
			expiresAt: Date.now() + tokens.expires_in * 1000
		});

		// Clear temporary cookies
		cookies.delete('auth_state', { path: '/' });
		cookies.delete('auth_code_verifier', { path: '/' });

		// Get return URL from cookie (set during login for internal app access)
		const returnTo = cookies.get('auth_return_to') || '/dashboard';
		console.log('returnTo from cookie in callback:', returnTo);
		cookies.delete('auth_return_to', { path: '/' });

		// If user logged in with an organization already, redirect directly
		if (userInfo.org_id) {
			console.log('User has org_id, redirecting to:', returnTo);
			throw redirect(303, returnTo);
		}

		// Otherwise, check which organizations the user belongs to
		// This will be handled by the dashboard or a dedicated org-selection page
		console.log('No org_id in token, redirecting to:', returnTo);
		throw redirect(303, returnTo);
	} catch (error) {
		// Re-throw redirects immediately without logging
		if (error instanceof Response && error.status >= 300 && error.status < 400) {
			throw error;
		}
		// Only log actual errors (not redirects)
		console.error('Callback error:', error);
		throw redirect(303, '/?error=authentication_failed');
	}
};
