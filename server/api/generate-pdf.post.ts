import { readBody } from 'h3'
//import PdfPrinter from 'pdfmake'
import path from 'path'
import fs from 'fs'
import concat from 'concat-stream'
//import type { TDocumentDefinitions as IDocumentDefinition, Style } from 'pdfmake/interfaces'
import { Geostory, StoryElement, parseGeostoryFromRaw } from '@/models/geostory'
import { ImageVisual } from '~/models/visual'
import { GeostoryToPDF } from '@/models/pdfGenerator'

const generator = new GeostoryToPDF();

export default defineEventHandler(async (event) => {
	try {
		const story = parseGeostoryFromRaw(
			await readBody(event)) 
		await generator.exportGeostory(story);
// 		const printer = new PdfPrinter(fonts)
// 		event.node.res.setHeader('Content-Type', 'application/pdf')
// 		event.node.res.setHeader('Content-Disposition', 'attachment; filename=alex.pdf')
// 		const docDefinition: IDocumentDefinition = {
// 			content: [
// 				{
// 					table:
// 					{
// 						widths: ['*'],
// 						body: [
// 							[
// 								{
// 									text: story.title,
// 									style: 'header',
// 									alignment: 'center',
// 									textTransform: 'uppercase',
// 									color: '#ffffff',
// 									margin: [0, 12, 0, 12] // padding verticale
// 								}
// 							]
// 						]
// 					},
// 					layout: {
// 						hLineWidth: () => 0, // nessuna linea orizzontale
// 						vLineWidth: () => 0, // nessuna linea verticale
// 						paddingLeft: () => 0, // nessun padding a sinistra
// 						paddingRight: () => 0, // nessun padding a destra
// 						fillColor: () => '#3a91d8' // blu profondo
// 					},
// 					margin: [0, 0, 0, 20], // margine esterno sotto il titolo
// 				},

// 				{
// 					text: `Autore: ${story.author}`,
// 					style: 'subheader',
// 					pageBreak: 'after'
// 				},
// 				{
// 					text: `Scenario: ${story.scenario}`,
// 					style: 'subheader',
// 					fontSize: 15,
// 					pageBreak: "after",
// 					margin: [0, 20]
// 				},
// 				{
// 					toc: {
// 						title: { text: 'Indice', style: 'tocTitle', alignment: 'center' },
// 						numberStyle: 'tocNumber'
// 					},
// 					pageBreak: 'after'
// 				},
// 				...await generateStorySections(story.elements)
// 			].flat(),
// 			styles: {
// 				header: getHeaderStyle(),
// 				subheader: {
// 					color: '#3a91d8',
// 					fontSize: 12,
// 					italics: true
// 				},
// 				sectionTitle: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
// 			},
// 			defaultStyle: {
// 				font: 'Roboto'
// 			}
// 		}

// 		//console.log(JSON.stringify(docDefinition))
// 		const pdfDoc = printer.createPdfKitDocument(docDefinition)
// 		const buffer = await new Promise<Buffer>((resolve, reject) => {
// 			pdfDoc.pipe(concat(resolve))
// 			pdfDoc.on('error', reject)
// 			pdfDoc.end()
// 		})
// 		console.log("done")
// 		event.node.res.setHeader('Content-Type', 'application/pdf')
// 		event.node.res.setHeader('Content-Disposition', 'inline; filename=geostory.pdf')
// 		event.node.res.end(buffer)
	} catch (error) {
		console.log(error)
		console.error("pdf generation task error: " + error)

 	}
})



