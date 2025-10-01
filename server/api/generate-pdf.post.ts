import { readBody } from 'h3'
//import PdfPrinter from 'pdfmake'
import path from 'path'
import fs from 'fs'
import concat from 'concat-stream'
//import type { TDocumentDefinitions as IDocumentDefinition, Style } from 'pdfmake/interfaces'
import { Geostory, StoryElement, parseGeostoryFromRaw } from '@/models/geostory'
import { ImageVisual } from '~/models/visual'
import { GeostoryToPDF } from '@/models/pdfGenerator'

// const fonts = {
// 	Roboto: {
// 		normal: path.resolve('fonts/Roboto-Regular.ttf'),
// 		bold: path.resolve('fonts/Roboto-Medium.ttf'),
// 		italics: path.resolve('fonts/Roboto-Italic.ttf'),
// 		bolditalics: path.resolve('fonts/Roboto-MediumItalic.ttf')
// 	}
// }


export default defineEventHandler(async (event) => {
	try {
		const story = parseGeostoryFromRaw(
			await readBody(event)) 
		const generator = new GeostoryToPDF(story);
		await generator.exportGeostory();
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




async function generateStorySections(elements: StoryElement[]) {
	const sections = await Promise.all(
		elements.map(async (el) => {
			const item = el.storyItems[0]
			const imageUrl = item?.visual?.format === 'IMAGE'
				? (item.visual as ImageVisual).imageUrl
				: undefined

			return await createSection(el.sectionTitle, item?.text || '', imageUrl)
		})
	)

	return sections

}

async function createSection(
	title: string,
	text: string,
	imageUrl?: string
) {
	const sectionContent: any[] = [
		{
			text: text || 'Contenuto non disponibile',
			margin: [0, 0, 0, 10]
		}
	]

	if (imageUrl) {
		try {
			const base64 = await fetchImageAsBase64(imageUrl)
			sectionContent.push({
				image: base64,
				width: 400,
				alignment: 'center',
				margin: [0, 10, 0, 10]
			})
		} catch (err) {
			console.warn(`Errore nel caricamento immagine: ${imageUrl}`, err)
			sectionContent.push({
				text: 'Immagine non disponibile',
				italics: true,
				alignment: 'center',
				color: 'gray',
				margin: [0, 10, 0, 10]
			})
		}
	}

	return [
		{
			text: title,
			style: 'sectionTitle',
			
		},
		{
		stack: sectionContent,
		pageBreak: 'after'
	}]
}



function getHeaderStyle(): Style {
	return {
		fontSize: 26,
		bold: true,
		alignment: 'center',
		characterSpacing: 1.5,
		textTransform: 'uppercase'
	} as Style

}

const VALID_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml'
]

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
