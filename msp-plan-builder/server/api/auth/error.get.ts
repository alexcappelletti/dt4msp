import { deleteCookie, getCookie } from 'h3';

const AUTH_ERROR_COOKIE = 'msp_auth_error';

export default defineEventHandler((event) => {
	const message = getCookie(event, AUTH_ERROR_COOKIE) || null;
	deleteCookie(event, AUTH_ERROR_COOKIE, { path: '/' });
	return { message };
});
