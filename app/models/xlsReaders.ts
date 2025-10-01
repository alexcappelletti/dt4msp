import * as XLSX from 'xlsx';
import { Geostory, defaultGeostory, StoryElement, StoryItem } from './geostory';

import { Scenario, Theme, MapLayer, Impact } from '@/models/scenario';
import { ImageVisual, MapVisual, Visual } from './visual';
import { log } from 'handlebars';

export class GeostoryXlsxReader {
	workbook: XLSX.WorkBook | null = null;
	constructor(wksb?: XLSX.WorkBook) {
		if (wksb) {
			this.workbook = wksb
		}

	}

	///estra i nomi dei campi che sono contenuti nella prima colonna del foglio feature
	/**
	 * Trasforma un foglio Excel in un oggetto JSON
	 * dove ogni riga è una coppia chiave-valore.
	 * @param sheet Il foglio da elaborare.
	 * @returns Un oggetto JSON con chiavi dalla colonna A e valori dalla colonna B.
	 */
	sheetToKeyValueJson(sheet: XLSX.WorkSheet): Record<string, string> {
		const range = XLSX.utils.decode_range(sheet['!ref'] || '');
		const result: Record<string, string> = {};
		for (let row = range.s.r; row <= range.e.r; row++) {
			const keyCellRef = XLSX.utils.encode_cell({ c: 0, r: row }); // colonna A
			const valueCellRef = XLSX.utils.encode_cell({ c: 1, r: row }); // colonna B
			const keyCell = sheet[keyCellRef];
			const valueCell = sheet[valueCellRef];
			const key = keyCell?.v !== undefined ? String(keyCell.v).trim() : '';
			const cleanedKey = key?.trim().toLowerCase().replace(/\s+/g, '_');
			const value = valueCell?.v !== undefined ? String(valueCell.v).trim() : '';
			if (!cleanedKey || cleanedKey.trim() === '') { continue; }
			if (value !== undefined && value.trim() !== '') {
				result[cleanedKey] = value;
			}
		}
		return result;
	}

	private extractTags(itemTag?: string): string[] {
		if (!itemTag) return [];
		return itemTag
			.split(/[\r\n]+/) // divide su CR, LF, o CRLF
			.map(tag => tag.trim()) // rimuove spazi extra
			.filter(tag => tag.startsWith('#'))
			.map(tag => tag.slice(1)); // rimuove il simbolo #
	}

	private getVisual(row: Record<string, any>): Visual | null {
		if (!row.visual) return null;
		//console.log("visual type:" + row.visual.substring(0, 10))
		if (row.visual.startsWith('img:')) {
			const imgUrl = row.visual.split('img:')[1].split(';')[0].trim();
			const altText = row.visual.includes('alt:') ? row.visual.split('alt:')[1].trim() : undefined;
			return new ImageVisual(imgUrl, altText);
		} else if (row.visual.startsWith('map:')) {
			const params = row.visual.split('map:')[1].split(';');
			const wfsUrl = params[0].trim();
			const layerName = params[1]?.trim();
			const zoomLevel = params[2] ? parseInt(params[2].trim(), 10) : undefined;
			return new MapVisual(wfsUrl, layerName, zoomLevel);
		}
		
		return null;
	}

