// tests/e2e/geostoryRedis.spec.ts
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import Redis from 'ioredis';
import type { Geostory } from '@/models/geostory'; 
import { populateGeostory,parseGeostoryFromJson } from '@/models/geostory'; 
import {createSicilyChannelMockGeostory} from '../mocks/geostory-mocks.test'

// Configura la connessione Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; 
const redisClient = new Redis(redisUrl);





// Dati di test campione usando il mock del Canale di Sicilia
const mockGeostory: Geostory = createSicilyChannelMockGeostory();
const geostoryKey = `geostory:${mockGeostory.id}`;

// Salta i test se non è disponibile un URL Redis valido
describe.skipIf(!redisUrl)('Redis Data Storage for Geostory Structures (E2E)', () => {

	// Pulizia prima di ogni test per isolamento
	beforeEach(async () => {
		await redisClient.del(geostoryKey);
	});

	// Chiusura della connessione dopo tutti i test
	afterAll(async () => {
		await redisClient.quit();
	});

	it('should store and retrieve a complex Geostory object in Redis', async () => {
		
		const jsonData = JSON.stringify(mockGeostory);
		await redisClient.set(geostoryKey, jsonData);

		const retrievedJsonData = await redisClient.get(geostoryKey);
		expect(retrievedJsonData).toBeTypeOf('string');
		expect(retrievedJsonData).toBe(jsonData); // Il JSON grezzo deve corrispondere

		const retrievedGeostory: Geostory = parseGeostoryFromJson(retrievedJsonData as string);

		// Verifiche
		expect(retrievedGeostory.id).toBe(mockGeostory.id);
		expect(retrievedGeostory.title).toBe('Geostoria: Dinamiche Socio-Ambientali del Canale di Sicilia');

		// Verifica che le Date siano state ricostruite correttamente (da stringa ISO a oggetto Date)
		expect(retrievedGeostory.timestamp instanceof Date).toBe(true);
		expect(retrievedGeostory.timestamp.toISOString()).toBe(mockGeostory.timestamp.toISOString());

		// Verifica che la Map 'sections' sia stata ricostruita correttamente
		expect(retrievedGeostory.sections).toBeInstanceOf(Map);
		expect(retrievedGeostory.sections.size).toBe(3);

		// Verifica il contenuto di una sezione specifica
		const introSection = retrievedGeostory.sections.get('sezione-introduzione');
		expect(introSection).toBeDefined();
		expect(introSection?.elements.length).toBe(1);
		expect(introSection?.getTitle()).toBe("Introduzione Geografica"); // Test su un metodo di classe Section

		// Verifica degli elementi nested (es. StoryItem)
		const firstElement = retrievedGeostory.elements[0];
		expect(firstElement.storyItems).toHaveLength(1);
		expect(firstElement.storyItems[0].title).toBe("Il Contesto Marino");
	});

	it('should return null if the geostory key does not exist', async () => {
		const result = await redisClient.get('geostory:nonexistent');
		expect(result).toBeNull();
	});
});
