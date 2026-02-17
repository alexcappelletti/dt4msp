// ~/shared/mocks/scenarioMocks.ts
import type {
	Aspect,
	DomainEffect,
	Feedback,
	Measure,
	Scenario,
	Statement,
	Theme
} from "#/shared/types/msp-project";
import {
	MapLayer,
	populateAspect,
	populateEffect,
	populateMeasure,
	populateScenario,
	populateStatement,
} from "#/shared/types/msp-project";
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
// helper: prende temi per indexName (più robusto degli indici)
const theme = (indexName: Theme["indexName"]) =>
	availableThemesMock.find(t => t.indexName === indexName)!;

export const mockMarineMeasures: Measure[] = [
	populateMeasure({
		name: "Protezione",
		longName: "Protezione delle praterie di Posidonia Oceanica",
		description:
			"Installazione di sistemi di ormeggio ecologici (boe ecosostenibili) per evitare lo sradicamento causato dalle ancore nelle Egadi.",
		impact: "Aumento della densità dei fasci di Posidonia del 12% in 3 anni",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("env_prot"),
			theme("tourism"),       // ancoraggi/boe spesso legati anche a fruizione turistica
			theme("transport"),     // traffico/ancoraggio
		],
	}),

	populateMeasure({
		name: "Ripristino",
		longName: "Ripristino del Coralligeno Profondo",
		description:
			"Rimozione di reti fantasma e attrezzature da pesca abbandonate dai banchi profondi del Canale di Sicilia.",
		impact: "Riduzione dello stress meccanico sugli ecosistemi bentonici",
		geospatialResources: [new MapLayer(), new MapLayer()],
		referenceThemes: [
			theme("env_prot"),
			theme("fishing"),
			theme("research"),
		],
	}),

	populateMeasure({
		name: "Monitoraggio",
		longName: "Monitoraggio dello Stretto di Sicilia (Rotte Migratorie)",
		description:
			"Implementazione di boe acustiche per il monitoraggio dei cetacei e la regolazione del traffico mercantile.",
		impact: "Diminuzione del rischio di collisione con grandi vertebrati marini",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("research"),
			theme("transport"),
			theme("env_prot"),
			theme("security"), // componente di safety/controllo rotte
		],
	}),

	populateMeasure({
		name: "Specie Aliene",
		longName: "Contrasto alle Specie Aliene (Invasione Lessepsiana)",
		description:
			"Programma di monitoraggio e pesca selettiva del Pesce Coniglio e del Pesce Leone nel Canale di Sicilia sud-orientale.",
		impact: "Salvaguardia della biodiversità ittica autoctona",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("env_prot"),
			theme("fishing"),
			theme("research"),
		],
	}),

	populateMeasure({
		name: "Regolamentazione",
		longName: "Regolamentazione Pesca a Strascico sui Banchi",
		description:
			"Istituzione di zone di restrizione della pesca (FRA - Fish Restricted Areas) sui banchi sommersi (es. Banco Avventura).",
		impact: "Recupero degli stock ittici commerciali (Merluzzo e Gambero Rosa)",
		geospatialResources: [new MapLayer(), new MapLayer(), new MapLayer()],
		referenceThemes: [
			theme("fishing"),
			theme("env_prot"),
		],
	}),

	populateMeasure({
		name: "Telerilevamento",
		longName: "Sentinel Marine Pollution - Rilevamento Idrocarburi",
		description:
			"Sistema di telerilevamento satellitare per l'identificazione precoce di sversamenti illegali lungo le rotte petroliere.",
		impact: "Intervento tempestivo entro 4 ore dalla segnalazione",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("oil_gas"),
			theme("transport"),
			theme("security"),
			theme("env_prot"),
			theme("research"),
		],
	}),

	populateMeasure({
		name: "Area Marina Protetta",
		longName: "Rafforzamento Area Marina Protetta (AMP) Pelagie",
		description:
			"Ampliamento della zona di protezione integrale intorno all'Isola dei Conigli (Lampedusa).",
		impact: "Incremento della biomassa ittica (spillover effect) nelle zone limitrofe",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("env_prot"),
			theme("tourism"),
			theme("fishing"),
		],
	}),

	populateMeasure({
		name: "Allerta Prot. Civile",
		longName: "Sistema di Allerta Precoce Ondate di Calore Marine",
		description:
			"Rete di sensori termometrici a diverse profondità per monitorare il riscaldamento delle acque tra Sicilia e Tunisia.",
		impact: "Previsione degli eventi di sbiancamento dei coralli mediterranei",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("research"),
			theme("security"),
			theme("env_prot"),
		],
	}),

	populateMeasure({
		name: "Ambiente",
		longName: "Gestione Plastiche alle Foci dei Fiumi",
		description:
			"Installazione di barriere cattura-plastica alla foce dei fiumi siciliani che scaricano nel Canale.",
		impact: "Riduzione del 40% delle microplastiche riversate in mare",
		geospatialResources: [],
		referenceThemes: [
			theme("env_prot"),
			theme("tourism"),
			theme("fishing"),
		],
	}),

	populateMeasure({
		name: "Erosione Costiera",
		longName: "Erosione Costiera e Ripascimento Morbido",
		description:
			"Interventi di protezione delle coste basse del trapanese tramite barriere soffolte naturali.",
		impact: "Stabilizzazione della linea di costa e protezione degli habitat dunali",
		geospatialResources: [new MapLayer()],
		referenceThemes: [
			theme("landscape"),
			theme("tourism"),
			theme("env_prot"),
			theme("transport"), // opere costiere/rotte/porti possono incrociarsi
		],
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
		name: "Monitoraggio Specie",
		longName: "Protocollo di Monitoraggio Specie Aliene",
		description:
			"Linee guida metodologiche per la raccolta dati standardizzata sulla presenza di specie termofile nel Mediterraneo centrale.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Comunità Locali",
		longName: "Programma di Sensibilizzazione Comunità Locali",
		description:
			"Iniziative educative rivolte ai pescatori e agli operatori turistici di Mazara del Vallo e Sciacca sulla conservazione marina.",
		referenceThemes: [],
	}),
	populateAspect({
		name: "Blue Economy",
		longName: "Certificazione di Sostenibilità Blue Economy",
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
	populateEffect<Aspect>("Non spatial", {
		name: "Semplificazione Amministrativa",

		description: "Impatto sulle procedure di autorizzazione.",
		affected: [mockAspects[0]!]
	}),
	populateEffect<Aspect>("Non spatial", {
		name: "Consapevolezza Sociale",
		description: "Risultato dei programmi educativi.",
		affected: [mockAspects[2]!]
	}),
	populateEffect<Aspect>("Non spatial", {
		name: "Standardizzazione Dati",
		description: "Effetto del protocollo di monitoraggio.",
		affected: [mockAspects[1]!]
	}),
	populateEffect<Aspect>("Non spatial", {
		name: "Prestigio Internazionale",
		description: "Impatto della certificazione Blue Economy.",
		affected: [mockAspects[3]!]
	}),
	populateEffect<Aspect>("Non spatial", {
		name: "Cooperazione Transfrontaliera",
		description: "Miglioramento relazioni Italia-Tunisia.",
		affected: [mockAspects[0]!]
	}),
	populateEffect<Aspect>("Non spatial", {
		name: "Inclusione Pescatori",
		description: "Coinvolgimento attivo nel processo decisionale.",
		affected: [mockAspects[2]!, mockAspects[3]!]
	}),
	populateEffect<Aspect>("Non spatial", {
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
