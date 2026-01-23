import type { AreaOfInterest, Project, Statement } from "#/shared/types/msp-project"; // Assicurati che il percorso sia corretto
import { furtherExampleStatements, availableThemesMock } from "#/shared/mocks/mocked";
import { ref } from "vue";


// Mock di un tema per popolare i sectorThemes degli statement settoriali


// Funzione helper se vuoi aggiungere velocemente uno statement vuoto
export function createEmptyStatement(): Statement {
	return {
		id: generateUUID(),
		shortName: "",
		longName: "",
		description: "",
		sectorThemes: []
	};
}




export const useMspDataProvider = () => {
	const mockAreaOfInterest = {
		id: "area-med",
		name: "Mar Mediterraneo Occidentale",
		longName:
			"Area di interesse per la pianificazione marina del Mediterraneo",
		description: "Descrizione generale dell'area di studio.",
		temporalScope: "2025-2035",
		others: new Map(),
		statements: furtherExampleStatements,
		scenarios: [],
	} as AreaOfInterest;

	const mockProject = {
		id: "prj-2026-001",
		title: "Monitoraggio Costiero Adriatico",
		status: "draft",
		updatedAt: new Date(),
		areaOfInterest: mockAreaOfInterest,
	} as Partial<Project>;

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
		id: "scen-001",
		name: `Scenario scen-001 - Mediterraneo Occidentale`,
		generalDescription:
			"Descrizione generale di alto livello dello scenario.",
		narrative:
			"Una narrazione dettagliata che spiega il contesto temporale e spaziale.",
		temporalScope: "2025-2030",
		objectives: "Obiettivo principale: garantire sostenibilità ecologica.",
		areaOfInterest: mockAreaOfInterest,
		spatialResources: ["ZEE", "Aree Marine Protette"],
		datasets: ["Dataset1", "Dataset2"],
		measures: [],
		availableThemes: [mockTheme1, mockTheme2],
	});



	async function fetchProject(projectPK: string): Promise<Project> {
		await new Promise((resolve) => setTimeout(resolve, 50));
		return mockProject as Project;
	}


	const fetchScenario = async (id: string): Promise<Scenario | null> => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simula un ritardo di rete
		return mockScenario;
	};
	const updateScenario = async (scenario: Scenario) => {
		console.log("API: Salvataggio scenario in corso...", scenario.id);
		await new Promise((resolve) => setTimeout(resolve, 300));
		console.log("API: Salvataggio completato.");
	};
	const updateArea = async (area: AreaOfInterest) => {
		const s = await fetchScenario("");
		if (s) {
			s.areaOfInterest = area;	
			console.log("API: Salvataggio area in corso...", s.areaOfInterest.id);
			await new Promise((resolve) => setTimeout(resolve, 300));
			console.log("API: Salvataggio area completato.");
		}
	}
	const fetchAvailableThemes = async (): Promise<Theme[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return availableThemesMock;
	}
	
	return {
		mockAreaOfInterest,
		fetchProject,
		fetchScenario,
		updateScenario,
		updateArea,
		fetchAvailableThemes
	};
};
