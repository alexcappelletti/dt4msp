import { defineStore } from "pinia";
import { ref } from "vue";
import type {
	Project,
	Scenario,
	Theme,
} from "#/shared/types/msp-project";
import { populateScenario } from "#/shared/types/msp-project";
import { generateUUID } from "#/shared/utils/generateUUID";
import { useMspDataProvider } from "#/app/composables/useMspProvider";

export const useScenarioStore = defineStore("scenario", () => {
	const { fetchAvailableThemes: fetchAvailableThemesFromApi } = useMspDataProvider();
	const availableThemes = ref<Theme[]>([]);
	const scenarios = ref<Scenario[]>([]);
	const selectedScenario = ref<Scenario | null>(null);
	const currentProject = ref<Project | null>(null);
	const isProjectLoading = ref(false);
	const hasLoadedProject = ref(false);
	let projectLoadPromise: Promise<Project | null> | null = null;

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
		await $fetch<Scenario>('/api/msp-project/scenario', {
			method: 'PUT',
			query: { projectId },
			body: scenario,
		});
		return scenario;
	}

	async function fetchAvailableThemes() {
		try {
			const themes = await fetchAvailableThemesFromApi();
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
		if (projectLoadPromise) {
			return projectLoadPromise;
		}
		isProjectLoading.value = true;
		projectLoadPromise = (async () => {
			try {
				const project = await $fetch<Project>('/api/msp-project/project', {
					method: 'GET',
					query: { projectId },
				});
				currentProject.value = project;
				const areaScenarios = project.areaOfInterest?.scenarios;
				scenarios.value = Array.isArray(areaScenarios)
					? areaScenarios
					: (Array.isArray(project.scenarios) ? project.scenarios : []);
				hasLoadedProject.value = true;
				return project;
			} finally {
				isProjectLoading.value = false;
				projectLoadPromise = null;
			}
		})();
		return projectLoadPromise;
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
