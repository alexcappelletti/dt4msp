// tests/e2e/redis.spec.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import Redis from 'ioredis';
import type { Project, Scenario, Theme, Measure, Statement, AreaOfInterest } from '../../app/models/scenario';
import { populateScenario, populateTheme, populateMeasure } from '../../app/models/scenario';


const redisUrl = process.env.REDIS_URL; 

// Crea un'istanza del client Redis. Assicurati che il server Redis sia in esecuzione.
// Per i test E2E, spesso si usa una configurazione locale o mocked.
// Dati di test campione
const mockTheme: Theme = populateTheme({
	indexName: 'acqua1',
	name: 'Gestione Acqua',
	description: 'Tema relativo alla gestione delle risorse idriche.'
});
const mockMeasure: Measure = populateMeasure({
	name: 'Diga',
	impact: 'Alto',
	referenceThemes: [mockTheme]
});
const mockScenario: Scenario = populateScenario({
	name: 'Scenario Alpha',
	availableThemes: [mockTheme],
	measures: [mockMeasure],
});
const mockProject: Project = {
	id: 'proj-123',
	name: 'Progetto Test Redis',
	description: 'Test di archiviazione dati complessi.',
	createdAt: new Date(),
	updatedAt: new Date(),
	areaOfInterest: {} as AreaOfInterest, 
	scenarios: [mockScenario],
};
describe.skipIf(!redisUrl)('Redis Data Storage for Project Structures', () => {
	const redisClient = new Redis(redisUrl ?? '');
	// Pulizia prima di ogni test (opzionale, utile per isolare i test)
	beforeEach(async () => {
		// Pulisce solo la chiave specifica del progetto per evitare conflitti
		await redisClient.del(`project:${mockProject.id}`);
	});
	// Chiusura della connessione dopo tutti i test
	afterAll(async () => {
		await redisClient.quit();
	});
	it('should store and retrieve a complex Project object in Redis', async () => {
		const projectKey = `project:${mockProject.id}`;
		// 1. Serializzazione e Archiviazione (Set)
		// Redis memorizza solo stringhe, quindi convertiamo l'oggetto TypeScript in una stringa JSON
		const jsonData = JSON.stringify(mockProject);
		await redisClient.set(projectKey, jsonData);
		// 2. Recupero (Get)
		const retrievedJsonData = await redisClient.get(projectKey);
		expect(retrievedJsonData).toBeTypeOf('string');
		expect(retrievedJsonData).toBe(jsonData); // Il JSON grezzo deve corrispondere
		// 3. Deserializzazione e verifica dei tipi TypeScript
		// Riconvertiamo la stringa JSON in un oggetto TypeScript Project
		const retrievedProject: Project = JSON.parse(retrievedJsonData as string);
		// Verifiche
		expect(retrievedProject.id).toBe(mockProject.id);
		expect(retrievedProject.name).toBe('Progetto Test Redis');
		// Verifica che gli oggetti complessi all'interno siano corretti
		expect(retrievedProject.scenarios).toHaveLength(1);
		expect(retrievedProject.scenarios[0].name).toBe('Scenario Alpha');
		// Verifica di un oggetto nested (Measure)
		expect(retrievedProject.scenarios[0].measures[0].name).toBe('Diga');
		expect(retrievedProject?.scenarios[0]?.measures[0]?.referenceThemes[0]?.name ?? '').toBe('Gestione Acqua');
		// Verifica che le date siano state convertite correttamente da/a JSON (saranno stringhe ISO)
		expect(new Date(retrievedProject.createdAt)).toEqual(mockProject.createdAt);
	});
	it('should return null if the project key does not exist', async () => {
		const nonExistentKey = 'project:nonexistent';
		const result = await redisClient.get(nonExistentKey);
		expect(result).toBeNull();
	});
});
