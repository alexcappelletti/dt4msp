import type { Project } from '#/shared/types/msp-project';
import {aoiMock} from './areaOfInterestMock';


export function buildMockProject(projectId = 'prj-2026-001'): Project {
	const baseArea = aoiMock;
	return  {
		id: projectId,
		name: 'Monitoraggio Costiero Adriatico',
		description: 'Progetto dimostrativo MSP su dati mock.',
		createdAt: new Date('2026-01-10T00:00:00.000Z'),
		updatedAt: new Date(),
		areaOfInterest: aoiMock,
		scenarios: [],
	} as Project;
}