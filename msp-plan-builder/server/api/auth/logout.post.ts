import { clearSessionCookie } from '#/server/utils/authSession';

export default defineEventHandler((event) => {
	clearSessionCookie(event);
	return { ok: true };
});
