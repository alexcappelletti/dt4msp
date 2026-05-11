import {
	populateTheme,
	type MapLayer,
	type Statement,
	type Theme,
} from "#/shared/types/msp-project";
import { generateUUID } from "#/shared/utils/generateUUID";
export { mapRequestsMock } from "./mapRequestMocks";

// --- Definizione dei Temi per i vari Settori ---
export const predefinedThemesMock: Theme[] = [
	populateTheme({
		id: "theme-fishing",
		name: "Pesca",
		indexName: "fishing",
		description: "Attività legate alla pesca professionale e ricreativa.",
		type: "NA" as const, // Utilizza 'NA' come default come da interfaccia
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-oil-gas",
		name: "Oil & Gas",
		indexName: "oil_gas",
		description:
			"Infrastrutture e attività di estrazione di idrocarburi offshore.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-renewables",
		name: "Rinnovabili",
		indexName: "renewables",
		description:
			"Pianificazione e sviluppo di energie marine rinnovabili (eolico, moto ondoso, ecc).",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-tourism",
		name: "Turismo",
		indexName: "tourism",
		description:
			"Attività turistiche, balneari e ricreative in area costiera e marina.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-transport",
		name: "Trasporti",
		indexName: "transport",
		description:
			"Rotte di navigazione, infrastrutture portuali e traffico marittimo.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-research",
		name: "Ricerca",
		indexName: "research",
		description:
			"Aree dedicate a studi scientifici, monitoraggio ambientale e sperimentazioni.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-security",
		name: "Sicurezza",
		indexName: "security",
		description:
			"Operazioni di salvataggio, controllo delle frontiere e sicurezza marittima.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-defense",
		name: "Difesa",
		indexName: "defense",
		description:
			"Aree militari, esercitazioni navali e restrizioni di accesso.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-aquaculture",
		name: "Acquacultur", // Mantenuto come nell'immagine/richiesta precedente
		indexName: "aquaculture",
		description: "Impianti di allevamento ittico, molluschi e maricoltura.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-energy",
		name: "Energia",
		indexName: "energy",
		description:
			"Infrastrutture energetiche generali (es. cavi sottomarini, stoccaggio).",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-landscape",
		name: "Paesaggio",
		indexName: "landscape",
		description:
			"Tutela visiva e conservazione delle caratteristiche paesaggistiche costiere e marine.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
	populateTheme({
		id: "theme-env-prot",
		name: "Protezione Ambientale",
		indexName: "env_prot",
		description:
			"Aree marine protette, siti Natura 2000 e misure di conservazione della biodiversità.",
		type: "NA" as const,
		geospatialResources: new Array<MapLayer>(),
	}),
];

export const mockThemeTourism = predefinedThemesMock.find(
	(t) => t.name === "Turismo",
)!;
export const mockThemeEnergy = predefinedThemesMock.find(
	(t) => t.name === "Energia",
)!;

export const mockThemeTransport = predefinedThemesMock.find(
	(t) => t.name === "Trasporti",
)!;

export const mockThemeOilGas = predefinedThemesMock.find(
	(t) => t.name === "Oil & Gas",
)!;

export const mockThemeFishing = predefinedThemesMock.find((t) => t.name === "Pesca")!;

export const mockThemeResearch = predefinedThemesMock.find((t) => t.name === "Ricerca")!;

export const mockThemeEnvProt = predefinedThemesMock.find(
	(t) => t.name === "Protezione Ambientale",
)!;
export const mockThemeRenewables = predefinedThemesMock.find(
	(t) => t.name === "Rinnovabili",
)!;
export const mockThemeLandscape = predefinedThemesMock.find(
	(t) => t.name === "Paesaggio",
)!;
export const mockThemeSecurity = predefinedThemesMock.find(
	(t) => t.name === "Sicurezza",
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
		sectorThemes: [mockThemeOilGas as Theme],
	},
	{
		id: generateUUID(),
		shortName: "Pesca Artigianale",
		longName: "Tutela della piccola pesca costiera tradizionale",
		description:
			"Creazione di zone di esclusiva per la pesca a basso impatto per favorire le comunità locali rispetto alla flotta industriale.",
		imageUrl: "https://picsum.photos",
		sectorThemes: [mockThemeFishing as Theme],
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
		sectorThemes: [mockThemeResearch as Theme],
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
		sectorThemes: [mockThemeEnvProt as Theme],
	},
];
