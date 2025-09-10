// geoStoryLoader.test.ts
import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { GeostoryXlsxReader } from '@/models/xlsReaders';
import { ImageVisual } from '@/models/visual';
import { read } from 'xlsx';

describe('GeoStory Loader', () => {
	const filePath = path.resolve(__dirname, "../../public/data/np_geostory2025-08-25.xlsx");
	const workbook = read(fs.readFileSync(filePath))
	const reader = new GeostoryXlsxReader(workbook);
	const geoStory = reader.loadGeoStory();
	
	it('carica una GeoStory con 15 elementi e il primo ha un visual definito', async () => {
		

		expect(geoStory).toHaveProperty('elements');
		expect(Array.isArray(geoStory.elements)).toBe(true);
		expect(geoStory.elements.length).toBe(15);

		const firstElement = geoStory.elements[0];
		expect(firstElement).toHaveProperty('storyItems');
		expect(Array.isArray(firstElement?.storyItems)).toBe(true);
		expect(firstElement?.storyItems.length).toBeGreaterThan(0);

		const firstItem = firstElement?.storyItems[0];
		expect(firstItem).toHaveProperty('visual');
		expect(firstItem?.visual).toBeDefined();
	});

	it("verifica la lettura di immagini per elemento 2 e 3", ()=>{
		const el2 = geoStory.elements[2]
		expect(el2).toBeDefined();
		expect(el2?.storyItems[0]?.visual).toBeDefined();
		expect(el2?.storyItems[0]?.visual?.contentType).toBe("image/jpeg")
			 
	})

	it("mostra i titoli dei elemeenti raggruppati per titolo sezione e ordine", ()=>{
		const sections = geoStory.getSections()
		expect(sections).toBeDefined()
		console.log("Sections: ", Array.from(sections.keys()))
		expect(sections.size).toBe(4)
		expect(sections.get("title")).toBeDefined()
		expect(sections.get("introduction")?.elements.length).toBe(6)
		const storyElement = sections.get("introduction")?.elements[0]
		expect(storyElement).toBeDefined()
		expect(storyElement?.storyItems.length).toBe(1)	
		expect(storyElement?.storyItems[0]?.title).toBe("scenario_def")
		
	});
	// it('carica una GeoStory con 14 elementi e il primo ha un visual di tipo ImageVisual', async () => {
	// 	const workbook = read(fs.readFileSync(filePath))
	// 	const reader = new GeostoryXlsxReader(workbook);
	// 	const geoStory = reader.loadGeoStory();

	// 	const firstElement = geoStory.elements[0];
	// 	const firstItem = firstElement?.storyItems[0];
	// 	expect(firstItem?.text).toBeDefined();
	// 	expect(firstItem?.text).contains("Scenario 3: Blue Development (BD) ");


	// 	expect(firstItem?.visual).toBeInstanceOf(ImageVisual);
	// 	expect(firstItem?.visual).toHaveProperty('format', 'IMAGE');
	// 	expect(firstItem?.visual?.getUrl()).toBeDefined();

	// });

	// it('should have export type set to pdf', async () => {
	// 	const workbook = read(fs.readFileSync(filePath))
	// 	const reader = new GeostoryXlsxReader(workbook);
	// 	const geoStory = reader.loadGeoStory();

	// 	expect(geoStory).toBeDefined();
	// 	expect(geoStory.exportType).toBe('pdf'); // oppure usa il percorso corretto se è annidato
	// });

});
