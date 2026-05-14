import type { Theme } from '#/shared/types/msp-project';
import { getProjectFromMongo } from '#/server/utils/mspProjectMongo';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const projectId = typeof query.projectId === 'string' && query.projectId.trim()
		? query.projectId.trim()
		: 'prj-2026-001';

	const project = await getProjectFromMongo(event, projectId) 
	const uniqueById = new Map<string, Theme>();
	if (!project?.areaOfInterest?.definedThemes) return [];
	project.areaOfInterest.definedThemes.forEach(theme => uniqueById.set(theme.id, theme));
	return [...uniqueById.values()];
});
