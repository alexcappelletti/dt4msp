import { getProjectFromMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';

	return getProjectFromMongo(event, projectId);
});