	public loadGeoStory(): Geostory {
		if (!this.workbook) {
			throw new Error('Nessun workbook caricato. Fornire un file Excel valido.');
		}
		const sheetName = this.workbook.SheetNames[0];
		const featuresSheet = this.workbook.Sheets["features"];
		const storySheet = this.workbook.Sheets["story"];

		if (!storySheet) {
			throw new Error('Foglio "story" non trovato nel file Excel.');
		}
		if (!featuresSheet) {
			throw new Error('Foglio "features" non trovato nel file Excel.');
		}

		const rows = XLSX.utils.sheet_to_json<Record<string, any>>(storySheet);
		const features = this.sheetToKeyValueJson(featuresSheet);
		const storyElements = rows.map((row, index) => {
			const storyItem = new StoryItem({
				id: row.item_id || `item-${index + 1}`,
				title: row.item_title || 'Unknown title',
				author: row.author || 'Unknown',
				structure: row.structure || 'undefined_structure',
				text: row.text || '',
				tags: this.extractTags(row.item_tags),
				mapActions: row.map_actions ? row.map_actions.split(/\s+/) : [],
				comments: row.comment || '',
				visual: this.getVisual(row) || null,
			})
			



			const storyElement = new StoryElement(
				Number(row.order) || index,
				row.title || '',
				row.section_id || "-",
				row.id || `element-${index + 1}`,
				row.structure || 'undefined_structure',
				this.extractTags(row.item_tags),
				row.map_actions ? row.map_actions.split(/\s+/) : [],
				[storyItem]
			);

			//const visual = 




			return storyElement
			// const visual = row.visual?.startsWith('img:')
			// 	? {
			// 		img: row.visual.split('img:')[1].split(';')[0].trim(),
			// 		alt: row.visual.includes('alt:') ? row.visual.split('alt:')[1].trim() : undefined,
			// 		img_style: row.img_style || undefined,
			// 	}
			// 	: null;

			// return {
			// 	order: Number(row.order) || index + 1,
			// 	section_title: row.section_title || '',
			// 	item_id: row.item_id || '',
			// 	item_tag: row.item_tag ? row.item_tag.split(/\s+/).filter(tag => tag.startsWith('#')) : [],
			// 	item_title: row.item_title || '',
			// 	structure: row.structure || '',
			// 	data: row.data || null,
			// 	visual,
			// 	map_actions: row.map_actions || null,
			// 	comment: row.comment || '',
			// 	editing_history: row.editing_history || '',
			// };
		});


		const readingGeostory = new Geostory({
			id: features["geostory_id"] || 'geostory-1',
			title: features["geostory_title"] || 'My Geostory',
			scenario: features["scenario"] || 'Unknown scenario',
			topic: features["topic"] || 'Unknown topic',
			language: features["language"] || 'Unknown language',
			target: features["target"] || 'Unknown target',
			exportType: (features["export_type"] || 'Unknown export type').toLowerCase(),
			elements: storyElements as StoryElement[],
			author: features["editors"] || 'Unknown author',
		});


		return readingGeostory;




	}

	public exportToJson(outputPath: string): void {
		// const storyElements = this.convert();
		// fs.writeFileSync(outputPath, JSON.stringify(storyElements, null, 2), 'utf-8');
		console.log(`✅ StoryElements salvati in ${outputPath}`);
	}
}






export class ScenarioXlsxReader {
	workbook: XLSX.WorkBook | null = null;
	constructor(wkb?: XLSX.WorkBook) {
		if (wkb) {
			this.workbook = wkb
		}

	}

	public readScenario(): Scenario {
		if (!this.workbook) {
			throw new Error('Nessun workbook caricato. Fornire un file Excel valido.')
		}
		const metadataSheet = this.workbook.Sheets['metadata']
		if (!metadataSheet) {
			throw new Error(`Foglio "metadata" non trovato nel file Excel.`)
		}

		const raw = XLSX.utils.sheet_to_json(metadataSheet, { header: 1 }) as string[][]
		const metadata: Record<string, string> = {}

		for (const row of raw) {
			const [key, value] = row
			if (key && value) {
				metadata[key.trim()] = value.toString().trim()
			}
		}
		const themes = this.readThemesFromSheet()

		const splitList = (str?: string): string[] =>
			str ? str.split(';').map(s => s.trim()).filter(Boolean) : []


		const geostories: Geostory[] = splitList(metadata['geostories']).map((title, i) =>
			new Geostory({
				...{ id: `gs-${i + 1}`, title },
				...defaultGeostory
			})
		)

		return new Scenario({
			id: metadata['id'] || 'scenarioSoS_bd',
			name: metadata['scenario_name'] || 'Unnamed Scenario',
			generalDescription: metadata['general_description'] || '',
			narrative: metadata['narrativa'] || '',
			temporalScope: metadata['orizzonte_temporale'] || '',
			maps: splitList(metadata['map(s)']),
			datasets: splitList(metadata['datasets']),
			extendedAspects: metadata['extended aspects'] || '',
			availableThemes: themes,
			definedGeostories: geostories,
			objectives: metadata['narrativa'] || ''
		})
	}

