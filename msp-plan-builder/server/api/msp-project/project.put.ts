import type { Project } from '#/shared/types/msp-project';
import { getProjectFromRedis, saveProjectToRedis } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const body = await readBody<Partial<Project>>(event);
	const query = getQuery(event);
	const projectId = (typeof body?.id === 'string' && body.id.trim())
		? body.id.trim()
		: (typeof query.projectId === 'string' && query.projectId.trim() ? query.projectId.trim() : 'prj-2026-001');

	const current = await getProjectFromRedis(event, projectId);
	const next: Project = {
		...current,
		...body,
		id: current.id,
		updatedAt: new Date(),
	};

	return saveProjectToRedis(event, next);
});

