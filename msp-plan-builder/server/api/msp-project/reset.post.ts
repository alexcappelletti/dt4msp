import { clearAllProjectsFromRedis } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const result = await clearAllProjectsFromRedis(event);
	return {
		ok: true,
		message: 'Progetti rimossi da Redis',
		...result,
	};
});
