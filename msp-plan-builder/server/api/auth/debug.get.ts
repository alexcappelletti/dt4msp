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
	const envChecks = [
		{ key: 'AUTH_SECRET', defined: Boolean(String(config.authSecret || '').trim()), source: 'runtimeConfig.authSecret', required: true },
		{ key: 'GOOGLE_CLIENT_ID', defined: Boolean(String(config.googleClientId || '').trim()), source: 'runtimeConfig.googleClientId', required: true },
		{ key: 'GOOGLE_CLIENT_SECRET', defined: Boolean(String(config.googleClientSecret || '').trim()), source: 'runtimeConfig.googleClientSecret', required: true },
		{ key: 'GOOGLE_REDIRECT_URI', defined: Boolean(String(config.googleRedirectUri || '').trim()), source: 'runtimeConfig.googleRedirectUri', required: false },
		{ key: 'PERSISTENT_DB_URI', defined: Boolean(String(config.mongoUrl || '').trim()), source: 'runtimeConfig.mongoUrl', required: true },
		{ key: 'MONGO_DB_NAME', defined: Boolean(String(config.mongoDbName || '').trim()), source: 'runtimeConfig.mongoDbName', required: false },
		{ key: 'REDIS_URL', defined: Boolean(String(config.redisUrl || '').trim()), source: 'runtimeConfig.redisUrl', required: true },
		{ key: 'OWS_BASE_URL', defined: Boolean(String(config.owsBaseUrl || '').trim()), source: 'runtimeConfig.owsBaseUrl', required: true },
		{ key: 'OWS_TIMEOUT_MS', defined: Number.isFinite(config.owsTimeoutMs), source: 'runtimeConfig.owsTimeoutMs', required: false },
	] as const;

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
		envChecks,
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
