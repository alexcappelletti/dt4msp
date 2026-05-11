import type { Project } from '#/shared/types/msp-project';
import { updateProjectWithLock } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const body = await readBody<Partial<Project>>(event);
	const query = getQuery(event);
	const expectedUpdatedAt = getHeader(event, 'x-project-updated-at') || null;
	const projectId = (typeof body?.id === 'string' && body.id.trim())
		? body.id.trim()
		: (typeof query.projectId === 'string' && query.projectId.trim() ? query.projectId.trim() : 'prj-2026-001');

	return updateProjectWithLock(event, projectId, { expectedUpdatedAt }, async (current) => {
		const next: Project = {
			...current,
			...body,
			id: current.id,
			updatedAt: new Date(),
		};
		return next;
	});
});
