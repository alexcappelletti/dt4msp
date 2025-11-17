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
		const buffer = await generator.exportGeostory(story);
		event.node.res.setHeader('Content-Type', 'application/pdf');
    	event.node.res.setHeader('Content-Disposition', 'inline; filename=geostory.pdf');
		event.node.res.end(buffer)
	} catch (error) {
		console.log(error)
		console.error("pdf generation task error: " + error)

 	}
})



