

import * as fs from 'fs/promises';
import * as path from 'path';

import { Scenario } from '@/models/scenario';
import { read } from 'fs';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const scenarioID: string | undefined =
		typeof body.scenarioID === 'string' ? body.scenarioID : undefined;
	console.log('Received request for scenario ID:', scenarioID || 'N/A');
	try {
		//const data: Scenario = await readScenarioFile();
		const data: Scenario = await readScenarioFromStorageKey();
		if (!data) { throw new Error('Impossibile caricare i dati dello scenario.'); }
		return { scenario: data, };
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

export async function readScenarioFile(): Promise<Scenario> {
	// process.cwd() restituisce la directory di lavoro corrente del server (la root del progetto su Vercel/locale)
	const filePath = path.join(
		process.cwd(),
		'public',
		'fixtures',
		'scenario_bd-v0_02.json'
	);

	console.log(`Lettura file da: ${filePath}`);

	try {
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const data: Scenario = JSON.parse(fileContent);
		return data;

	} catch (error: any) {
		console.error(`Errore nella funzione readScenarioFile: ${error.message}`);
		throw new Error('Impossibile leggere o parsare il file scenario.');
	}
}
async function readScenarioFromStorageKey(): Promise<Scenario> {
	// Usa useStorage() con il prefisso 'assets:server'
	const storageKey = 'assets:server/fixtures/scenario_bd-v0_02.json';
	console.info(`Lettura file da storage key: ${storageKey}`);

	try {
		// getItem restituirà i dati del file, già parsati da Nitro se è JSON
		const data: Scenario | null | undefined = await useStorage().getItem(storageKey);

		if (!data) {
			throw new Error('Dati scenario non trovati nello storage.');
		}
		return data;

	} catch (error:any) {
		console.error(`Errore nella funzione readScenarioFile: ${error.message}`);
		throw new Error('Impossibile leggere il file scenario dallo storage.');
	}
}