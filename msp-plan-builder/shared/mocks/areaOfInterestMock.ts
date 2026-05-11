import {
	type AreaOfInterest,
	type Statement,
	
} from "#/shared/types/msp-project";
import { createScenarioMock } from "./scenarioMocks";
import { statementMocks } from "./statementMocks";
import { predefinedThemesMock } from "./themeMocks";


export const aoiMock: AreaOfInterest = {
	id: 'area-med',
	name: 'Mar Mediterraneo Occidentale',	
	longName: 'Area di interesse per la pianificazione marina del Mediterraneo',
	description: "Descrizione generale dell'area di studio.",
	temporalScope: '2025-2035',
	filterCQL: '',
	scenarios: [createScenarioMock('1'), createScenarioMock('2'), createScenarioMock('3')],
	statements: [...statementMocks] as Statement[],
	others: new Map<string, any>(),
	definedThemes: predefinedThemesMock,
	
};
