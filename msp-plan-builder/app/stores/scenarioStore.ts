import { defineStore } from "pinia";
import { ref } from "vue";
import type {
	Scenario,
	Theme,
	Measure,
	Effect,
	MapLayer,
} from "#/shared/types/msp-project";
import { createScenarioMock } from "#/shared/mocks/scenarioMocks";
import { availableThemesMock } from "#/shared/mocks/mocked";

export const useScenarioStore = defineStore("scenario", () => {
	const availableThemes = ref<Theme[]>([]);
	const selectedScenario = ref<Scenario | null>(null);
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
		const mockScenario: Scenario = createScenarioMock(id);
		selectedScenario.value = mockScenario;
	}
	return {
		availableThemes, // Stato esposto
		selectedScenario,
		setScenarioToEdit,
		updateSelectedScenario,
		clearSelectedScenario,
		fetchScenarioMock,
		fetchAvailableThemes, 
	};
});
