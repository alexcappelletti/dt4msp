import {
	populateTheme,
	type MapLayer,
	type Statement,
	type Theme,
} from "#/shared/types/msp-project";
import { generateUUID } from "#/shared/utils/generateUUID";
export { mapRequestsMock } from "./mapRequestMocks";

// --- Definizione dei Temi per i vari Settori ---
export const availableThemesMock: Theme[] = [
	populateTheme({
		id: generateUUID(),
		name: "Pesca",
		indexName: "fishing",
		description: "Attività legate alla pesca professionale e ricreativa.",
		type: "NA" as const, // Utilizza 'NA' come default come da interfaccia
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Oil & Gas",
		indexName: "oil_gas",
		description:
			"Infrastrutture e attività di estrazione di idrocarburi offshore.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Rinnovabili",
		indexName: "renewables",
		description:
			"Pianificazione e sviluppo di energie marine rinnovabili (eolico, moto ondoso, ecc).",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Turismo",
		indexName: "tourism",
		description:
			"Attività turistiche, balneari e ricreative in area costiera e marina.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Trasporti",
		indexName: "transport",
		description:
			"Rotte di navigazione, infrastrutture portuali e traffico marittimo.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Ricerca",
		indexName: "research",
		description:
			"Aree dedicate a studi scientifici, monitoraggio ambientale e sperimentazioni.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Sicurezza",
		indexName: "security",
		description:
			"Operazioni di salvataggio, controllo delle frontiere e sicurezza marittima.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Difesa",
		indexName: "defense",
		description:
			"Aree militari, esercitazioni navali e restrizioni di accesso.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Acquacultur", // Mantenuto come nell'immagine/richiesta precedente
		indexName: "aquaculture",
		description: "Impianti di allevamento ittico, molluschi e maricoltura.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Energia",
		indexName: "energy",
		description:
			"Infrastrutture energetiche generali (es. cavi sottomarini, stoccaggio).",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Paesaggio",
		indexName: "landscape",
		description:
			"Tutela visiva e conservazione delle caratteristiche paesaggistiche costiere e marine.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: generateUUID(),
		name: "Protezione Ambientale",
		indexName: "env_prot",
		description:
			"Aree marine protette, siti Natura 2000 e misure di conservazione della biodiversità.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
];

export const mockThemeTourism = availableThemesMock.find(
	(t) => t.name === "Turismo",
)!;
export const mockThemeEnergy = availableThemesMock.find(
	(t) => t.name === "Energia",
)!;

const mockThemeTransport = availableThemesMock.find(
	(t) => t.name === "Trasporti",
)!;

const mockThemeIndustry = availableThemesMock.find(
	(t) => t.name === "Oil & Gas",
)!;

const mockThemeFood = availableThemesMock.find((t) => t.name === "Pesca")!;

const mockThemeTelecom = availableThemesMock.find((t) => t.name === "Ricerca")!;

const mockThemeClimate = availableThemesMock.find(
	(t) => t.name === "Protezione Ambientale",
)!;

// --- Lista degli Statement ---

export const furtherExampleStatements: Statement[] = [
	{
		id: generateUUID(),
		shortName: "Eolico Galleggiante",
		longName: "Sperimentazione tecnologie Wind-Float in acque profonde",
		description:
			"Installazione di turbine eoliche su piattaforme semisommergibili per sfruttare i venti d'alto mare oltre i 100m di profondità.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeEnergy as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Santuario Cetacei",
		longName: "Ampliamento zona di protezione speciale transfrontaliera",
		description:
			"Misure di restrizione della velocità navale per ridurre il rischio di strike con grandi balenottere e capodogli.",
		imageUrl: "https://picsum.photos",
		// General (nessun sectorTheme)
	},
	{
		id: generateUUID(),
		shortName: "Dragaggi Portuali",
		longName: "Gestione sostenibile dei sedimenti di escavo",
		description:
			"Protocolli per il riutilizzo dei fanghi di dragaggio in operazioni di ripascimento costiero o edilizia tecnica.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeTransport as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Desalinizzazione",
		longName: "Impianti di potabilizzazione acqua marina",
		description:
			"Valutazione dell'impatto dello scarico di salamoia sugli ecosistemi bentonici locali.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeIndustry as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Pesca Artigianale",
		longName: "Tutela della piccola pesca costiera tradizionale",
		description:
			"Creazione di zone di esclusiva per la pesca a basso impatto per favorire le comunità locali rispetto alla flotta industriale.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeFood as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Marine Litter",
		longName: "Piano di recupero delle plastiche in mare",
		description:
			"Incentivi ai pescatori per il conferimento a terra dei rifiuti raccolti nelle reti durante le attività ordinarie.",
		imageUrl: "https://picsum.photos",
	},
	{
		id: generateUUID(),
		shortName: "Cavi Sottomarini",
		longName: "Protezione infrastrutture digitali di comunicazione",
		description:
			"Definizione di fasce di rispetto intorno alle dorsali in fibra ottica per prevenire danni da ancore o reti a strascico.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeTelecom as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Turismo Subacqueo",
		longName: "Valorizzazione dei percorsi archeologici sommersi",
		description:
			"Implementazione di guide digitali e boe di ormeggio per visitatori in siti di importanza storica.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeTourism as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Specie Aliene",
		longName: "Monitoraggio della diffusione di specie non indigene",
		description:
			"Analisi delle acque di zavorra delle navi mercantili per prevenire l'introduzione di organismi invasivi.",
		imageUrl: "https://picsum.photos",
	},
	{
		id: generateUUID(),
		shortName: "Stoccaggio CO2",
		longName: "Sequestro di anidride carbonica in giacimenti esausti",
		description:
			"Progetto pilota per l'iniezione di CO2 catturata in ex pozzi di gas naturale nel sottosuolo marino.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeClimate as Theme],
	},
];