	readImpactFromSheet(themeSheetName:string): Impact[] {
		if (!this.workbook) {
			throw new Error('Nessun workbook caricato. Fornire un file Excel valido.')
		}
		const sheet = this.workbook.Sheets[themeSheetName]
		if (!sheet) {
			throw new Error(`Foglio impatti ${themeSheetName} relativo al tema non trovato nel file Excel.`)
		}
		const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[]
		const impacts: Impact[] =
			rows.filter(row => {
				const values = [row.pr, row.description, row.layers, row["impact_on_theme"]]
				return values.some(v => v && v.toString().trim() !== '')
			})
				.map((row, i) => {
					const rawLayers = row.layers || ''
					const layerNames = rawLayers
						.split(/[\n;]+/)
						.map(l => l.trim())
						.filter(l => l && l !== 'NA')

					const layers: MapLayer[] = layerNames.map((name: string, idx: number) => new MapLayer({
						id: `${row.pr || 'impact'}_layer_${idx + 1}`,
						name,
						type: 'undefined',
						url: '',
						workspace: '',
						layerName: name,
						description: '',
						legendUrl: '',
						thumbnailUrl: ''
					}))

					return new Impact({
						impactID: row.pr || `impact_${i + 1}`,
						impactName: row.description || `Impatto ${i + 1}`,
						impactOnTheme: row["impact_on_theme"] || 'NA',
						description: `Impatto: ${row.description || `Impatto ${i + 1}`}`,
						layersInvolved: layers
					})
				})
		return impacts
	}

	readThemesFromSheet(): Theme[] {
		if (!this.workbook) {
			throw new Error('Nessun workbook caricato. Fornire un file Excel valido.')
		}
		const sheet = this.workbook.Sheets['temi']
		if (!sheet) {
			throw new Error('Foglio "temi" non trovato nel file Excel.')
		}
		const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[]

		const themes: Theme[] = rows
			.filter(row => {
				const values = [row.nome, row.theme_id, row.type, row['layers/risorsa geospaziale']]
				return values.some(v => v && v.toString().trim() !== '')
			})
			.map((row, i) => {
				const rawLayers = row['layers/risorsa geospaziale'] || ''
				const layerNames = rawLayers
					.split(/[\n;]+/)
					.map(l => l.trim())
					.filter(l => l && l !== 'NA')
				const geospatialResources: MapLayer[] = layerNames.map((name, idx) => new MapLayer({
					id: `${row.theme_id || 'theme'}_layer_${idx + 1}`,
					name,
					type: 'undefined',
					url: '',
					workspace: '',
					layerName: name,
					description: '',
					legendUrl: '',
					thumbnailUrl: ''
				}))
				const t = new Theme({
					id: row.nome || `theme_${i + 1}`,
					theme_id: row.theme_id || `Tema ${i + 1}`,
					type: row.type || 'NA',
					description: `Tema: ${row.nome || `Tema ${i + 1}`}`,
					geospatialResources: geospatialResources,
					impacts: [] // verrà popolato dopo (per evitare dipendenze circolari
				})
				try {
					const impacts: Impact[] = this.readImpactFromSheet(t.theme_id)
					t.impacts = Object.fromEntries(
						impacts.map(i => [i.impactID, i]))
				} catch (error) {
					console.warn(`⚠️ Impossibile leggere gli impatti per il tema ${row.theme_id}`)
					//console.error(error)
				}
				console.log(`✅ Tema caricato: ${t.theme_id} con ${t.geospatialResources.length} risorse e ${t.impacts.length} impatti.`)
				return t
			})

		return themes
	}


}