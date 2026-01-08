import type { AreaOfInterest, Project } from "#/shared/types/msp-project"; // Assicurati che il percorso sia corretto
import { ref } from "vue";

export const useMspDataProvider = () => {
	const mockAreaOfInterest = ref<AreaOfInterest>({
		id: "area-med",
		name: "Mar Mediterraneo Occidentale",
		longName:
			"Area di interesse per la pianificazione marina del Mediterraneo",
		description: "Descrizione generale dell'area di studio.",
		temporalScope: "2025-2035",
		others: new Map(),
		scenarios: [],
	});

	const mockProject = {
		id: "prj-2026-001",
		title: "Monitoraggio Costiero Adriatico",
		status: "draft",
		updatedAt: new Date(),
		areaOfInterest: {
			id: "area-med",
			name: "Mar Mediterraneo Occidentale",
			longName:
				"Area di interesse per la pianificazione marina del Mediterraneo",
			description: "Descrizione generale dell'area di studio.",
			temporalScope: "2025-2035",
			statements: [],
			others: new Map(),
			scenarios: [],
		} as AreaOfInterest,
	} as Partial<Project>;

	async function fetchProject(projectPK: string): Promise<Project> {
		await new Promise((resolve) => setTimeout(resolve, 50));
		return mockProject as Project;
	}


	const fetchScenario = async (id: string): Promise<Scenario | null> => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simula un ritardo di rete
		const mockTheme1 = populateTheme({
			id: "t1",
			name: "Biodiversità",
			indexName: "BIO",
		});
		const mockTheme2 = populateTheme({
			id: "t2",
			name: "Pesca",
			indexName: "FISH",
		});
		const mockScenario = populateScenario({
			id: id,
			name: `Scenario ${id} - Mediterraneo Occidentale`,
			generalDescription:
				"Descrizione generale di alto livello dello scenario.",
			narrative:
				"Una narrazione dettagliata che spiega il contesto temporale e spaziale.",
			temporalScope: "2025-2030",
			objectives:
				"Obiettivo principale: garantire sostenibilità ecologica.",
			availableThemes: [mockTheme1, mockTheme2],
		});

		return mockScenario;
	};

	// Puoi aggiungere fetchProject, updateScenario, etc. qui
	const updateScenario = async (scenario: Scenario) => {
		console.log("API: Salvataggio scenario in corso...", scenario.id);
		await new Promise((resolve) => setTimeout(resolve, 300));
		console.log("API: Salvataggio completato.");
	};


	return {
		mockAreaOfInterest,
		fetchProject,
		fetchScenario,
		updateScenario,
	};
};
