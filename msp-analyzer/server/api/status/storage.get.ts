import * as fs from 'fs/promises';
import * as path from 'path';
import { isFunctionExpression } from 'typescript';
import { Geostory, parseGeostoryFromJson } from '~/models/geostory';
import type { Scenario } from '~/models/scenario';
export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const storageName = query.dbname as string || "db";
	const keyName = query.key as string || '';
	const injectValue = query.injectValue as string || '';
	const useDefault = query.useDefault === 'true'; // È un booleano

	const storage = useStorage(storageName);
	const retValue: Record<string, any> = {};

	if (keyName === "samples") {
		if (useDefault) {
			// Assicurati che addScenario sia definito o importato
			await addSamples(storageName, keyName);
		}

		else if (injectValue) {
			await storage.setItem(keyName, injectValue);
		}

		// !!! CORREZIONE QUI: Aggiunto 'await' per ottenere il valore reale !!!
		// Il template che avevi precedentemente non attendeva il risultato.
		retValue[keyName] = await storage.getItem(keyName);

	} else {
		// Se non c'è keyName, otteniamo tutte le chiavi
		const keys = await storage.getKeys();
		retValue["found_keys"] = keys;
	}

	return retValue;
});


async function addSamples(storageName: string, key: string){
	try {
		const storage = useStorage(storageName);
		const geostory = await readGeostoryFromFile()
		const scenario = await readScenarioFile()
		await storage.setItem(key, {"scenario": scenario, "geostory": geostory})
	}
	catch (error: any) {
		console.error('Can\'t store samples ' + error)

	}
}


async function readScenarioFile(): Promise<Scenario> {
	// process.cwd() restituisce la directory di lavoro corrente del server (la root del progetto su Vercel/locale)
	const filePath = path.join(
		process.cwd(),
		'public',
		'data',
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

async function readGeostoryFromFile(): Promise<Geostory> {
	const filePath = path.join(
		process.cwd(),
		'public',
		'data',
		'geostorySOS-BD.json'
	);

	console.log(`Lettura file da: ${filePath}`);

	try {
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const data: Geostory = parseGeostoryFromJson(fileContent);
		return data;

	} catch (error: any) {
		console.error(`Errore nella funzione readScenarioFile: ${error.message}`);
		throw new Error('Impossibile leggere o parsare il file scenario.');
	}
}