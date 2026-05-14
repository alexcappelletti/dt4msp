import { listScenariosFromMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const includeFull = String(query.full || 'false').toLowerCase() === 'true';
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';
	const scenarios = await listScenariosFromMongo(event, projectId);

	if (includeFull) {
		return scenarios;
	}

	return scenarios.map((scenario) => ({
		id: scenario.id,
		name: scenario.name,
		generalDescription: scenario.generalDescription,
		temporalScope: scenario.temporalScope,
		objectives: scenario.objectives,
	}));
});
