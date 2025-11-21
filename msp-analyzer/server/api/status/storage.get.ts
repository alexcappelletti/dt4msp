import * as fs from 'fs/promises';
import * as path from 'path';
import type { Scenario } from '~/models/scenario';
export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const storageName = query.dbname as string || "db";
	const keyName = query.key as string || '';
	const injectValue = query.injectValue as string || '';
	const useDefault = query.useDefault === 'true'; // È un booleano

	const storage = useStorage(storageName);
	const retValue: Record<string, any> = {};

	if (keyName) {
		if (useDefault) {
			// Assicurati che addScenario sia definito o importato
			await addScenario(storageName);
		}

		if (injectValue) {
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



async function addScenario(nameSt: string) {
	try {
		const storage = useStorage(nameSt);
		const scenario = await readScenarioFile()
		await storage.setItem('sampleScenario', scenario)
	}
	catch (error: any) {
		console.error('Impossibile set a scenario in storage ' + error)

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