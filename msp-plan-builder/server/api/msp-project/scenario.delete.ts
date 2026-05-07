import { deleteScenarioFromRedis } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
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

	const result = await deleteScenarioFromRedis(event, projectId, scenarioId);
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
