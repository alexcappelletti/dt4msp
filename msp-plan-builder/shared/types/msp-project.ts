import { generateUUID } from "#/shared/utils/generateUUID";
import { extend } from "lodash-es";

export interface Project {
	readonly id: string;
	name: string;
	description: string;
	scenarios: Array<Scenario>;
	areaOfInterest: AreaOfInterest;
	createdAt: Date;
	updatedAt: Date;
}
export interface OptionalData {
	readonly id: string;
	title: string;
	content: string;
	descr: string;
}

export interface AreaOfInterest {
	readonly id: string;
	name: string;
	longName: string;
	//coordinates?: Array<number[]>; //array di array di coordinate che definiscono il poligono
	filterCQL?: string;
	description: string;
	scenarios: Array<Scenario>;
	statements?: Array<Statement>;
	temporalScope: string;
	others: Map<string, OptionalData>;
}

export interface Scenario {
	readonly id: string;
	name: string;
	areaOfInterest?: AreaOfInterest;
	generalDescription: string;
	narrative: string;
	temporalScope: string;
	spatialResources: string[];
	datasets: string[];
	statements?: Array<Statement>;
	domainMeasures: Array<DomainMeasure>;
	domainEffects?: Array<DomainEffect>;
	availableThemes: Array<Theme>; //tutti i temi disponibili per lo scenario
	primaryThemes?: Array<Theme>; //temi primari selezionati per lo scenario
	secondaryThemes?: Array<Theme>; //temi secondari selezionati per lo scenario
	topics: Record<string, Theme>; //themi specifificati per index name ->serve per indizzare i temi quando si usa il query-language
	feedbacks?: Array<Feedback>;
	definedGeostories: [];
	objectives: string;
}
export interface Theme {
	readonly id: string;
	name: string;
	indexName: string; //nome univoco per lo scenario usato per creare il riferimento al tema
	type: "secondario" | "primario" | "NA"; //non é qui ma nel momento in cui si associa allo scenario
	description: string;
	geospatialResources: MapLayer[];
	tags?: string[];
}

export interface Statement {
	shortName: string;
	longName: string;
	readonly id: string;
	description: string;
	imageUrl?: string | URL;
	sectorThemes?: Array<Theme>; //specifica i statement  che sono associati ad uno o piú temi
}

export interface Feedback {
	readonly id: string;
	rating: number; //valutazione da 1 a 5
	comment: string;
	author: string;
	createdAt: Date;
	updatedAt?: Date;
	status: "new" | "reviewed" | "resolved";
}
export type DomainMeasure = Measure | Aspect;
export interface Aspect {
	readonly type: "Aspect";
	name: string;
	readonly id: string;
	description: string;
	referenceThemes?: Array<Theme>;
	longName?: string;
}
export interface Measure extends Omit<Aspect, "type"> {
	readonly type: "Measure";
	impact: string;
	geospatialResources: MapLayer[];
}
export interface Effect <T extends DomainMeasure> {
	name: string;
	description: string;
	readonly id: string;
	affected: Array<T>; 
}
export type DomainEffect = Effect<Measure> | Effect<Aspect>;

export function populateScenario(scenario: Partial<Scenario>): Scenario {
	const emptyScenario: Scenario = {
		id: generateUUID(),
		name: "",
		generalDescription: "metti una descrizione generale qui",
		narrative: "metti descr narrativa qui",
		temporalScope: "",
		objectives: "",
		spatialResources: [],
		areaOfInterest: undefined,
		availableThemes: [],
		primaryThemes: [],
		secondaryThemes: [], //temi secondari selezionati per lo scenario
		statements: [],
		datasets: [],
		domainMeasures: [],
		domainEffects: [],
		feedbacks: [],
		topics: {},
		definedGeostories: [],
	} as Scenario;
	const retValue: Scenario = {
		...emptyScenario,
		...scenario,
	};
	if (!scenario.availableThemes || scenario.availableThemes.length === 0) {
		console.warn(
			"availableThemes non è disponibile per popolare i topics.",
		);
		return retValue;
	}
	retValue.topics = scenario.availableThemes.reduce(
		(accumulator, theme) => {
			accumulator[theme.indexName] = theme;
			return accumulator;
		},
		{} as Record<string, Theme>,
	);
	return retValue;
}

export function populateTheme(theme: Partial<Theme>): Theme {
	const defaultTheme: Theme = {
		id: generateUUID(),
		indexName: "",
		name: "",
		type: "NA",
		description: "",
		geospatialResources: new Array<MapLayer>(),
		tags: new Array<string>(),
	} as Theme;
	return {
		...defaultTheme,
		...theme,
	};
}
export function populateAspect(aspect: Partial<Aspect> = {}): Aspect {
	const defaultAspect: Aspect = {
		id: generateUUID(),
		type: "Aspect",
		name: "",
		description: "",
		referenceThemes: [],
		longName: "",
	};

	return {
		...defaultAspect,
		...aspect,
		type: "Aspect", 
	};
}


export function populateMeasure(measure: Partial<Measure> = {}): Measure {
	const defaultMeasure: Measure = {
		id: generateUUID(),
		type: "Measure",
		name: "",
		description: "",
		impact: "",
		geospatialResources: [],
		referenceThemes: [],
		longName: "",
	};
	return {
		...defaultMeasure,
		...measure,
		type: "Measure", 
	};
}
export function populateEffect<T extends DomainMeasure>(
	type: T["type"],
	data: Partial<Effect<T>> = {},
): DomainEffect {
	const defaultEffect: Effect<T> = {
		affected: [],
		name: "",
		description: "",
		id: generateUUID(),
	};

	const merged = {
		...defaultEffect,
		...data,
	};

	// Validazione runtime dell'omogeneità (opzionale ma consigliata)
	if (merged.affected.length > 0) {
		const isConsistent = merged.affected.every(
			(item) => item.type === type,
		);
		if (!isConsistent) {
			throw new Error(
				`DomainEffect mismatch: expected all items to be of type ${type}`,
			);
		}
	}
	return merged as DomainEffect;
}

export function populateStatement(statement: Partial<Statement>): Statement {
	const defaultStatement: Statement = {
		id: generateUUID(),
		shortName: "",
		longName: "",
		description: "",
		imageUrl: undefined,
		sectorThemes: new Array<Theme>(),
	} as Statement;
	return {
		...defaultStatement,
		...statement,
	};
}

export class MapLayer {}
