import { dataset } from "happy-dom/lib/PropertySymbol.js";
import type { Geostory } from "./geostory";
import { generateUUID } from "@/utils/generateUUID";


export interface Project{
	id: string;
	name: string;
	description: string;
	scenarios: Array<Scenario>;
	createdAt: Date;
	updatedAt: Date;

}

export interface AreaOfInterest {
	id: string;
	name: string;
	longName: string;
	coordinates?: Array<number[]>; //array di array di coordinate che definiscono il poligono
	description: string;

}

export interface Scenario {
	id: string;
	name: string;
	areaOfInterest?: AreaOfInterest;
	generalDescription: string;
	narrative: string;
	temporalScope: string;
	spatialResources: string[]
	datasets: string[];
	measures: Array<Measure>;
	effects?: Array<Effect>;
	availableThemes: Array<Theme>;  //tutti i temi disponibili per lo scenario
	primaryThemes?: Array<Theme>; //temi primari selezionati per lo scenario
	secondaryThemes?: Array<Theme>; //temi secondari selezionati per lo scenario
	topics: Record<string, Theme>;  //themi specifificati per index name ->serve per indizzare i temi quando si usa il query-language
	statements?: Array<Statement>;
	definedGeostories: Geostory[];
	objectives: string;
}
export interface Theme {
	ID?: string;
	name: string;
	indexName: string   ; //nome univoco per lo scenario usato per creare il riferimento al tema 
	type: "secondario" | "primario" | "NA"; //non é qui ma nel momento in cui si associa allo scenario
	description: string;
	geospatialResources: MapLayer[];
	tags?: string[];
}

export interface Statement {
	shortName: string;
	longName: string;
	ID:	string;
	description: string;
	imageUrl?: string|URL;
	sectorThemes: Array<Theme>; //specifica i statement  che sono associati ad uno o piú temi
}

export interface Measure {
	name: string;
	ID: string;
	impact: string;
	description: string;
	geospatialResources: MapLayer[];
	affectedMeasures?: Array<Measure>; //misure che sono influenzate da questa misura
	referenceThemes: Array<Theme>;  //specifica i temi che sono associati alla misura  scelti tra i primari ed i secondari dello scenario
}

export interface Effect extends Measure {
	name: string;
	ID: string;
	description: string;
}


export function populateScenario(scenario: Partial<Scenario>): Scenario {
	const emptyScenario: Scenario = {
		id: generateUUID(),
		name: '',
		generalDescription: 'metti una descrizione generale qui',
		narrative: 'metti descr narrativa qui',
		temporalScope: '',
		objectives: '',
		spatialResources: [],
		areaOfInterest: undefined,
		availableThemes: [],

		statements: [],
		datasets: [],
		measures: [],
		effects: [],
		primaryThemes: [],
		secondaryThemes: [],
		
		topics: {},
		
		definedGeostories: [],
		
	} as Scenario;
	const retValue: Scenario = {
		...emptyScenario,
		...scenario,
	};
	if (!scenario.availableThemes || scenario.availableThemes.length === 0) {
		console.warn("availableThemes non è disponibile per popolare i topics.");
		return retValue;
	}
	retValue.topics = scenario.availableThemes.reduce((accumulator, theme) => {
		accumulator[theme.indexName] = theme;
		return accumulator;
	}, {} as Record<string, Theme>);
	return retValue;
}

export function populateTheme(theme: Partial<Theme>): Theme {
	const defaultTheme: Theme = {
		ID: generateUUID(),
		indexName: '',
		name: '',
		type: 'NA',
		description: '',
		geospatialResources: new Array<MapLayer>(),
		tags: new Array<string>()
	} as Theme;
	return {
		...defaultTheme,
		...theme,
	};
}
export function populateMeasure(measure: Partial<Measure>): Measure {
	const defaultMeasure: Measure = {
		ID: generateUUID(),	
		name: '',
		impact: '',
		description: '',	
		geospatialResources: new Array<MapLayer>(),
		referenceThemes: new Array<Theme>()
	} as Measure;
	return {
		...defaultMeasure,
		...measure,
	};
}

// export class BaseTheme  {
// 	nome: string;
// 	theme_id: string;
// 	type: string;
// 	description: string;
// 	geospatialResources: MapLayer[];
// 	constructor() {
// 		this.nome = '';
// 		this.theme_id = '';
// 		this.type = '';
// 		this.description = '';
// 		this.geospatialResources = [];
// 	}
// }

// export class Theme extends BaseTheme {
// 	impacts: Record<string, Measure>;
// 	constructor(p: {
// 		id: string;
// 		theme_id: string;
// 		type: string;
// 		description: string;
// 		geospatialResources: MapLayer[];
// 		impacts: Measure[];
// 	}) {
// 		super()
// 		this.nome = p.id;
// 		this.theme_id = p.theme_id;
// 		this.type = p.type;
// 		this.description = p.description;
// 		this.geospatialResources = p.geospatialResources || [];
// 		this.impacts = Object.fromEntries(
// 			p.impacts.map(i => [i.ID, i]))
// 		//aggiungere a geospatialResources eventuali layer  che trovo in ciascun impact. 
// 		// I layer devono essere univoci
// 	}
// }

// export class ExtendedAspects extends BaseTheme {
// 	//campi estesi TOBEDEFINED
// 	constructor(p: {
// 		id: string;
// 		theme_id: string;
// 		type: string;
// 		description: string;
// 		geospatialResources: MapLayer[];
// 	}) {
// 		super()
// 		this.nome = p.id;
// 		this.theme_id = p.theme_id;
// 		this.type = p.type;
// 		this.description = p.description;
// 		this.geospatialResources = p.geospatialResources || [];

// 	}
// }
//--------------------
//rappresenta una misura di pianificazione o gestione o lo stato attuale





export class MapLayer {
	id: string;
	name: string;
	type: string;
	url: string;
	workspace?: string;
	layerName?: string;
	description?: string;
	legendUrl?: string;
	thumbnailUrl?: string;
	constructor(p: {
		id: string;
		name: string;
		type: string;
		url: string;
		workspace?: string;
		layerName?: string;
		description?: string;
		legendUrl?: string;
		thumbnailUrl?: string;
	}) {
		this.id = p.id;
		this.name = p.name;
		this.type = p.type;
		this.url = p.url;
		this.workspace = p.workspace || '';
		this.layerName = p.layerName || '';
		this.description = p.description || '';
		this.legendUrl = p.legendUrl || '';
		this.thumbnailUrl = p.thumbnailUrl || '';
	}

}