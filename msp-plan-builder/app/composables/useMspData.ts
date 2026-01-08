import { ref } from 'vue';
import type { Project, AreaOfInterest } from '#/shared/types/msp-project'; // Assicurati che il percorso sia corretto

export const useMspData = () => {
	const mockAreaOfInterest = ref<AreaOfInterest>({
		id: 'area-med',
		name: 'Mar Mediterraneo Occidentale',
		longName: 'Area di interesse per la pianificazione marina del Mediterraneo',
		description: 'Descrizione generale dell\'area di studio.',
		temporalScope: '2025-2035',
		others: new Map(),
		scenarios: [],
	});

	const mockProject = {
		id: 'prj-2026-001',
		title: 'Monitoraggio Costiero Adriatico',
		status: 'draft',
		updatedAt: new Date(),
		areaOfInterest: {
			id: 'area-med',
			name: 'Mar Mediterraneo Occidentale',
			longName: 'Area di interesse per la pianificazione marina del Mediterraneo',
			description: 'Descrizione generale dell\'area di studio.',
			temporalScope: '2025-2035',
			statements: [],
			others: new Map(),
			scenarios: [],
		} as AreaOfInterest
	} as Partial<Project>

	async fetchProject(projectPK: string): Promise<Project>{
		await Promise()

		return mockProject
	}
	return {
		mockArea: mockAreaOfInterest,
	};
};