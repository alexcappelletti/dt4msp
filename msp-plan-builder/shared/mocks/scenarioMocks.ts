// ~/shared/mocks/scenarioMocks.ts
import type {
	Aspect,
	Feedback,
	Measure,
	DomainEffect,
	DomainMeasure,
	Scenario,
	Statement,
} from "#/shared/types/msp-project";
import {
	MapLayer,
	populateMeasure,
	populateScenario,
	populateStatement,
	populateAspect,
	populateEffect,
} from "#/shared/types/msp-project";
import { generateUUID } from "#/shared/utils/generateUUID";
import { availableThemesMock } from "./mocked";

/**
 * Mocks di Feedback per gli esempi.
 */
const mockFeedbacks: Feedback[] = [
	{
		id: "f1",
		author: "user1",
		comment: "Ottima proposta, ma serve più dettaglio sulla pesca.",
		rating: 4,
		createdAt: new Date(2025, 0, 15),
		status: "new",
	},
	{
		id: "f2",
		author: "user2",
		comment: "Il tema Oil & Gas è sottovalutato.",
		rating: 2,
		createdAt: new Date(2025, 1, 20),
		status: "new",
	},
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
			"Implementazione di zone a traffico limitato per la protezione degli habitat sensibili. Questa è una descrizione più estesa per testare lo scrolling.",
		// Statement Generale: sectorThemes undefined
	}),
	populateStatement({
		id: "s2",
		shortName: "Eolico Off-shore",
		longName: "Sviluppo di un parco eolico nella zona A.",
		description:
			"Valutazione di impatto ambientale per 15 turbine eoliche, con focus su impatto visivo e avifauna.",
		sectorThemes: [availableThemesMock[1]!], // Esempio: Rinnovabili
	}),
	populateStatement({
		id: "s3",
		shortName: "Restrizioni Pesca",
		longName: "Chiusura temporanea della pesca a strascico in area B.",
		description:
			"Regolamento per la conservazione degli stock ittici critici durante la stagione riproduttiva.",
		sectorThemes: [availableThemesMock[0]!], // Esempio: Pesca
	}),
];
// Mock focalizzati sull'ambiente marino del Canale di Sicilia
export const mockMarineMeasures: Measure[] = [
	populateMeasure({
		name: "Protezione delle praterie di Posidonia Oceanica",
		description:
			"Installazione di sistemi di ormeggio ecologici (boe ecosostenibili) per evitare lo sradicamento causato dalle ancore nelle Egadi.",
		impact: "Aumento della densità dei fasci di Posidonia del 12% in 3 anni",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Ripristino del Coralligeno Profondo",
		description:
			"Rimozione di reti fantasma e attrezzature da pesca abbandonate dai banchi profondi del Canale di Sicilia.",
		impact: "Riduzione dello stress meccanico sugli ecosistemi bentonici",
		geospatialResources: [new MapLayer(), new MapLayer()],
	}),

	populateMeasure({
		name: "Monitoraggio dello Stretto di Sicilia (Rotte Migratorie)",
		description:
			"Implementazione di boe acustiche per il monitoraggio dei cetacei e la regolazione del traffico mercantile.",
		impact: "Diminuzione del rischio di collisione con grandi vertebrati marini",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Contrasto alle Specie Aliene (Invasione Lessepsiana)",
		description:
			"Programma di monitoraggio e pesca selettiva del Pesce Coniglio e del Pesce Leone nel Canale di Sicilia sud-orientale.",
		impact: "Salvaguardia della biodiversità ittica autoctona",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Regolamentazione Pesca a Strascico sui Banchi",
		description:
			"Istituzione di zone di restrizione della pesca (FRA - Fish Restricted Areas) sui banchi sommersi (es. Banco Avventura).",
		impact: "Recupero degli stock ittici commerciali (Merluzzo e Gambero Rosa)",
		geospatialResources: [new MapLayer(), new MapLayer(), new MapLayer()],
	}),

	populateMeasure({
		name: "Sentinel Marine Pollution - Rilevamento Idrocarburi",
		description:
			"Sistema di telerilevamento satellitare per l'identificazione precoce di sversamenti illegali lungo le rotte petroliere.",
		impact: "Intervento tempestivo entro 4 ore dalla segnalazione",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Rafforzamento Area Marina Protetta (AMP) Pelagie",
		description:
			"Ampliamento della zona di protezione integrale intorno all'Isola dei Conigli (Lampedusa).",
		impact: "Incremento della biomassa ittica (spillover effect) nelle zone limitrofe",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Sistema di Allerta Precoce Ondate di Calore Marine",
		description:
			"Rete di sensori termometrici a diverse profondità per monitorare il riscaldamento delle acque tra Sicilia e Tunisia.",
		impact: "Previsione degli eventi di sbiancamento dei coralli mediterranei",
		geospatialResources: [new MapLayer()],
	}),

	populateMeasure({
		name: "Gestione Plastiche alle Foci dei Fiumi",
		description:
			"Installazione di barriere cattura-plastica alla foce dei fiumi siciliani che scaricano nel Canale.",
		impact: "Riduzione del 40% delle microplastiche riversate in mare",
		geospatialResources: [],
	}),

	populateMeasure({
		name: "Erosione Costiera e Ripascimento Morbido",
		description:
			"Interventi di protezione delle coste basse del trapanese tramite barriere soffolte naturali.",
		impact: "Stabilizzazione della linea di costa e protezione degli habitat dunali",
		geospatialResources: [new MapLayer()],
	}),
];

