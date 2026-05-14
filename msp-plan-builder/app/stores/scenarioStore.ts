import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
	Scenario,
	Theme,
} from "#/shared/types/msp-project";
import { populateScenario } from "#/shared/types/msp-project";
import { generateUUID } from "#/shared/utils/generateUUID";
import { useProjectStore } from "#/app/stores/projectStore";
import { useThemesStore } from "#/app/stores/themesStore";
import { useMspDataProvider } from "#/app/composables/useMspProvider";

export const useScenarioStore = defineStore("scenario", () => {
	const projectStore = useProjectStore();
	const themesStore = useThemesStore();
	const mspProvider = useMspDataProvider();
	const availableThemes = ref<Theme[]>([]);
	const scenarios = ref<Scenario[]>([]);
	const selectedScenario = ref<Scenario | null>(null);
	const currentProject = computed(() => projectStore.currentProject);
	const isProjectLoading = computed(() => projectStore.isProjectLoading);
	const hasLoadedProject = computed(() => projectStore.hasLoadedProject);

	function ensureBaseScenarios() {
		if (scenarios.value.length > 0) return;
		scenarios.value = [];
	}

	async function createNewScenario(): Promise<Scenario> {
		if (!currentProject.value) {
			await fetchProjectScenarios();
		}
		const projectId = currentProject.value?.id ?? 'prj-2026-001';
		const nextIndex = scenarios.value.length + 1;
		const scenario = populateScenario({
			id: generateUUID(),
			name: `Scenario ${nextIndex}`,
			generalDescription: "",
			narrative: "",
			temporalScope: "",
			objectives: "",
			availableThemes: availableThemes.value.length > 0
				? availableThemes.value
				: await fetchAvailableThemes(),
		});
		scenarios.value.unshift(scenario);
		selectedScenario.value = scenario;
		await mspProvider.updateScenario(scenario, projectId, currentProject.value?.updatedAt);
		await projectStore.refreshProject(projectId);
		return scenario;
	}

	async function fetchAvailableThemes() {
		try {
			const themes = await themesStore.fetchPredefinedThemes(currentProject.value?.id);
			availableThemes.value = themes;
			return themes;
		} catch (error) {
			console.error("Errore nel caricamento dei temi:", error);
			throw error;
		}
	}

	function setScenarioToEdit(scenario: Scenario) {
		selectedScenario.value = scenario;
	}

	function updateSelectedScenario(updatedData: Partial<Scenario>) {
		if (selectedScenario.value) {
			Object.assign(selectedScenario.value, updatedData);
		}
	}

	function clearSelectedScenario() {
		selectedScenario.value = null;
	}

	async function fetchScenarioMock(id: string) {
		const scenario = await $fetch<Scenario>('/api/msp-project/scenario', {
			method: 'GET',
			query: { id, projectId: currentProject.value?.id ?? 'prj-2026-001' },
		});
		selectedScenario.value = scenario;
		const index = scenarios.value.findIndex((item) => item.id === scenario.id);
		if (index >= 0) {
			scenarios.value[index] = scenario;
		} else {
			scenarios.value.unshift(scenario);
		}
	}

	async function fetchProjectScenarios(projectId = 'prj-2026-001') {
		const project = await projectStore.fetchProject(projectId);
		const areaScenarios = project.areaOfInterest?.scenarios;
		scenarios.value = Array.isArray(areaScenarios)
			? areaScenarios
			: (Array.isArray(project.scenarios) ? project.scenarios : []);
		return project;
	}

	ensureBaseScenarios();

	return {
		availableThemes, // Stato esposto
		scenarios,
		selectedScenario,
		currentProject,
		isProjectLoading,
		hasLoadedProject,
		setScenarioToEdit,
		updateSelectedScenario,
		clearSelectedScenario,
		fetchScenarioMock,
		fetchProjectScenarios,
		fetchAvailableThemes, 
		createNewScenario,
		ensureBaseScenarios,
	};
});
