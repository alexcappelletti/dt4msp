import type { AreaOfInterest, Project, Scenario, Theme } from '#/shared/types/msp-project';

const PROJECT_SYNC_CHANNEL = "msp-project-sync";
const PROJECT_SYNC_STORAGE_KEY = "msp:project-sync";
const PROJECT_VERSION_HEADER = "x-project-updated-at";

export const useMspDataProvider = () => {
	const logApiError = (operation: string, error: unknown, context?: Record<string, unknown>) => {
		const e = error as any;
		console.error(`[MSP API] ${operation} failed`, {
			statusCode: e?.statusCode,
			statusMessage: e?.statusMessage,
			message: e?.message,
			data: e?.data,
			...context,
		});
	};

	const notifyProjectMutation = (projectId: string) => {
		if (!import.meta.client) return;
		const payload = JSON.stringify({
			type: "project-mutated",
			projectId,
			at: Date.now(),
		});
		try {
			const channel = new BroadcastChannel(PROJECT_SYNC_CHANNEL);
			channel.postMessage({ type: "project-mutated", projectId, at: Date.now() });
			channel.close();
		} catch {}
		try {
			localStorage.setItem(PROJECT_SYNC_STORAGE_KEY, payload);
		} catch {}
	};


	const getVersionHeaders = (expectedUpdatedAt?: string | Date | null) => {
		if (!expectedUpdatedAt) return undefined;
		const value = expectedUpdatedAt instanceof Date
			? expectedUpdatedAt.toISOString()
			: String(expectedUpdatedAt).trim();
		if (!value) return undefined;
		return { [PROJECT_VERSION_HEADER]: value };
	};

	const fetchProject = async (projectId: string): Promise<Project> => {
		try {
			return await $fetch<Project>('/api/msp-project/project', {
				method: 'GET',
				query: { projectId },
			});
		} catch (error) {
			logApiError('fetchProject', error, { endpoint: '/api/msp-project/project', method: 'GET', projectId });
			throw error;
		}
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

	const updateScenario = async (
		scenario: Scenario,
		projectId = 'prj-2026-001',
		expectedUpdatedAt?: string | Date | null,
	): Promise<Scenario> => {
		try {
			const updated = await $fetch<Scenario>('/api/msp-project/scenario', {
				method: 'PUT',
				query: { projectId },
				headers: getVersionHeaders(expectedUpdatedAt),
				body: scenario,
			});
			notifyProjectMutation(projectId);
			return updated;
		} catch (error) {
			logApiError('updateScenario', error, { endpoint: '/api/msp-project/scenario', method: 'PUT', projectId, scenarioId: scenario?.id });
			throw error;
		}
	};

	const deleteScenario = async (
		id: string,
		projectId = 'prj-2026-001',
		expectedUpdatedAt?: string | Date | null,
	): Promise<{ ok: boolean; deleted: boolean; scenarioId: string; projectId: string }> => {
		try {
			const result = await $fetch('/api/msp-project/scenario', {
				method: 'DELETE',
				query: { id, projectId },
				headers: getVersionHeaders(expectedUpdatedAt),
			});
			notifyProjectMutation(projectId);
			return result;
		} catch (error) {
			logApiError('deleteScenario', error, { endpoint: '/api/msp-project/scenario', method: 'DELETE', projectId, scenarioId: id });
			throw error;
		}
	};

	const updateArea = async (
		area: AreaOfInterest,
		projectId = 'prj-2026-001',
		expectedUpdatedAt?: string | Date | null,
	): Promise<Project> => {
		try {
			const updated = await $fetch<Project>('/api/msp-project/project', {
				method: 'PUT',
				query: { projectId },
				headers: getVersionHeaders(expectedUpdatedAt),
				body: {
					areaOfInterest: area,
				},
			});
			notifyProjectMutation(projectId);
			return updated;
		} catch (error) {
			logApiError('updateArea', error, { endpoint: '/api/msp-project/project', method: 'PUT', projectId, areaId: area?.id });
			throw error;
		}
	};


	return {
		fetchProject,
		fetchScenario,
		updateScenario,
		deleteScenario,
		updateArea,
		
	};
};
