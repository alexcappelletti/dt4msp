import { buildMockProject } from '#/shared/mocks/projectMock';
import type { Project } from '#/shared/types/msp-project';



import { clearProjectFromMongo, saveProjectToMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);
	const mongoDbName = String((config as any).mongoDbName || "db_4msp").trim() || "db_4msp";
	const body = await readBody<{ projectId?: string; command?: 'clean' | 'fill' }>(event).catch(() => ({}));
	const command = body?.command === 'clean' ? 'clean' : 'fill';
	const projectId = typeof body?.projectId === 'string' && body.projectId.trim()
		? body.projectId.trim()
		: 'prj-2026-000';

	if (command === 'clean') {
		const result = await clearProjectFromMongo(event, projectId);
		return {
			ok: true,
			command,
			projectId,
			database: mongoDbName,
			message: 'Progetto rimosso da archivio',
			...result,
		};
	}

	const project: Project = buildMockProject(projectId);
	await saveProjectToMongo(event, project);
	
	return {
		ok: true,
		command,
		database: mongoDbName,
		projectId: project.id,
		projectSeededKey: `${projectId}:project`,
		areaEmbedded: project.areaOfInterest.id,
		scenariosSeeded: project.areaOfInterest.scenarios.length,
		predefinedThemesSeeded: project.areaOfInterest.definedThemes?.length ?? 0,
		message: 'Seed completato',
	};
});
