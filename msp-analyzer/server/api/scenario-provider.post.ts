//import { Scenario } from '@/models/scenario';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const scenarioID: string | undefined =
		typeof body.scenarioID === 'string' ? body.scenarioID : undefined;
	const publicUrl = 'http://localhost:3000/fixtures/scenario_bd-v0_02.json';
    console.log('Received request for scenario ID:', scenarioID || 'N/A');
	try {
		// Usa useStorage().getItem() per leggere il file.
		// ad esempio nella root (se configurata per storage) o nella cartella 'public'.
		// const data = await $fetch(publicUrl);
		const storageKey = 'root:public:fixtures:scenario_bd-v0_02.json';
		const data = await useStorage().getItem(storageKey) ;
		if (!data) {throw new Error('Impossibile caricare i dati dello scenario.');}
		return {scenario: data,};
	} catch (error) {
		// Gestione degli errori: restituisce una risposta di errore standard di Nuxt
		console.error('Errore nel $fetch del file:', error);
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: Impossibile leggere il file dei dati (fetch).',
		});
	}
});
