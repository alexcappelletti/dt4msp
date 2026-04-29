import { getSessionUser } from '#/server/utils/authSession';

export default defineEventHandler((event) => {
	const config = useRuntimeConfig(event);
	const user = getSessionUser(event, config.authSecret);
	return { authenticated: !!user, user };
});
