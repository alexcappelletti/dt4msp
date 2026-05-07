import { buildMockProject } from '#/shared/mocks/projectMock';
import type { Project } from '#/shared/types/msp-project';



import { clearAllProjectsFromRedis, saveProjectToRedis } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const body = await readBody<{ projectId?: string; command?: 'clean' | 'fill' }>(event).catch(() => ({}));
	const command = body?.command === 'clean' ? 'clean' : 'fill';
	const projectId = typeof body?.projectId === 'string' && body.projectId.trim()
		? body.projectId.trim()
		: 'prj-2026-001';

	if (command === 'clean') {
		const result = await clearAllProjectsFromRedis(event);
		return {
			ok: true,
			command,
			message: 'Chiavi progetto rimosse da Redis',
			...result,
		};
	}

	const project: Project = buildMockProject(projectId);
	await saveProjectToRedis(event, project);
	
	return {
		ok: true,
		command,
		projectId: project.id,
		projectSeededKey: `${projectId}:project`,
		areaEmbedded: project.areaOfInterest.id,
		scenariosSeeded: project.areaOfInterest.scenarios.length,
		message: 'Seed completato',
	};
});
