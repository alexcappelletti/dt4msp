import { dataset } from "happy-dom/lib/PropertySymbol.js";
import type { Geostory } from "./geostory";
import { generateUUID } from "@/utils/generateUUID";
export interface Scenario {
	id: string;
	name: string;
	generalDescription: string;
	narrative: string;
	temporalScope: string;
	maps: string[]
	datasets: string[];
	extendedAspects: string;
	initiatives: Array<Initiative>;
	availableThemes?: Array<Theme>;
	topics: Record<string, Theme>;
	definedGeostories: Geostory[];
	objectives: string;
}



export function populateScenario(scenario: Partial<Scenario>): Scenario {
	const emptyScenario: Scenario = {
		id: generateUUID(),
		name: '',
		generalDescription: 'metti una descrizione generale qui',
		narrative: 'metti descr narrativa qui',
		temporalScope: '',
		maps: [],
		datasets: [],
		extendedAspects: '',
		initiatives: [],
		topics: {},
		availableThemes: [],
		definedGeostories: [],
		objectives: ''
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

export interface Theme {
	ID?: string;
	name: string;
	indexName: string
	type: "secondario" | "primario" | "NA";
	description: string;
	geospatialResources: MapLayer[];
	tags?: string[];
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
export interface Initiative {
	name: string;
	ID: string;
	impactOnTheme: string;
	description: string;
	geospatialResources: MapLayer[];
	primaryThemes: Theme[];
	secondaryThemes: Theme[];
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
// 	impacts: Record<string, Initiative>;
// 	constructor(p: {
// 		id: string;
// 		theme_id: string;
// 		type: string;
// 		description: string;
// 		geospatialResources: MapLayer[];
// 		impacts: Initiative[];
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