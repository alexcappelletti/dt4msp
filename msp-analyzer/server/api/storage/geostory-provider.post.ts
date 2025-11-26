import type { Geostory } from "~/models/geostory";
import type { Scenario } from "~/models/scenario";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const geostoryID: string | undefined =
		typeof body.geostoryID === 'string' ? body.geostoryID : undefined;
	const from: string = body.from || 'storage';    //di default carica da storage
	console.log('Received request for scenario ID:', geostoryID || 'N/A');
	try {
		let data: Geostory | undefined = undefined
		if (from === 'file') {
			console.log('Loading geostory from file...');
		}
		else if (from === 'public') {
			console.log('Loading geostory from public folder...');
		}
		else if (from === 'storage') {
			console.log('Loading geostory from storage...');
			data = await readGeostoryFromStorageKey();
		}
		if (!data) { throw new Error('Impossibile caricare i dati della gs.'); }
		return {foundGeostory:data};
	} catch (error) {
		// Gestione degli errori: restituisce una risposta di errore standard di Nuxt
		console.error('Errore nel $fetch del file:', error);
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: Impossibile leggere dati per GS',
		});
	}
});


async function readGeostoryFromStorageKey(path?: string | undefined):Promise<Geostory>{
	type StorageData = {
		geostory?: Geostory

	}
	const storageName = 'db'
	const storageKey = 'samples';
	console.info(`reading geostory ${storageKey} on ${storageName}`);
	try {
		// getItem restituirà i dati del file, già parsati da Nitro se è JSON
		const rawData = await useStorage(storageName).getItem<StorageData>(storageKey);

		if (!rawData || !rawData.geostory) {
			throw new Error('Dati geostoria di esempio non trovati nello storage.');
		}
		return rawData.geostory;

	} catch (error:any) {
		console.error(`Errore nella funzione readGeostoryFromStorageKey: ${error.message}`);
		throw new Error('Impossibile leggere la chiave per geostoria dallo storage.');
	}
}
