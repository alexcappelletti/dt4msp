import type { isExpressionWithTypeArguments, StringLiteral } from "typescript";
import { ChangeEvent } from "./changeEvent";
import { Visual } from "./visual";

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


export class Geostory {
	id: string;
	title: string;
	author?: string;
	timestamp: Date;
	elements: StoryElement[];
	sections: Map<string, Section> = new Map<string, Section>();
	topic: string;
	scenario: string;
	language: string;
	target: string;
	exportType: string;

	constructor(params: {
		id: string,
		title: string,
		topic: string,
		scenario: string,
		language: string,
		target: string,
		exportType: string,
		elements: StoryElement[],
		author?: string,
		timestamp?: Date
	}
	) {
		this.id = params.id;
		this.title = params.title;
		this.author = params.author;
		this.timestamp = params.timestamp || new Date();
		this.topic = params.topic;
		this.scenario = params.scenario;
		this.language = params.language;
		this.target = params.target;
		this.exportType = params.exportType;
		this.elements = params?.elements || [];
		this.sections = groupBySectionID(this.elements)
		console.log("numero elementi " + this.elements.length)
		console.log("numero sezioni " + this.sections.size)


	}

	getSections(): Map<string, Section> { return this.sections }
	toJson(): string {
		const plain = {
			...this,
			sections: Object.fromEntries(this.sections), // converte la Map in oggetto semplice
		};
		return JSON.stringify(plain, null, 2); // con indentazione leggibile
	}
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


export const defaultGeostory = new Geostory({
	id: 'default',
	title: '',
	topic: '',
	scenario: '',
	language: 'it',
	target: '',
	exportType: 'html',
	elements: [],
	author: '',
	timestamp: new Date()
})

export class StoryElement {
	order: number;
	sectionTitle: string;
	sectionID: string;
	id: string;
	style: string;
	tags: string[];
	actions: string[];
	storyItems: StoryItem[];

	constructor(
		order = -1,
		sectionTitle = "",
		section_id: string,
		id: string,
		style: string,
		tags: string[] = [],
		actions: string[] = [],
		storyItems: StoryItem[] = []
	) {
		this.order = order;
		this.sectionTitle = sectionTitle;
		this.sectionID = section_id;
		this.id = id;
		this.style = style;
		this.tags = tags;
		this.actions = actions;
		this.storyItems = storyItems;
	}

	addStoryItem(item: StoryItem): void {
		this.storyItems.push(item);
	}
}


export class StoryItem {
	id: string;
	title: string;
	text: string; // 
	visual: Visual | null;
	author: string;
	timestamp: Date;
	tags: string[];
	mapActions: string[];
	changes: ChangeEvent[];
	comments: string;
	////////: string; // Optional structure field
	structure: string; // Optional structure field
	style: StoryItemStyle
	constructor(p: {
		id: string,
		visual: Visual | null,
		mapActions?: string[],
		title: string,
		text: string,
		author: string,
		tags?: string[],
		comments?: string,
		structure: string,
		style?: StoryItemStyle 
	}) {
		this.id = p.id;
		this.text = p.text;
		this.title = p.title;
		this.tags = p.tags || [];
		this.author = p.author;
		this.structure = p.structure || 'undefined_structure';
		this.timestamp = new Date();
		this.mapActions = p.mapActions || [];
		this.visual = p.visual || null;
		this.comments = p.comments || '';
		this.changes = [
			new ChangeEvent(p.author, this.timestamp, "construct", null, p.text)
		];
		this.comments = p.comments || '';
		this.structure = p.structure || 'undefined_structure';
		this.tags = p.tags || [];
		this.style = p.style || new StoryItemStyle()

	}

}

export type TextAlignment = 'top' | 'center' | 'bottom' | 'justify';
export type VisualPosition = 'left' | 'right';
export type ScrollBehavior = 'fixed' | 'scroll';

export class StoryItemStyle {
	textAlignment: TextAlignment = 'center'; // Imposta un default, se serve
	visualPos: VisualPosition = 'left'; // Imposta un default, se serve
	backgroundScroll: ScrollBehavior = 'fixed';
	visualScroll: ScrollBehavior = 'fixed';
}
;

export function parseGeostoryFromJson(text: string): Geostory {
	const raw = JSON.parse(text);

	const elements = (raw.elements || []).map((el: any) => {
		const storyItems = (el.storyItems || []).map((item: any) => new StoryItem(item));
		return new StoryElement(
			el.order,
			el.sectionTitle,
			el.sectionID,
			el.id,
			el.style,
			el.tags,
			el.actions,
			storyItems
		);
	})

	return new Geostory({
		id: raw.id,
		title: raw.title,
		topic: raw.topic,
		scenario: raw.scenario,
		language: raw.language,
		target: raw.target,
		exportType: raw.exportType,
		author: raw.author,
		timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
		elements
	});
}

export function parseGeostoryFromRaw(raw: any): Geostory {
	const elements = (raw.elements || []).map((el: any) => {
		const storyItems = (el.storyItems || []).map((item: any) => new StoryItem(item))
		return new StoryElement(
			el.order,
			el.sectionTitle,
			el.sectionID,
			el.id,
			el.style,
			el.tags,
			el.actions,
			storyItems
		)
	})
	const story = new Geostory({
		id: raw.id,
		title: raw.title,
		topic: raw.topic,
		scenario: raw.scenario,
		language: raw.language,
		target: raw.target,
		exportType: raw.exportType,
		author: raw.author,
		timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
		elements: elements
	})
	return story;
}



