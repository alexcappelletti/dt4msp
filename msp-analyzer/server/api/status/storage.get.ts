import * as fs from 'fs/promises';
import * as path from 'path';
import type { Scenario } from '~/models/scenario';
export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	
	const storageName = query.dbname as string || "db"
	
	const storage = useStorage(storageName)
	await storage.setItem('test', 'Hello Redis!')
	await addScenario(storageName)
	const keys = await storage.getKeys()
	return {storageName: storageName, found_keys: keys}
	
})



async function addScenario(nameSt: string){
	try {
		const storage = useStorage(nameSt);
		const scenario = await readScenarioFile()
		await storage.setItem('sampleScenario', scenario)
	}
	catch (error:any){
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