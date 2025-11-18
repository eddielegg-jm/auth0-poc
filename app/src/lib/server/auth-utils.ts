import { emailDomainToConnection } from '$lib/config/auth0';

export function getEmailDomain(email: string): string {
	return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Get IDP connection for email domain (optional)
 * Returns undefined to let Auth0 use Home Realm Discovery
 */
export function getConnectionForEmail(email: string): string | undefined {
	const domain = getEmailDomain(email);
	return emailDomainToConnection[domain];
}

export function generateState(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateCodeVerifier(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...buffer));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
