

import { getRequestURL } from 'h3'; 
//import { Scenario } from '@/models/scenario';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const scenarioID: string | undefined =
		typeof body.scenarioID === 'string' ? body.scenarioID : undefined;
	const requestUrl = getRequestURL(event);
    const fileUrl = `${requestUrl.origin}/fixtures/scenario_bd-v0_02.json`;
    console.log('Received request for scenario ID:', scenarioID || 'N/A');
	try {
		const data = await $fetch(fileUrl) ;
		if (!data) {throw new Error('Impossibile caricare i dati dello scenario.' + fileUrl);}
		return {scenario: data,};
	} catch (error) {
		// Gestione degli errori: restituisce una risposta di errore standard di Nuxt
		console.error('Errore nel $fetch del file:', error);
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: Impossibile leggere il file dei dati (fetch).' ,
		});
	}
});
