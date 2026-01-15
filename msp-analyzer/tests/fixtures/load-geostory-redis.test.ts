import { describe, beforeAll,afterAll, expect, it } from "vitest";
import { readFileSync, writeFileSync } from 'fs'
import { createStorage } from 'unstorage';
import redisDriver from 'unstorage/drivers/redis';
import type {Geostory, StoryElement, StoryItem,} from '../../app/models/geostory'
import {populateGeostory, populateStoryElement, populateStoryItem, updateItemStyle} from "../../app/models/geostory";
import * as dotenv from 'dotenv'; // Aggiungi questo

// Carica il file .env esplicitamente
dotenv.config();
const redisUrl = process.env.NUXT_REDIS_URL || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    

describe('Load Geostory into Redis remote db', () => {
	const habitatFile = './public/data/habitat_e_animali.json';
	let geostoryUnderTest: Geostory;
	let storage: ReturnType<typeof createStorage>;
	beforeAll(async () => {
		const raw = JSON.parse(readFileSync(habitatFile, 'utf-8')) as Geostory;
		geostoryUnderTest = populateGeostory(raw);
		console.log(`redisUrl: ${redisUrl}`);
		// 2. Inizializza il driver Redis (usa variabili d'ambiente caricate da Vitest)
		// Vitest carica automaticamente i file .env se configurato
		storage = createStorage({
			driver: redisDriver({
				url: redisUrl,
			}),
		});
		// Piccolo check di connettività
		try {
			await storage.getKeys();
		} catch (e) {
			console.error(
				'ERRORE: Impossibile connettersi a Redis. Verifica che il server sia attivo.',
			);
			throw e;
		}
	});

	afterAll(async () => {
		// Chiude la connessione al termine dei test
		await storage.removeItem('geostory:gsxxxx');
		if (storage) {
			await storage.dispose();
		}
	});

	 it('should successfully save the populated geostory into redis', async () => {
			const storageKey = `gestories:${geostoryUnderTest.id || 'habitat_animali'}`;

			// Salva l'intera geostoria
			await storage.setItem(storageKey, geostoryUnderTest);

			// Recupera i dati per verifica
			const savedData = await storage.getItem<Geostory>(storageKey);

			expect(savedData).toBeDefined();
			expect(savedData?.id).toBe(geostoryUnderTest.id);
			// Verifica che un elemento specifico sia stato caricato correttamente
			expect(savedData?.elements.length).toBeGreaterThan(0);
		}, 2000);



})
