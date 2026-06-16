import { getRequestHeaders, type H3Event } from 'h3';

export function getRequestOrigin(event: H3Event): string {
	const headers = getRequestHeaders(event);
	const forwardedProto = String(headers['x-forwarded-proto'] || '').split(',')[0]?.trim();
	const forwardedHost = String(headers['x-forwarded-host'] || '').split(',')[0]?.trim();
	const host = forwardedHost || String(headers.host || '').trim();
	const proto = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

	if (!host) {
		throw new Error('Host richiesta non disponibile per costruire il redirect OAuth');
	}

	return `${proto}://${host}`;
}

export function getGoogleRedirectUri(event: H3Event): string {
	const config = useRuntimeConfig(event);
	const configuredRedirectUri = String(config.googleRedirectUri || '').trim();
	if (configuredRedirectUri) {
		return configuredRedirectUri;
	}

	return `${getRequestOrigin(event)}/api/auth/google/callback`;
}
