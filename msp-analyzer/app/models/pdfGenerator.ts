import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import PdfPrinter from 'pdfmake';
import path from 'path';
import fs from 'fs/promises';
import concat from 'concat-stream';


import { Geostory, Section, StoryElement } from "./geostory";
import type { ImageVisual } from './visual';


const VALID_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml'
]
const fonts = {
	Roboto: {
		normal: path.resolve('app/assets/fonts/Roboto-Regular.ttf'),
		bold: path.resolve('app/assets/fonts/Roboto-Medium.ttf'),
		italics: path.resolve('app/assets/fonts/Roboto-Italic.ttf'),
		bolditalics: path.resolve('app/assets/fonts/Roboto-MediumItalic.ttf')
	}
}

const localStyles: StyleDictionary = {
	header: { 
		fontSize: 24, 
		bold: true,
		color: '#16733E',
		characterSpacing: 2,

		
	},
	subheader: { fontSize: 10, italics: true },
	tocTitle: { 
		fontSize: 16, 
		bold: true, 
		color: '#16733E',
		decoration: 'underline' },
	tocEntry: { fontSize: 12 },
	sectionTitle: {
		fontSize: 20,
		lineHeight: 2,
		characterSpacing: 4,
		alignment: 'left',
		color: '#16733E',
		bold: true
	},
	itemTitle: { fontSize: 14, bold: true },
	itemText: { fontSize: 12 },
	itemMeta: { fontSize: 10, italics: true, color: '#666' }
}
async function fetchImageAsBase64(url: string): Promise<string> {
	console.log("fetiching " + url)
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Impossibile scaricare l'immagine da ${url} - Status: ${response.status}`)
	}
	const contentType = response.headers.get('content-type')?.split(';')[0] || ''

	if (!VALID_IMAGE_TYPES.includes(contentType)) {
		throw new Error(`Tipo MIME non supportato: ${contentType}`)
	}

	const arrayBuffer = await response.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	if (buffer.length > 5 * 1024 * 1024) {
		throw new Error('Immagine troppo grande')
	}

	return `data:${contentType};base64,${buffer.toString('base64')}`
}


export class GeostoryToPDF {
	currentGeostory: Geostory = {} as Geostory;
	printer: PdfPrinter;
	constructor() {
		this.printer = new PdfPrinter(fonts);
	}	

	private parseMixedList(input: string): any[] {
		const listRegex = /\\list\{([^}]+)\}/g;
		const parts: any[] = [];
		let lastIndex = 0;
		let match;
		while ((match = listRegex.exec(input)) !== null) {
			const before = input.slice(lastIndex, match.index).trim();
			if (before) {
				parts.push({ text: before, margin: [0, 0, 0, 6] });
			}
			const rawList = match[1];
			if (rawList && typeof rawList === 'string') {
				const items = rawList.split(';').map(item => item.trim()).filter(Boolean);
				if (items.length > 0) {
					parts.push({
						ul: items,
						margin: [0, 0, 0, 10]
					});
				}
			}
			lastIndex = match.index + match[0].length;
		}
		const remaining = input.slice(lastIndex).trim();
		if (remaining) {
			parts.push({ text: remaining, margin: [0, 0, 0, 10] });
		}
		return parts;
	}

	private async parseImage(element: StoryElement): Promise<Array<any>> {
		const visual = element.storyItems[0]?.visual ?? {} as ImageVisual;
		const imageUrl = visual?.format === 'IMAGE'
				? (visual as ImageVisual).imageUrl
				: undefined
		if (imageUrl === undefined){return []}
		try {
			//console.log("loading image:  " + imageUrl)
			const base64 = await fetchImageAsBase64(imageUrl)
			return [{
				image: base64,
				width: 400,
				alignment: 'center',
				margin: [0, 10, 0, 10]
			}]
		} catch (err) {
			console.warn(`Errore nel caricamento immagine: ${imageUrl}`, err)
		}
		return [{
				text: 'Immagine non disponibile',
				italics: true,
				alignment: 'center',
				color: 'gray',
				margin: [0, 10, 0, 10]
			}]
	}
	private async buildSectionsContent(sections: Array<Section>){
		const contentChunks = await Promise.all(
			sections.map(async (section) =>{
				const chunk = []
				chunk.push({
					text: section.getTitle(),
					style: 'sectionTitle',
					tocItem: true,
					id: section.sectionId
				});
				const elementChunks = await Promise.all(
					section.elements.map(async (el) => {	
						const storyText = el.storyItems.at(0)?.text ?? "";
						const parsedText = this.parseMixedList(storyText);
						const parsedImages = await this.parseImage(el);
						return [...parsedText, ...parsedImages];
					})
				) //inner p.all loop - element
				elementChunks.forEach(elChunk => chunk.push(...elChunk));
      			chunk.push({ text: '', pageBreak: 'after' });
			    return chunk;
    		})
		); //outer p.all - section
		return contentChunks.flat()
	}


	private async buildPdfDefinition(): Promise<TDocumentDefinitions> {
		const sections = Array.from(this.currentGeostory.sections.values());
		const content: any[] = [];

		// Titolo principale
		content.push({
			text: (this.currentGeostory.title || 'unknown title').toUpperCase(),
			style: 'header',
			alignment: 'center',
			margin: [0, 0, 0, 20]
		});

		// Autore e data
		content.push({
			text: `Autore: ${this.currentGeostory.author || 'N/D'} | Data: ${this.currentGeostory.timestamp.toLocaleDateString('it-IT')}`,
			style: 'subheader',
			alignment: 'center',
			margin: [0, 0, 0, 30]
		});

		// Sommario
		content.push({
			toc: {
				title: { text: 'Sommario', style: 'tocTitle' },
				numberStyle: { bold: true },
				margin: [0, 0, 0, 10],
				
			},
			pageBreak: 'after'
		});
		//sezioni 
		content.push(...(await(this.buildSectionsContent(sections))))
		return {
			content,
    		styles: localStyles,
    		defaultStyle: {
      			font: 'Roboto',
      			alignment: 'justify'
    		}
		}
	}

	async exportGeostory(geostory: Geostory): Promise<Buffer> {
		try {
			if (geostory.title === undefined) {
				console.warn("trying to export an empty geostory")
				return Buffer.from("")
			}
			this.currentGeostory = geostory;

			const docDefinition = await this.buildPdfDefinition();
			const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
			const buffer = await new Promise<Buffer>((resolve, reject) =>{
				pdfDoc.pipe(concat(resolve))
				pdfDoc.on("error", reject);
				pdfDoc.end();
				console.log("pdf created!")
			})
			await fs.writeFile('out/geostory.pdf', buffer);
			return buffer;

		}
		catch (err) {
			console.error(err);

		}
		return Buffer.from("")
	}
}


