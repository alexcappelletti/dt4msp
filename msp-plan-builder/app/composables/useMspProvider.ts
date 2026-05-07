import type { AreaOfInterest, Project, Scenario, Theme } from '#/shared/types/msp-project';

export const useMspDataProvider = () => {
	const fetchProject = async (projectId: string): Promise<Project> => {
		return $fetch<Project>('/api/msp-project/project', {
			method: 'GET',
			query: { projectId },
		});
	};

	const fetchScenario = async (id: string, projectId = 'prj-2026-001'): Promise<Scenario | null> => {
		try {
			return await $fetch<Scenario>('/api/msp-project/scenario', {
				method: 'GET',
				query: { id, projectId },
			});
		} catch {
			return null;
		}
	};

	const updateScenario = async (scenario: Scenario, projectId = 'prj-2026-001'): Promise<Scenario> => {
		return $fetch<Scenario>('/api/msp-project/scenario', {
			method: 'PUT',
			query: { projectId },
			body: scenario,
		});
	};

	const deleteScenario = async (id: string, projectId = 'prj-2026-001'): Promise<{ ok: boolean; deleted: boolean; scenarioId: string; projectId: string }> => {
		return $fetch('/api/msp-project/scenario', {
			method: 'DELETE',
			query: { id, projectId },
		});
	};

	const updateArea = async (area: AreaOfInterest, projectId = 'prj-2026-001'): Promise<Project> => {
		return $fetch<Project>('/api/msp-project/project', {
			method: 'PUT',
			query: { projectId },
			body: {
				areaOfInterest: area,
			},
		});
	};

	const fetchAvailableThemes = async (): Promise<Theme[]> => {
		return $fetch<Theme[]>('/api/msp-project/themes', {
			method: 'GET',
			query: { projectId: 'prj-2026-001' },
		});
	};

	return {
		fetchProject,
		fetchScenario,
		updateScenario,
		deleteScenario,
		updateArea,
		fetchAvailableThemes,
	};
};
