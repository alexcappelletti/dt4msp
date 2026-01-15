import { describe, beforeAll,beforeEach, expect, it } from "vitest";
import { readFileSync, writeFileSync } from 'fs'
import type {Geostory, StoryElement, StoryItem,} from '../../app/models/geostory'
import {populateGeostory, populateStoryElement, populateStoryItem, updateItemStyle} from "../../app/models/geostory";
import type { Scenario } from '../../app/models/scenario';
import { ImageVisual } from "../../app/models/visual";

import { createSOSMockGeostory } from '../mocks/bd-geostory-mock'
import { format } from "path";







describe('StoryItem class', () => {
	const mockVisual: ImageVisual = {
		imageUrl: ""
	}  

	const baseItemProps: Partial<StoryItem> = {
		id: 'story-001',
		text: 'C’era una volta...',
		title: 'Fiaba di prova',
		author: 'alex',
		visual: mockVisual,
		structure: 'linear',
		comments: 'sample comment',
	}

	it('should initialize with required fields', () => {
		const item = populateStoryItem(baseItemProps)
		expect(item.id).toBe(baseItemProps.id)
		expect(item.text).toBe(baseItemProps.text)
		expect(item.title).toBe(baseItemProps.title)
		expect(item.author).toBe(baseItemProps.author)
		expect(item.visual).toEqual(mockVisual)
		expect(item.structure).toBe('linear')
		expect(item.comments).toBe(baseItemProps.comments)
		expect(item.tags).toEqual([])
		expect(item.mapActions).toEqual([])
		expect(item.timestamp).toBeInstanceOf(Date)
	})

})



