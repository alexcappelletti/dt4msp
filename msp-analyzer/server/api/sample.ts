import { readBody } from 'h3'
import PdfPrinter from 'pdfmake'
import path from 'path'
import concat from 'concat-stream'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { defaultGeostory, StoryElement } from '~/models/geostory'

const fonts = {
	Roboto: {
		normal: path.resolve('fonts/Roboto-Regular.ttf'),
		bold: path.resolve('fonts/Roboto-Medium.ttf'),
		italics: path.resolve('fonts/Roboto-Italic.ttf'),
		bolditalics: path.resolve('fonts/Roboto-MediumItalic.ttf')
	}
}

export default defineEventHandler(async (event) => {
	try {
		const story = defaultGeostory
		story.title = 'sample'

		const printer = new PdfPrinter(fonts)

		const docDefinition: TDocumentDefinitions = {
			content: [
				{ text: story.title, style: 'header' },
				{ text: `Autore: ${story.author}`, style: 'subheader' },
				{
					text: `Scenario: ${story.scenario}`,
					style: 'subheader',
					fontSize: 15,
					pagebreak: "after"
				},
				...story.elements.map((el: StoryElement) => (
					{
						text: [
							{ text: el.sectionTitle, style: 'sectionTitle', tocItem: true },
							'\n\n',
							{ text: el.storyItems[0]?.text || '', margin: [0, 0, 0, 10] }
						],
						pagebreak: 'after'
					}))
			].flat().filter(Boolean),
			styles: {
				header: { fontSize: 18, bold: true },
				subheader: { fontSize: 12, italics: true },
				sectionTitle: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
			},
			defaultStyle: {
				font: 'Roboto'
			}
		}

		const pdfDoc = printer.createPdfKitDocument(docDefinition)

		const buffer = await new Promise<Buffer>((resolve, reject) => {
			pdfDoc.pipe(concat(resolve))
			pdfDoc.on('error', reject)
			pdfDoc.end()
		})

		// ✅ Solo ora imposta gli header e invia la risposta
		event.node.res.setHeader('Content-Type', 'application/pdf')
		event.node.res.setHeader('Content-Disposition', 'inline; filename=geostoria.pdf')
		event.node.res.end(buffer)
	} catch (err) {
		console.error("some error" + err)

	}

})
