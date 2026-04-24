import { defineStore } from "pinia";
import { ref } from "vue";
import type {
	Scenario,
	Theme,
} from "#/shared/types/msp-project";
import { populateScenario } from "#/shared/types/msp-project";
import { createScenarioMock } from "#/shared/mocks/scenarioMocks";
import { availableThemesMock } from "#/shared/mocks/mocked";
import { generateUUID } from "#/shared/utils/generateUUID";

export const useScenarioStore = defineStore("scenario", () => {
	const availableThemes = ref<Theme[]>([]);
	const scenarios = ref<Scenario[]>([]);
	const selectedScenario = ref<Scenario | null>(null);

	function ensureBaseScenarios() {
		if (scenarios.value.length > 0) return;
		scenarios.value = [
			createScenarioMock("1"),
			createScenarioMock("2"),
			createScenarioMock("3"),
		];
	}

	function createNewScenario(): Scenario {
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
				: availableThemesMock,
		});
		scenarios.value.unshift(scenario);
		selectedScenario.value = scenario;
		return scenario;
	}

	async function fetchAvailableThemes() {
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Qui dovresti chiamare il tuo servizio API reale o mock
			// Esempio ipotetico: const data = await $fetch('/api/themes');
			availableThemes.value = availableThemesMock
		} catch (error) {
			console.error("Errore nel caricamento dei temi:", error);
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
		await new Promise((resolve) => setTimeout(resolve, 500));
		ensureBaseScenarios();
		let scenario = scenarios.value.find((item) => item.id === id);
		if (!scenario) {
			scenario = createScenarioMock(id);
			scenarios.value.unshift(scenario);
		}
		selectedScenario.value = scenario;
	}

	ensureBaseScenarios();

	return {
		availableThemes, // Stato esposto
		scenarios,
		selectedScenario,
		setScenarioToEdit,
		updateSelectedScenario,
		clearSelectedScenario,
		fetchScenarioMock,
		fetchAvailableThemes, 
		createNewScenario,
		ensureBaseScenarios,
	};
});