export const mockAspects: Aspect[] = [
	populateAspect({
		name: "Quadro Normativo Pesca Transfrontaliera",
		description:
			"Analisi delle normative vigenti tra Italia, Tunisia e Malta per la gestione congiunta delle acque internazionali.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Protocollo di Monitoraggio Specie Aliene",
		description:
			"Linee guida metodologiche per la raccolta dati standardizzata sulla presenza di specie termofile nel Mediterraneo centrale.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Programma di Sensibilizzazione Comunità Locali",
		description:
			"Iniziative educative rivolte ai pescatori e agli operatori turistici di Mazara del Vallo e Sciacca sulla conservazione marina.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Certificazione di Sostenibilità Blue Economy",
		description:
			"Standard di certificazione per le imprese turistiche operanti nelle isole minori (Lampedusa, Linosa, Pantelleria).",
		referenceThemes: [],
	}),
];
// 5 Effetti Spaziali (basati su Measure)
const spatialEffects: DomainEffect[] = [
	populateEffect<Measure>("Spatial", {
		name: "Espansione Habitat Posidonia",
		description: "Effetto cartografico della ricrescita praterie.",
		affected: [mockMarineMeasures[0]!, mockMarineMeasures[1]!], // Assumendo mockMeasures esistenti
	}),
	populateEffect<Measure>("Spatial", {
		name: "Zone di Restrizione Pesca",
		description: "Buffer spaziali definiti dalle coordinate GPS.",
		affected: [mockMarineMeasures[2]!],
	}),
	populateEffect<Measure>("Spatial", {
		name: "Monitoraggio Inquinamento Costiero",
		description: "Visualizzazione hotspot inquinamento.",
		affected: [mockMarineMeasures[3]!],
	}),
	populateEffect<Measure>("Spatial", {
		name: "Riforestazione Marina",
		description: "Aree identificate per il trapianto di fanerogame.",
		affected: [mockMarineMeasures[0]!],
	}),
	populateEffect<Measure>("Spatial", {
		name: "Erosione Costiera Contenuta",
		description: "Layer di impatto delle barriere soffolte.",
		affected: [mockMarineMeasures[1]!, mockMarineMeasures[3]!],
	}),
];

// 7 Effetti Non Spaziali (basati su Aspect)
const nonSpatialEffects: DomainEffect[] = [
    populateEffect<Aspect>("Contextual", {
        name: "Semplificazione Amministrativa",
        
        description: "Impatto sulle procedure di autorizzazione.",
        affected: [mockAspects[0]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Consapevolezza Sociale",
        description: "Risultato dei programmi educativi.",
        affected: [mockAspects[2]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Standardizzazione Dati",
        description: "Effetto del protocollo di monitoraggio.",
        affected: [mockAspects[1]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Prestigio Internazionale",
        description: "Impatto della certificazione Blue Economy.",
        affected: [mockAspects[3]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Cooperazione Transfrontaliera",
        description: "Miglioramento relazioni Italia-Tunisia.",
        affected: [mockAspects[0]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Inclusione Pescatori",
        description: "Coinvolgimento attivo nel processo decisionale.",
        affected: [mockAspects[2]!, mockAspects[3]!]
    }),
    populateEffect<Aspect>("Contextual", {
        name: "Rigore Scientifico",
        description: "Validazione dei dati raccolti.",
        affected: [mockAspects[1]!]
    })
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
		domainMeasures: [...mockMarineMeasures, ...mockAspects],
		domainEffects: [...spatialEffects, ...nonSpatialEffects],
		primaryThemes: [availableThemesMock[0]!],
		secondaryThemes: [availableThemesMock[1]!],
	});
}
