import { Geostory } from "~/models/geostory";
import { Scenario } from "~/models/scenario";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const scenarioID: string | undefined =
		typeof body.scenarioID === 'string' ? body.scenarioID : undefined;
	const from: string = body.from || 'storage';    //di default carica da storage
	console.log('Received request for scenario ID:', scenarioID || 'N/A');
	try {
		const data: {content: undefined | Geostory} = {
			content: undefined
		}
		if (from === 'file') {
			console.log('Loading geostory from file...');
		}
		else if (from === 'public') {
			console.log('Loading geostory from public folder...');
		}
		else if (from === 'storage') {
			console.log('Loading geostory from storage...');
		}
		if (!data.content) { throw new Error('Impossibile caricare i dati della gs.'); }
		return data;
	} catch (error) {
		// Gestione degli errori: restituisce una risposta di errore standard di Nuxt
		console.error('Errore nel $fetch del file:', error);
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: Impossibile leggere dati',
		});
	}
});
