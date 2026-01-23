// ~/shared/mocks/scenarioMocks.ts
import type { Scenario, Feedback, Statement, Measure, Effect } from "#/shared/types/msp-project";
import { populateScenario, populateStatement } from "#/shared/types/msp-project";
import { availableThemesMock } from "./mocked";


/**
 * Mocks di Feedback per gli esempi.
 */
const mockFeedbacks: Feedback[] = [
	{ id: 'f1', 
		author: 'user1', 
		comment: 'Ottima proposta, ma serve più dettaglio sulla pesca.', 
		rating: 4, 
		createdAt: new Date(2025, 0, 15),
	status: 'new' },
	{ id: 'f2', author: 'user2', comment: 'Il tema Oil & Gas è sottovalutato.', rating: 2, createdAt: new Date(2025, 1, 20), status: 'new' },
];

/**
 * Mocks di Statement (Generali e Specifici per Settore).
 */
const mockStatements: Statement[] = [
	populateStatement({
		id: 's1',
		shortName: 'Tutela Ambientale',
		longName: 'Misure di tutela per le aree marine protette.',
		description: 'Implementazione di zone a traffico limitato per la protezione degli habitat sensibili. Questa è una descrizione più estesa per testare lo scrolling.',
		// Statement Generale: sectorThemes undefined
		
	}),
	populateStatement({
		id: 's2',
		shortName: 'Eolico Off-shore',
		longName: 'Sviluppo di un parco eolico nella zona A.',
		description: 'Valutazione di impatto ambientale per 15 turbine eoliche, con focus su impatto visivo e avifauna.',
		sectorThemes: [availableThemesMock[1]!], // Esempio: Rinnovabili
		
	}),
	populateStatement({
		id: 's3',
		shortName: 'Restrizioni Pesca',
		longName: 'Chiusura temporanea della pesca a strascico in area B.',
		description: 'Regolamento per la conservazione degli stock ittici critici durante la stagione riproduttiva.',
		sectorThemes: [availableThemesMock[0]!], // Esempio: Pesca
	}),
];













/**
 * Genera uno scenario mock completo per i test.
 * @param id L'ID dello scenario.
 * @returns Un oggetto Scenario.
 */
export function createScenarioMock(id: string): Scenario {
	return populateScenario({
		id: id,
		name: `Scenario Mock ${id}`,
		generalDescription:
			"Questo è uno scenario di test caricato tramite store.",
		narrative: "La narrativa descrive i driver principali di questo mock.",
		temporalScope: "2020-2040",
		objectives: "Testare il funzionamento dello store Pinia.",
		availableThemes: [
			availableThemesMock[0]!,
			availableThemesMock[1]!,
			availableThemesMock[2]!,
		],
		statements: mockStatements,
		feedbacks: mockFeedbacks,
		primaryThemes: [availableThemesMock[0]!],
		secondaryThemes: [availableThemesMock[1]!],
	});
}
