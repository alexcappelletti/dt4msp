import { clearAllProjectsFromMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const result = await clearAllProjectsFromMongo(event);
	return {
		ok: true,
		message: 'Progetti rimossi da MongoDB',
		...result,
	};
});
