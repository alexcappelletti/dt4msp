import { createHmac } from 'node:crypto';
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3';

export interface AuthUser {
	sub: string;
	email: string;
	role?: 'admin' | 'editor' | 'viewer';
	name?: string;
	picture?: string;
}

const SESSION_COOKIE = 'msp_auth_session';
const OAUTH_STATE_COOKIE = 'msp_google_oauth_state';

function toBase64Url(input: string): string {
	return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
	return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(payload: string, secret: string): string {
	return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function encodeSession(user: AuthUser, secret: string): string {
	const payload = toBase64Url(JSON.stringify(user));
	const signature = signPayload(payload, secret);
	return `${payload}.${signature}`;
}

export function decodeSession(raw: string | undefined, secret: string): AuthUser | null {
	if (!raw) return null;
	const [payload, signature] = raw.split('.');
	if (!payload || !signature) return null;
	const expected = signPayload(payload, secret);
	if (signature !== expected) return null;
	try {
		return JSON.parse(fromBase64Url(payload)) as AuthUser;
	} catch {
		return null;
	}
}

export function setSessionCookie(event: H3Event, user: AuthUser, secret: string) {
	setCookie(event, SESSION_COOKIE, encodeSession(user, secret), {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});
}

export function clearSessionCookie(event: H3Event) {
	deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

export function getSessionUser(event: H3Event, secret: string): AuthUser | null {
	const raw = getCookie(event, SESSION_COOKIE);
	return decodeSession(raw, secret);
}

export function setOAuthStateCookie(event: H3Event, state: string) {
	setCookie(event, OAUTH_STATE_COOKIE, state, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 60 * 10,
	});
}

export function popOAuthStateCookie(event: H3Event): string | undefined {
	const state = getCookie(event, OAUTH_STATE_COOKIE);
	deleteCookie(event, OAUTH_STATE_COOKIE, { path: '/' });
	return state;
}
