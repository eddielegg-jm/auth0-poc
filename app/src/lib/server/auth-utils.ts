import { env } from '$env/dynamic/private';

export function getEmailDomain(email: string): string {
	return email.split('@')[1]?.toLowerCase() || '';
}

export function getConnectionForEmail(email: string): string | undefined {
	const domain = getEmailDomain(email);
	
	// This would typically come from your Auth0 configuration
	// For now, we'll use a simple mapping
	const domainMappings: Record<string, string> = {
		'company1.com': 'google-oauth2',
		'company2.com': 'windowslive',
		'company3.com': 'okta'
	};
	
	return domainMappings[domain];
}

export function getOrganizationForEmail(email: string): string | undefined {
	const domain = getEmailDomain(email);
	
	// This would typically come from your database or Auth0 configuration
	const domainMappings: Record<string, string> = {
		'company1.com': 'org_company1',
		'company2.com': 'org_company2',
		'company3.com': 'org_company3'
	};
	
	return domainMappings[domain];
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
