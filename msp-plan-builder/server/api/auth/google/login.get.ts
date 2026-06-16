import { randomUUID } from 'node:crypto';
import { setOAuthStateCookie, setReturnToCookie } from '#/server/utils/authSession';
import { getGoogleRedirectUri } from '#/server/utils/googleAuth';

export default defineEventHandler((event) => {
	const config = useRuntimeConfig(event);
	if (!config.googleClientId) {
		throw createError({ statusCode: 500, statusMessage: 'Google OAuth non configurato' });
	}

	const state = randomUUID();
	setOAuthStateCookie(event, state);
	const query = getQuery(event);
	const returnTo = typeof query.returnTo === 'string' ? query.returnTo : '/';
	setReturnToCookie(event, returnTo);
	const redirectUri = getGoogleRedirectUri(event);

	const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	url.searchParams.set('client_id', config.googleClientId);
	url.searchParams.set('redirect_uri', redirectUri);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'openid email profile');
	url.searchParams.set('state', state);
	url.searchParams.set('access_type', 'online');
	url.searchParams.set('prompt', 'select_account');

	sendRedirect(event, url.toString(), 302);
});
