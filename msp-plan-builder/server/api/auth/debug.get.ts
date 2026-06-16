import { getCookie } from 'h3';
import { authorizeGoogleUser } from '#/server/utils/authz';
import { getSessionUser } from '#/server/utils/authSession';
import { getGoogleRedirectUri, getRequestOrigin } from '#/server/utils/googleAuth';

const SESSION_COOKIE = 'msp_auth_session';
const OAUTH_STATE_COOKIE = 'msp_google_oauth_state';
const AUTH_ERROR_COOKIE = 'msp_auth_error';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);
	const user = getSessionUser(event, config.authSecret);
	const authz = user ? await authorizeGoogleUser(event, user.email) : null;

	return {
		now: new Date().toISOString(),
		nodeEnv: process.env.NODE_ENV || null,
		requestOrigin: getRequestOrigin(event),
		resolvedGoogleRedirectUri: getGoogleRedirectUri(event),
		configuredGoogleRedirectUri: String(config.googleRedirectUri || '').trim() || null,
		hasGoogleClientId: Boolean(String(config.googleClientId || '').trim()),
		hasGoogleClientSecret: Boolean(String(config.googleClientSecret || '').trim()),
		hasAuthSecret: Boolean(String(config.authSecret || '').trim()),
		hasSessionCookie: Boolean(getCookie(event, SESSION_COOKIE)),
		hasOAuthStateCookie: Boolean(getCookie(event, OAUTH_STATE_COOKIE)),
		authErrorCookie: getCookie(event, AUTH_ERROR_COOKIE) || null,
		authenticated: Boolean(user),
		user,
		authorization: user
			? {
				allowed: authz?.allowed ?? false,
				role: authz?.role ?? null,
				reason: authz?.reason ?? null,
			}
			: null,
	};
});
