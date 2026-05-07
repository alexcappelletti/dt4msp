import type { Theme } from '#/shared/types/msp-project';
import { getProjectFromRedis } from '#/server/utils/mspProjectRedis';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';

	const project = await getProjectFromRedis(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];

	const allThemes = areaScenarios.flatMap((scenario) => scenario.availableThemes || []);
	const uniqueById = new Map<string, Theme>();
	for (const theme of allThemes) {
		if (!uniqueById.has(theme.id)) {
			uniqueById.set(theme.id, theme);
		}
	}

	return [...uniqueById.values()];
});
