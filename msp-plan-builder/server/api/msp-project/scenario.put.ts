import type { Scenario } from '#/shared/types/msp-project';
import { getScenarioFromMongo, saveScenarioToMongo } from '#/server/utils/mspProjectMongo';
import { populateScenario } from '#/shared/types/msp-project';

export default defineEventHandler(async (event) => {
	const body = await readBody<Partial<Scenario>>(event);
	const query = getQuery(event);
	const expectedUpdatedAt = getHeader(event, 'x-project-updated-at') || null;
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';
	const scenarioId = (typeof body?.id === 'string' && body.id.trim())
		? body.id.trim()
		: (typeof query.id === 'string' ? query.id.trim() : '');

	if (!scenarioId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro id mancante',
		});
	}

	let current: Scenario | null = null;
	try {
		current = await getScenarioFromMongo(event, projectId, scenarioId);
	} catch (error: any) {
		if (error?.statusCode !== 404) {
			throw error;
		}
	}
	const next: Scenario = {
		...(current || populateScenario({ id: scenarioId })),
		...body,
		id: scenarioId,
	};

	return saveScenarioToMongo(event, projectId, next, { expectedUpdatedAt });
});
