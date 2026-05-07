import { authorizeGoogleUser } from '#/server/utils/authz';
import { clearSessionCookie, getSessionUser } from '#/server/utils/authSession';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);
	const user = getSessionUser(event, config.authSecret);
	if (!user) {
		return { authenticated: false, user: null };
	}

	const authz = await authorizeGoogleUser(event, user.email);
	if (!authz.allowed) {
		clearSessionCookie(event);
		return { authenticated: false, user: null };
	}

	return {
		authenticated: true,
		user: {
			...user,
			role: authz.role,
		},
	};
});
