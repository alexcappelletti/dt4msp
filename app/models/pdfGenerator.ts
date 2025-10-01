import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import PdfPrinter from 'pdfmake';
import path from 'path';
import fs from 'fs';

import { Geostory, Section } from "./geostory";

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
		color: '#16733E'
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


export class GeostoryToPDF {
	geostory: Geostory;
	printer: PdfPrinter;
	constructor(g: Geostory) {
		this.geostory = g;
		this.printer = new PdfPrinter(fonts);
	}

	parseMixedList(input: string): any[] {
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
	buildPdfDefinition(): TDocumentDefinitions {
		const sections = Array.from(this.geostory.sections.values());
		const content: any[] = [];

		// Titolo principale
		content.push({
			text: this.geostory.title || 'Geo Story ',
			style: 'header',
			alignment: 'center',
			margin: [0, 0, 0, 20]
		});

		// Autore e data
		content.push({
			text: `Autore: ${this.geostory.author || 'N/D'} | Data: ${this.geostory.timestamp.toLocaleDateString('it-IT')}`,
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
		sections.forEach((section, idx) => {
			content.push({
				text: section.getTitle(),
				style: 'sectionTitle',
				tocItem: true,
				id: section.sectionId
			});
			section.elements.forEach((el, idx) => {
				content.push(...(this.parseMixedList(el.storyItems.at(0)?.text ?? "")))
			})
			content.push({ text: '', pageBreak: 'after' });
		});//fine della sezione


		// content.push({ text: '', margin: [0, 0, 0, 20] });

		// // Sezioni
		// sections.forEach((section, idx) => {
		// 	content.push({ text: `Sezione ${idx + 1}: ${section.getTitle()}`, style: 'sectionTitle', margin: [0, 10, 0, 6] });

		// 	section.elements.sort((a, b) => a.order - b.order).forEach((el, elIdx) => {
		// 		const item = el.storyItems[0];
		// 		if (!item) return;

		// 		content.push({
		// 			text: `Elemento ${elIdx + 1}: ${item.title}`,
		// 			style: 'itemTitle',
		// 			margin: [0, 6, 0, 2]
		// 		});

		// 		content.push({
		// 			text: item.text,
		// 			style: 'itemText',
		// 			margin: [0, 0, 0, 4]
		// 		});

		// 		content.push({
		// 			text: `Autore: ${item.author} | Data: ${item.timestamp.toLocaleDateString('it-IT')}`,
		// 			style: 'itemMeta',
		// 			margin: [0, 0, 0, 10]
		// 		});
		// 	});
		// });

		return {
			content,
			styles: localStyles,
			defaultStyle: {
				font: 'Roboto',
				alignment: 'justify'
			}
		};
	}

	async exportGeostory(): Promise<void> {
		try {
			const docDefinition = this.buildPdfDefinition();
			const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
			const filePath = path.resolve('out/geostory.pdf');
			const writeStream = fs.createWriteStream(filePath);
			pdfDoc.pipe(writeStream);
			pdfDoc.end();

			writeStream.on('finish', () => {
				console.log("downloaded!")
				//res.download(filePath, 'geostory.pdf');
			});

		}
		catch (err) {
			console.error(err);

		}


	}


}


