import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Project } from "#/shared/types/msp-project";
import { useMspDataProvider } from "#/app/composables/useMspProvider";

export const useProjectStore = defineStore("project", () => {
	const mspProvider = useMspDataProvider();
	const currentProject = ref<Project | null>(null);
	const currentProjectId = ref<string | null>(null);
	const isProjectLoading = ref(false);
	const hasLoadedProject = ref(false);
	const projectError = ref<unknown>(null);
	const hasConflict = ref(false);
	const conflictMessage = ref<string | null>(null);
	const conflictMeta = ref<{ expectedUpdatedAt?: string; currentUpdatedAt?: string; projectId?: string } | null>(null);
	let projectLoadPromise: Promise<Project> | null = null;
	let projectLoadProjectId: string | null = null;

	const currentAreaOfInterest = computed(() => currentProject.value?.areaOfInterest ?? null);

	function setCurrentProject(project: Project | null) {
		currentProject.value = project;
		currentProjectId.value = project?.id ?? null;
		hasLoadedProject.value = !!project;
	}

	function clearCurrentProject() {
		currentProject.value = null;
		currentProjectId.value = null;
		hasLoadedProject.value = false;
		projectError.value = null;
		hasConflict.value = false;
		conflictMessage.value = null;
		conflictMeta.value = null;
		projectLoadProjectId = null;
		projectLoadPromise = null;
	}

	function clearConflict() {
		hasConflict.value = false;
		conflictMessage.value = null;
		conflictMeta.value = null;
	}

	function registerConflict(error: unknown): boolean {
		const e = error as any;
		const statusCode = Number(e?.statusCode || e?.data?.statusCode || 0);
		if (statusCode !== 409) return false;

		const data = (e?.data || {}) as { expectedUpdatedAt?: string; currentUpdatedAt?: string; projectId?: string };
		hasConflict.value = true;
		conflictMeta.value = {
			expectedUpdatedAt: data.expectedUpdatedAt,
			currentUpdatedAt: data.currentUpdatedAt,
			projectId: data.projectId,
		};
		conflictMessage.value = "Il progetto è stato aggiornato da un altro utente. Ricarica i dati prima di continuare.";
		return true;
	}

	function resolveProjectId(projectId?: string): string {
		return projectId?.trim() || currentProjectId.value || "prj-2026-001";
	}

	async function fetchProject(projectId?: string, options?: { force?: boolean }): Promise<Project> {
		const targetProjectId = resolveProjectId(projectId);
		const force = options?.force === true;

		if (!force && currentProject.value?.id === targetProjectId) {
			return currentProject.value;
		}

		if (!force && projectLoadPromise && projectLoadProjectId === targetProjectId) {
			return projectLoadPromise;
		}

		isProjectLoading.value = true;
		projectError.value = null;
		projectLoadProjectId = targetProjectId;

		projectLoadPromise = (async () => {
			try {
				const project = await mspProvider.fetchProject(targetProjectId);
				currentProject.value = project;
				currentProjectId.value = project.id;
				hasLoadedProject.value = true;
				return project;
			} catch (error) {
				projectError.value = error;
				throw error;
			} finally {
				isProjectLoading.value = false;
				projectLoadPromise = null;
				projectLoadProjectId = null;
			}
		})();

		return projectLoadPromise;
	}

	async function refreshProject(projectId?: string): Promise<Project> {
		return fetchProject(projectId, { force: true });
	}

	return {
		currentProject,
		currentProjectId,
		currentAreaOfInterest,
		isProjectLoading,
		hasLoadedProject,
		projectError,
		hasConflict,
		conflictMessage,
		conflictMeta,
		setCurrentProject,
		clearCurrentProject,
		clearConflict,
		registerConflict,
		fetchProject,
		refreshProject,
	};
});
