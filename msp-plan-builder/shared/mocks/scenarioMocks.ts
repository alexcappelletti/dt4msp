// ~/shared/mocks/scenarioMocks.ts
import type {
    Aspect,
    DomainEffect,
    Feedback,
    Measure,
    Scenario,
    Statement,
    Theme,
} from "#/shared/types/msp-project";
import {
    populateAspect,
    populateEffect,
    populateFeedback,
    populateMeasure,
    populateScenario,
    populateStatement,
} from "#/shared/types/msp-project";
import { predefinedThemesMock } from "./themeMocks";

/**
 * Mocks di Feedback per gli esempi.
 */
const mockFeedbacks: Feedback[] = [
	populateFeedback({
		id: "f1",
		title: "Dettaglio sulle aree di pesca artigianale",
		author: "Marco R.",
		comment: "Ottima proposta, ma serve piu dettaglio sulle aree di pesca artigianale.",
		rating: 4,
		createdAt: new Date(2025, 0, 15),
		status: "new",
	}),
	populateFeedback({
		id: "f2",
		title: "Rappresentanza del tema Oil & Gas",
		author: "Elena C.",
		comment: "Il tema Oil & Gas sembra sottorappresentato nelle misure di mitigazione.",
		rating: 2,
		createdAt: new Date(2025, 1, 20),
		status: "reviewed",
		updatedAt: new Date(2025, 1, 25),
	}),
	populateFeedback({
		id: "f3",
		title: "Valutazione delle energie rinnovabili",

		author: "Luigi B.",
		comment: "La parte sulle energie rinnovabili e chiara e ben argomentata.",
		rating: 5,
		createdAt: new Date(2025, 2, 2),
		status: "resolved",
		updatedAt: new Date(2025, 2, 10),
	}),
	populateFeedback({
		id: "f4",
		title: "Priorita temporali per zone costiere",
		author: "Sofia T.",
		comment: "Aggiungere una nota sulle priorita temporali per le zone costiere vulnerabili.",
		rating: 3,
		createdAt: new Date(2025, 2, 12),
		status: "new",
	}),
];

/**
 * Mocks di Statement (Generali e Specifici per Settore).
 */
const mockStatements: Statement[] = [
	populateStatement({
		id: "s1",
		shortName: "Tutela Ambientale",
		longName: "Misure di tutela per le aree marine protette.",
		description:
			"Implementazione di zone a traffico limitato per la protezione degli habitat sensibili.",
	}),
	populateStatement({
		id: "s2",
		shortName: "Eolico Off-shore",
		longName: "Sviluppo di un parco eolico nella zona A.",
		description:
			"Valutazione di impatto ambientale per 15 turbine eoliche, con focus su impatto visivo e avifauna.",
		sectorThemes: [predefinedThemesMock[1]!],
	}),
	populateStatement({
		id: "s3",
		shortName: "Restrizioni Pesca",
		longName: "Chiusura temporanea della pesca a strascico in area B.",
		description:
			"Regolamento per la conservazione degli stock ittici critici durante la stagione riproduttiva.",
		sectorThemes: [predefinedThemesMock[0]!],
	}),
];

const theme = (indexName: Theme["indexName"]) =>
	predefinedThemesMock.find((t) => t.indexName === indexName)!;

export const mockMarineMeasures: Measure[] = [
	populateMeasure({
		name: "Protezione",
		longName: "Protezione delle praterie di Posidonia Oceanica",
		description:
			"Installazione di sistemi di ormeggio ecologici per evitare lo sradicamento causato dalle ancore.",
		impact: "Aumento della densita dei fasci di Posidonia",
		geospatialResources: [{}],
		referenceThemes: [theme("env_prot"), theme("tourism"), theme("transport")],
	}),
	populateMeasure({
		name: "Monitoraggio",
		longName: "Monitoraggio dello Stretto di Sicilia",
		description:
			"Implementazione di boe acustiche per il monitoraggio dei cetacei e la regolazione del traffico.",
		impact: "Diminuzione del rischio di collisione con grandi vertebrati marini",
		geospatialResources: [{}],
		referenceThemes: [theme("research"), theme("transport"), theme("env_prot")],
	}),
];

export const mockAspects: Aspect[] = [
	populateAspect({
		name: "Cooperazione Transfrontaliera Pesca",
		longName: "Quadro Normativo Pesca Transfrontaliera",
		description:
			"Analisi delle normative vigenti tra Italia, Tunisia e Malta per la gestione congiunta delle acque internazionali.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Blue Economy",
		longName: "Certificazione di Sostenibilita Blue Economy",
		description:
			"Standard di certificazione per le imprese turistiche operanti nelle isole minori.",
		referenceThemes: [],
	}),
];

const spatialEffects: DomainEffect[] = [
	populateEffect<Measure>("Spatial", {
		name: "Espansione Habitat Posidonia",
		description: "Effetto cartografico della ricrescita praterie.",
		affected: [mockMarineMeasures[0]!],
	}),
];

const nonSpatialEffects: DomainEffect[] = [
	populateEffect<Aspect>("Non-spatial", {
		name: "Semplificazione Amministrativa",
		description: "Impatto sulle procedure di autorizzazione.",
		affected: [mockAspects[0]!],
	}),
	populateEffect<Aspect>("Non-spatial", {
		name: "Prestigio Internazionale",
		description: "Impatto della certificazione Blue Economy.",
		affected: [mockAspects[1]!],
	}),
];

/**
 * Genera uno scenario mock completo per i test.
 */
export function createScenarioMock(id: string): Scenario {
	return populateScenario({
		id,
		name: `Scenario Mock ${id}`,
		generalDescription: "Questo e uno scenario di test caricato tramite store.",
		narrative: "La narrativa descrive i driver principali di questo mock.",
		temporalScope: "2020-2040",
		objectives: "Testare il funzionamento dello store Pinia.",
		availableThemes: [
			predefinedThemesMock[0]!,
			predefinedThemesMock[1]!,
			predefinedThemesMock[2]!,
		],
		statements: mockStatements,
		feedbacks: mockFeedbacks,
		domainMeasures: [...mockMarineMeasures, ...mockAspects],
		domainEffects: [...spatialEffects, ...nonSpatialEffects],
		primaryThemes: [predefinedThemesMock[0]!],
		secondaryThemes: [predefinedThemesMock[1]!],
	});
}
