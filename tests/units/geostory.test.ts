import { describe, test, expect, it } from "vitest";
import { ChangeEvent } from "@/models/changeEvent";
import { Geostory, StoryElement, StoryItem } from "@/models/geostory";

describe.skip("Geostory system", () => {
	const now = new Date();

	test("should create a StoryItem with initial change", () => {
		const item = new StoryItem("item1", "Hello world", "Alice", now);
		expect(item.id).toBe("item1");
		expect(item.content).toBe("Hello world");
		expect(item.changes.length).toBe(1);
		expect(item.changes[0].what).toBe("construct");
	});

	test("should update content and track changes", () => {
		const item = new StoryItem("item2", "Initial", "Bob", now);
		item.updateContent("Updated", "Charlie");
		expect(item.content).toBe("Updated");
		expect(item.changes.length).toBe(2);
		expect(item.changes[1].what).toBe("content");
		expect(item.changes[1].changedBy).toBe("Charlie");
	});

	test("should add StoryItem to StoryElement", () => {
		const item = new StoryItem("item3", "Visual content", "Dana", now);
		const element = new StoryElement("element1", "default");
		element.addStoryItem(item);
		expect(element.storyItems.length).toBe(1);
		expect(element.storyItems[0].id).toBe("item3");
	});

	test("should create Geostory and add elements", () => {
		const item = new StoryItem("item4", "Geo content", "Eve", now);
		const element = new StoryElement("element2", "map");
		element.addStoryItem(item);

		const geo = new Geostory("geo1", "My Geostory", "Eve", now, 46.07, 11.12);
		geo.addElement(element);

		expect(geo.title).toBe("My Geostory");
		expect(geo.getLocation()).toBe("Lat: 46.07, Lon: 11.12");
		expect(geo.elements.length).toBe(1);
		expect(geo.elements[0].id).toBe("element2");
	});

	

	it("should create a json version on disk", ()=>{



		// Crea una geostoria di esempio
		const geostory = new Geostory({
			id: 'geo001',
			title: 'Storia del Trentino',
			topic: 'ambiente',
			scenario: 'scenarioSoS_bd',
			language: 'it',
			target: 'pubblico',
			exportType: 'json',
			author: 'alex',
		})

		// Crea un elemento narrativo
		const element = new StoryElement(
			0,
			'Introduzione',
			'el001',
			'default',
			['ambiente'],
			['zoom'],
			[]
		)

		// Crea un item narrativo
		const item = new StoryItem({
			id: 'item001',
			title: 'Il paesaggio alpino',
			text: 'Descrizione delle valli e delle montagne del Trentino.',
			author: 'alex',
			visual: new Visual('image001.jpg', 'immagine'),
			tags: ['montagna', 'valle'],
			structure: 'paragrafo',
		})

		// Aggiunge l’item all’elemento e l’elemento alla geostoria
		element.addStoryItem(item)
		geostory.addElement(element)
		const filePath = './out/geostory.json'
	})

})
