import { authorizeGoogleUser } from '#/server/utils/authz';
import { clearSessionCookie, getSessionUser } from '#/server/utils/authSession';

export default defineEventHandler(async (event) => {
	if (process.env.MSP_E2E_AUTH_BYPASS === 'true') {
		return {
			authenticated: true,
			user: {
				sub: 'e2e-user',
				email: 'e2e@test.local',
				role: 'admin',
				name: 'E2E Test User',
			},
		};
	}

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
