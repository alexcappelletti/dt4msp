import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Project } from "#/shared/types/msp-project";
import { useMspDataProvider } from "#/app/composables/useMspProvider";

const PROJECT_SYNC_CHANNEL = "msp-project-sync";
const PROJECT_SYNC_STORAGE_KEY = "msp:project-sync";

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
	const hasRemoteUpdateNotice = ref(false);
	const remoteUpdateMessage = ref<string | null>(null);
	let projectLoadPromise: Promise<Project> | null = null;
	let projectLoadProjectId: string | null = null;
	let syncStarted = false;
	let syncChannel: BroadcastChannel | null = null;

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
		hasRemoteUpdateNotice.value = false;
		remoteUpdateMessage.value = null;
		projectLoadProjectId = null;
		projectLoadPromise = null;
	}

	function clearConflict() {
		hasConflict.value = false;
		conflictMessage.value = null;
		conflictMeta.value = null;
	}

	function clearRemoteUpdateNotice() {
		hasRemoteUpdateNotice.value = false;
		remoteUpdateMessage.value = null;
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

	async function handleRemoteProjectMutation(projectId?: string) {
		const targetProjectId = resolveProjectId(projectId);
		if (currentProjectId.value && currentProjectId.value !== targetProjectId) {
			return;
		}
		hasRemoteUpdateNotice.value = true;
		remoteUpdateMessage.value = "Aggiornamento remoto rilevato. I dati del progetto sono stati ricaricati.";
		await refreshProject(targetProjectId);
	}

	function startProjectSync() {
		if (syncStarted || !import.meta.client) return;
		syncStarted = true;

		try {
			syncChannel = new BroadcastChannel(PROJECT_SYNC_CHANNEL);
			syncChannel.onmessage = async (event) => {
				const data = event?.data as { type?: string; projectId?: string } | undefined;
				if (data?.type !== "project-mutated") return;
				await handleRemoteProjectMutation(data.projectId);
			};
		} catch {}

		window.addEventListener("storage", async (event) => {
			if (event.key !== PROJECT_SYNC_STORAGE_KEY || !event.newValue) return;
			try {
				const data = JSON.parse(event.newValue) as { type?: string; projectId?: string };
				if (data?.type !== "project-mutated") return;
				await handleRemoteProjectMutation(data.projectId);
			} catch {}
		});
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
		hasRemoteUpdateNotice,
		remoteUpdateMessage,
		setCurrentProject,
		clearCurrentProject,
		clearConflict,
		clearRemoteUpdateNotice,
		registerConflict,
		fetchProject,
		refreshProject,
		startProjectSync,
	};
});
