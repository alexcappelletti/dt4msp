import { popOAuthStateCookie, setSessionCookie } from '#/server/utils/authSession';
import { authorizeGoogleUser } from '#/server/utils/authz';
import { setCookie } from 'h3';

interface GoogleTokenResponse {
	access_token: string;
	id_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
}

interface GoogleUserInfo {
	sub: string;
	email: string;
	name?: string;
	picture?: string;
}

export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig(event);
		const query = getQuery(event);
		const code = typeof query.code === 'string' ? query.code : '';
		const state = typeof query.state === 'string' ? query.state : '';
		const cookieState = popOAuthStateCookie(event);

		if (!code || !state || !cookieState || state !== cookieState) {
			throw new Error('OAuth state non valido');
		}

		if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
			throw new Error('Google OAuth non configurato');
		}

		const tokenRes = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: config.googleClientId,
				client_secret: config.googleClientSecret,
				redirect_uri: config.googleRedirectUri,
				grant_type: 'authorization_code',
			}).toString(),
		});

		const userInfo = await $fetch<GoogleUserInfo>('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokenRes.access_token}`,
			},
		});

		const authz = await authorizeGoogleUser(event, userInfo.email);
		if (!authz.allowed) {
			throw new Error(authz.reason || `Utente non autorizzato: ${userInfo.email}`);
		}

		setSessionCookie(
			event,
			{
				sub: userInfo.sub,
				email: userInfo.email,
				role: authz.role,
				name: userInfo.name,
				picture: userInfo.picture,
			},
			config.authSecret,
		);

		return sendRedirect(event, '/areas', 302);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		console.error('[AUTH][GOOGLE_CALLBACK] Login failed:', message);
		setCookie(event, 'msp_auth_error', message, {
			httpOnly: false,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60,
		});
		return sendRedirect(event, '/', 302);
	}
});