describe("Geostory with BD scenario ", () => {
	const scenarioFile = "./public/data/scenario_bd-v0_02.json";
	const outFile = "./public/data/geostorySOS-BD.json"
	let scenario: Scenario;
	let sampleGeostory = createSOSMockGeostory();
	beforeAll(async () => {
		scenario = JSON.parse(readFileSync(scenarioFile, 'utf-8')) as Scenario
		sampleGeostory.scenario = scenario.name;
	})
	const now = new Date();

	it("should set an empty GS", () => {
		const emptyGS = populateGeostory({} as Geostory)
		expect(emptyGS.id).toBeDefined()
		expect(emptyGS.title).toBe("")
		expect(emptyGS.timestamp.getTime()).toBeGreaterThan(0)
		expect(emptyGS.elements.length).toBe(0)
		expect(emptyGS.sections).toBeDefined()
		expect(emptyGS.exportType).toBe("pdf")
	})

	it('should test sample geostory', () => {
		expect(sampleGeostory.id).toBeDefined();
		expect(sampleGeostory.title).toBeDefined();
		expect(sampleGeostory.scenario).toBe(scenario.name);
		expect(sampleGeostory.timestamp.getTime()).toBeGreaterThan(0)
		expect(sampleGeostory.elements.length).toBe(15)
		expect(sampleGeostory.sections.size).toBe(7)
		expect(sampleGeostory.sections.get('sezione-introduzione')?.elements.length).toBe(1);
		expect(sampleGeostory.sections.get('sezione-temi')?.elements.length).toBe(8);
		expect(sampleGeostory.sections.get('sezione-impatti')?.elements.length).toBe(1);

	})

	it('Ogni StoryElement deve contenere esattamente uno StoryItem', () => {
		expect(sampleGeostory.elements.length).toBeGreaterThan(0);
		sampleGeostory.elements.forEach((e: StoryElement, index: number) => {
			expect(e.storyItems.length).toBe(1);
			if (e.storyItems.length !== 1) {
				console.error(`Errore nell'elemento a indice ${index} (ID: ${e.id}): si aspettava 1 storyItem, ne ha trovati ${e.storyItems.length}`);
			}
		});
	});

	it("should read sampleGS and fix sections", () => {
		expect(sampleGeostory.sections.size).toBe(7)
		const underTest = JSON.parse(readFileSync(outFile, 'utf-8')) as Geostory
		expect(underTest.elements.length).toBe(15)
		expect(sampleGeostory.timestamp.getTime()).toBeGreaterThan(0)
		expect(underTest.sections).toEqual({})
		const afterUpdate = populateGeostory(underTest)
		expect(afterUpdate.id).toBe(sampleGeostory.id)
		expect(afterUpdate.sections.size).toBe(7)
	})

	it("should save and read sampleGS", () => {
		writeFileSync(outFile, JSON.stringify(sampleGeostory, null, 4), 'utf-8')
		const underTest = populateGeostory(
			JSON.parse(readFileSync(outFile, 'utf-8')) as Geostory)
		expect(underTest.id).toBeDefined();
		expect(underTest.title).toBeDefined();
		expect(underTest.scenario).toBe(scenario.name);
		expect(underTest.elements.length).toBe(15)
		expect(underTest.sections.size).toBe(7)

		expect(underTest.sections.get('sezione-introduzione')?.elements.length).toBe(1);
		expect(underTest.sections.get('sezione-temi')?.elements.length).toBe(8);
		expect(underTest.sections.get('sezione-impatti')?.elements.length).toBe(1);

	})

	// test("should create a StoryItem with initial change", () => {
	// 	const item = new StoryItem("item1", "Hello world", "Alice", now);
	// 	expect(item.id).toBe("item1");
	// 	expect(item.content).toBe("Hello world");
	// 	expect(item.changes.length).toBe(1);
	// 	expect(item.changes[0].what).toBe("construct");
	// });

	// test("should update content and track changes", () => {
	// 	const item = new StoryItem("item2", "Initial", "Bob", now);
	// 	item.updateContent("Updated", "Charlie");
	// 	expect(item.content).toBe("Updated");
	// 	expect(item.changes.length).toBe(2);
	// 	expect(item.changes[1].what).toBe("content");
	// 	expect(item.changes[1].changedBy).toBe("Charlie");
	// });

	// test("should add StoryItem to StoryElement", () => {
	// 	const item = new StoryItem("item3", "Visual content", "Dana", now);
	// 	const element = new StoryElement("element1", "default");
	// 	element.addStoryItem(item);
	// 	expect(element.storyItems.length).toBe(1);
	// 	expect(element.storyItems[0].id).toBe("item3");
	// });

	// test("should create Geostory and add elements", () => {
	// 	const item = new StoryItem("item4", "Geo content", "Eve", now);
	// 	const element = new StoryElement("element2", "map");
	// 	element.addStoryItem(item);

	// 	const geo = new Geostory("geo1", "My Geostory", "Eve", now, 46.07, 11.12);
	// 	geo.addElement(element);

	// 	expect(geo.title).toBe("My Geostory");
	// 	expect(geo.getLocation()).toBe("Lat: 46.07, Lon: 11.12");
	// 	expect(geo.elements.length).toBe(1);
	// 	expect(geo.elements[0].id).toBe("element2");
	// });


	// it("should create a json version on disk", ()=>{



	// 	// Crea una geostoria di esempio
	// 	const geostory = populateGeostory({
	// 		id: 'geo001',
	// 		title: 'Storia del Trentino',
	// 		topic: 'ambiente',
	// 		scenario: 'scenarioSoS_bd',
	// 		language: 'it',
	// 		target: 'pubblico',
	// 		exportType: 'json',
	// 		author: 'alex',
	// 	} as Geostory)

	// 	// Crea un elemento narrativo
	// 	const element = new StoryElement(
	// 		0,
	// 		'Introduzione',
	// 		'el001',
	// 		'default',
	// 		['ambiente'],
	// 		['zoom'],
	// 		[]
	// 	)

	// 	// Crea un item narrativo
	// 	const item = new StoryItem({
	// 		id: 'item001',
	// 		title: 'Il paesaggio alpino',
	// 		text: 'Descrizione delle valli e delle montagne del Trentino.',
	// 		author: 'alex',
	// 		visual: new Visual('image001.jpg', 'immagine'),
	// 		tags: ['montagna', 'valle'],
	// 		structure: 'paragrafo',
	// 	})

	// 	// Aggiunge l’item all’elemento e l’elemento alla geostoria
	// 	element.addStoryItem(item)
	// 	geostory.addElement(element)
	// 	const filePath = './out/geostory.json'
	// })

})


describe('geostory habitat and animals', () => {
	const habitatFile = "./public/data/habitat_e_animali.json";
	let geostoryUnderTest: Geostory;

	beforeAll(() => {
		const raw = JSON.parse(readFileSync(habitatFile, 'utf-8')) as Geostory
		geostoryUnderTest = populateGeostory(raw);
	});

	it("should load habitat and animals geostory", () => {
		expect(geostoryUnderTest.id).toBeDefined();
		expect(geostoryUnderTest.title).toBe('Animali e habitat');
		expect(geostoryUnderTest.elements.length).toBe(32);
		expect(geostoryUnderTest.sections.size).toBe(8);


		//expect(geostoryUnderTest.sections.get('animali_e_habitat')?.elements.length).toBe(1);
		expect(geostoryUnderTest.sections.get('ambiente_4')?.elements.length).toBe(5);
		expect(
			geostoryUnderTest.sections.get('ambiente_4')?.elements[3]
				?.storyItems[0]?.title,
		).toBe('piante_della_savana');

		expect(geostoryUnderTest.sections.get('ambiente_4')
			?.elements[3]
			?.storyItems[0]
			?.title).toBe("piante_della_savana");
			expect(
				geostoryUnderTest.sections.get('ambiente_4')?.elements[3]
					?.id,
			).toBeDefined();
		//expect(geostoryUnderTest.sections.get('ambiente_2')?.length).toBe(1);

	});
});	