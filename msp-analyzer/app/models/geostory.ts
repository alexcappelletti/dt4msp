import { generateUUID } from "#/shared/utils/generateUUID";
import { ChangeEvent } from "./changeEvent";
import { Visual } from "./visual";
import { mapActions } from "pinia";

export class Section {
	sectionId: string;
	humanReadableName: string;
	order: number;
	elements: StoryElement[];

	constructor(id: string, title: string, order: number, elements: StoryElement[] = []) {
		this.sectionId = id;
		this.humanReadableName = title;
		this.order = order;
		this.elements = elements;
	}
	getTitle(): string {
		return (
			this.humanReadableName ||
			this.elements.find(el => el.sectionTitle?.trim())?.sectionTitle ||
			"undefined title"
		);
	}


}


export interface Geostory {
	id: string;
	title: string;
	author?: string;
	timestamp: Date;
	elements: StoryElement[];
	sections: Map<string, Section>;
	topic: string;
	scenario: string;
	language: string;
	target: string;
	exportType: string;

}


export function populateGeostory(g: Partial<Geostory>): Geostory{
	const emptyGs: Geostory = {
		id: generateUUID(),
		title: "",
		author: "",
		timestamp: new Date(),
		topic:"",
		scenario:"",
		language:"ita",
		target:"",
		exportType:"pdf",
		elements:[],
		sections: new Map<string, Section>(), 

	} as Geostory
	const retVal: Geostory = {
		...emptyGs, 
		...g
	}
	
    if (retVal.elements && Array.isArray(retVal.elements)) {
		retVal.elements = retVal.elements.map((element) => {
			// 1. Applichiamo il populator agli StoryElement per garantire i valori di default
			const populatedElement = populateStoryElement(element);

			// 2. Elaboriamo gli storyItems per garantire ID e valori di default
			if (
				populatedElement.storyItems &&
				Array.isArray(populatedElement.storyItems)
			) {
				populatedElement.storyItems = populatedElement.storyItems.map(
					(item) => {
						// Usiamo populateStoryItem per inizializzare correttamente campi come background, style, ecc.
						return populateStoryItem(item);
					},
				);
			}

			return populatedElement;
		});
	}

	// CRITICO: usiamo retVal.elements (già processati) e non g.elements
	if (retVal.elements.length > 0) {
		retVal.sections = groupBySectionID(retVal.elements);
	}
	
	console.log("numero elementi " + retVal.elements?.length)
	console.log("numero sezioni " + retVal.sections?.size)
	return retVal
}


///ritorna una mappa dove gli storyElemens sono ordinati per "order" 
export function groupBySectionID(elements: StoryElement[]): Map<string, Section> {
	const grouped = elements.reduce((map, el) => {
		const section = map.get(el.sectionID);
		if (section) {
			section.elements.push(el);
		} else {
			map.set(el.sectionID, new Section(
				el.sectionID,
				el.sectionTitle || el.sectionID,
				el.order,
				[el]
			));
		}
		return map;
	}, new Map<string, Section>());

	// Ordina le sezioni per order crescente
	return new Map(
		[...grouped.entries()].sort(([, a], [, b]) => a.order - b.order)
	);
}


export interface StoryElement {
	order: number;
	sectionTitle: string;
	sectionID: string;
	readonly id: string;
	style: string;
	tags: string[];
	actions: string[];
	storyItems: StoryItem[];
}


export interface StoryItem {
	id: string;
	title: string;
	text: string; // 
	visual: Visual | null;
	author: string;
	timestamp: Date;
	tags: string[];
	mapActions: string[];
	background: URL;
	changes: ChangeEvent[];
	comments: string;
	////////: string; // Optional structure field
	structure: string; // Optional structure field
	style: StoryItemStyle;
}

export function populateStoryElement(stEl: Partial<StoryElement>): StoryElement {
	return {
		id: generateUUID(),
		order: -1,
		sectionTitle:"",
		sectionID:'',
		style: '',
		tags: new Array<string>(),
		actions: new Array<string>(),
		storyItems: new Array<StoryItem>(),
		...stEl
	}
}

export function populateStoryItem(stIt: Partial<StoryItem>): StoryItem{
	return {
		id: generateUUID(),
		text: "undefined text",
		title: "undefined title",
		tags:[],
		author: "no author",
		structure:'undefined_structure',
		timestamp: new Date(),
		mapActions: [],
		visual: {} as Visual,
		comments:'',
		background: new URL("https://www.example.com/"),
		changes: [],
		style:{} as StoryItemStyle,
		...stIt
	} as StoryItem
}


export type TextAlignment = 'top' | 'center' | 'bottom' | 'justify';
export type VisualPosition = 'left' | 'right';
export type ScrollBehavior = 'fixed' | 'scroll';

export interface StoryItemStyle {
	textAlignment: TextAlignment
	visualPos: VisualPosition
	backgroundScroll: ScrollBehavior
	visualScroll: ScrollBehavior
}
export function updateItemStyle(style: Partial<StoryItemStyle>):StoryItemStyle {
	return {
		textAlignment: 'center',
		visualPos:'left',
		backgroundScroll:'fixed',
		visualScroll: 'scroll',
		...style
	}
}

export function parseGeostoryFromJson(text: string): Geostory {
	const raw = JSON.parse(text);
	const retValue = populateGeostory(raw)
	return (retValue)
}

export function parseGeostoryFromRaw(raw: any): Geostory {
	// const elements = (raw.elements || []).map((el: any) => {
	// 	const storyItems = (el.storyItems || []).map((item: any) => new StoryItem(item))
	// 	return new StoryElement(
	// 		el.order,
	// 		el.sectionTitle,
	// 		el.sectionID,
	// 		el.id,
	// 		el.style,
	// 		el.tags,
	// 		el.actions,
	// 		storyItems
	// 	)
	// })
	// const story = new Geostory({
	// 	id: raw.id,
	// 	title: raw.title,
	// 	topic: raw.topic,
	// 	scenario: raw.scenario,
	// 	language: raw.language,
	// 	target: raw.target,
	// 	exportType: raw.exportType,
	// 	author: raw.author,
	// 	timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
	// 	elements: elements
	// })
	return {} as Geostory;
}



