import type { Geostory } from "./geostory";

export class Scenario {
	id: string;
	name: string;
	generalDescription: string;
	narrative: string;
	temporalScope: string;
	maps: string[]
	datasets: string[];
	extendedAspects: string;
	temi: Record<string, Theme>;
	definedGeostories: Geostory[];
	objectives: string;

	constructor(params: {
		id: string,
		name: string,
		generalDescription: string,
		narrative: string,
		temporalScope: string,
		maps: string[],
		datasets: string[],
		extendedAspects: string,
		availableThemes: Theme[],
		definedGeostories: Geostory[],
		objectives: string,
	}) {
		this.id = params.id;
		this.name = params.name;
		this.generalDescription = params.generalDescription;
		this.narrative = params.narrative;
		this.temporalScope = params.temporalScope;
		this.maps = params.maps || [];
		this.datasets = params.datasets || [];
		this.extendedAspects = params.extendedAspects;
		this.temi = Object.fromEntries(
				params.availableThemes.map(t => [t.theme_id, t])
		)

		this.definedGeostories = params.definedGeostories || [];
		this.objectives = params.objectives;
	}
}


export class Theme {
	nome: string;
	theme_id: string;
	type: string;
	description: string;
	geospatialResources: MapLayer[];
	impacts: Record<string, Impact>;
	constructor(p: {
		id: string;
		theme_id: string;
		type: string;
		description: string;
		geospatialResources: MapLayer[];
		impacts: Impact[];
	}) {
		this.nome = p.id;
		this.theme_id = p.theme_id;
		this.type = p.type;
		this.description = p.description;
		this.geospatialResources = p.geospatialResources || [];
		this.impacts = Object.fromEntries(
			p.impacts.map(i => [i.impactID, i])) 
	}

}

export class Impact {
	nome: string;
	impactID: string;
	impactOnTheme: string;
	description: string;
	layers: MapLayer[];
	constructor(p: {
		impactName: string;
		impactOnTheme: string;
		description: string;
		layersInvolved?: MapLayer[];
	}) {
		this.nome = p.impactName;
		this.impactID = p.impactOnTheme;
		this.impactOnTheme = p.impactOnTheme;
		this.description = p.description;
		this.layers = p.layersInvolved || [];
	}
}

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