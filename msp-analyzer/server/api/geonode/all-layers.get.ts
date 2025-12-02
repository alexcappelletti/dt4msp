import type { Layer } from '#/shared/types/gn-layer'

const GEONODE_BASE_URL = process.env.GEONODE_API_URL || "https://geoplatform.tools4msp.eu";
const PAGE_SIZE = 100;
const CONCURRENCY_LIMIT = 5; // Il numero massimo di richieste simultanee permesse

interface GeoNodeApiResponse {
	links: { next: string | null; previous: string | null; };
	total: number;
	page: number;
	page_size: number;
	layers: Layer[];
}

/**
 * Funzione helper per eseguire un array di task (funzioni asincrone) 
 * limitando il numero di esecuzioni parallele.
 */
async function fetchWithConcurrencyLimit<T>(
	tasks: (() => Promise<T>)[],
	limit: number
): Promise<T[]> {
	const results: T[] = [];
	let running = 0;
	let index = 0;

	return new Promise((resolve, reject) => {
		const runNext = async () => {
			if (index < tasks.length) {
				const currentTaskIndex = index++;
				const task = tasks[currentTaskIndex];
				running++;

				try {
					const result = await task();
					results.push(result);
				} catch (error) {
					console.warn(`Task ${currentTaskIndex} failed:`, error);

				} finally {
					running--;
					runNext(); // Appena un task finisce, ne avvia un altro se disponibile
				}
			} else if (running === 0) {
				// Se non ci sono più task da avviare e nessuno è in esecuzione, abbiamo finito
				resolve(results);
			}
		};

		for (let i = 0; i < limit && i < tasks.length; i++) {
			runNext();
		}
	});
}


export default defineEventHandler(async (event) => {
	let allLayers: any[] = [];
	let totalPages = 0;

	try {
		const initialResponse = await $fetch<GeoNodeApiResponse>(`${GEONODE_BASE_URL}/api/v2/layers?page_size=${PAGE_SIZE}&page=1`);
		totalPages = Math.ceil(initialResponse.total / PAGE_SIZE);
		allLayers.push(...initialResponse.layers);
	} catch (err) {
		console.error("Failed to fetch initial page:", err);
		throw createError({ statusCode: 500, statusMessage: 'Cannot determine total pages for parallel fetch.' });
	}

	// --- FASE 2: Preparazione dei task ---
	const fetchTasks: (() => Promise<Layer[]>)[] = [];

	// Creiamo le funzioni (task) per tutte le pagine rimanenti (dalla 2 in poi)
	for (let page = 2; page <= totalPages; page++) {
		const url = `${GEONODE_BASE_URL}/api/v2/layers?page_size=${PAGE_SIZE}&page=${page}`;
		fetchTasks.push(() =>
			$fetch<GeoNodeApiResponse>(url)
				.then(response => response.layers)
				.catch(err => {
					console.warn(`Error fetching page ${page}:`, err);
					return [];
				})
		);
	}


	const results = await fetchWithConcurrencyLimit(fetchTasks, CONCURRENCY_LIMIT);
	results.forEach(pageLayers => {
		allLayers.push(...pageLayers);
	});

	console.log(`Total layers fetched: ${allLayers.length}`);
	return allLayers.map(x => ({ pk: x.pk, title: x.title }));
});
