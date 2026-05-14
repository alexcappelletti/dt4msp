import { deleteScenarioFromMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const expectedUpdatedAt = getHeader(event, 'x-project-updated-at') || null;
	const scenarioId = typeof query.id === 'string' ? query.id.trim() : '';
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';

	if (!scenarioId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro id mancante',
		});
	}

	const result = await deleteScenarioFromMongo(event, projectId, scenarioId, { expectedUpdatedAt });
	if (!result.deleted) {
		throw createError({
			statusCode: 404,
			statusMessage: `Scenario non trovato: ${scenarioId}`,
		});
	}

	return {
		ok: true,
		projectId,
		scenarioId,
		deleted: true,
	};
});
