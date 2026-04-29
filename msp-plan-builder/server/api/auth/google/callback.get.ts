import { popOAuthStateCookie, setSessionCookie } from '#/server/utils/authSession';

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
	const config = useRuntimeConfig(event);
	const query = getQuery(event);
	const code = typeof query.code === 'string' ? query.code : '';
	const state = typeof query.state === 'string' ? query.state : '';
	const cookieState = popOAuthStateCookie(event);

	if (!code || !state || !cookieState || state !== cookieState) {
		throw createError({ statusCode: 400, statusMessage: 'OAuth state non valido' });
	}

	if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
		throw createError({ statusCode: 500, statusMessage: 'Google OAuth non configurato' });
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

	setSessionCookie(
		event,
		{
			sub: userInfo.sub,
			email: userInfo.email,
			name: userInfo.name,
			picture: userInfo.picture,
		},
		config.authSecret,
	);

	sendRedirect(event, '/areas/1', 302);
});
