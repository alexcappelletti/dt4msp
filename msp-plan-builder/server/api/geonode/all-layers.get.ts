import type { Layer, LayerListItem } from '#/shared/types/geonodeTypes';

const GEONODE_BASE_URL = process.env.GEONODE_API_URL || 'https://geoplatform.tools4msp.eu';
const PAGE_SIZE = 5;
const CONCURRENCY_LIMIT = 5;

interface GeoNodeApiResponse {
	links: { next: string | null; previous: string | null };
	total: number;
	page: number;
	page_size: number;
	layers: Layer[];
}

async function fetchWithConcurrencyLimit<T>(
	tasks: (() => Promise<T>)[],
	limit: number,
): Promise<T[]> {
	const results: T[] = [];
	let running = 0;
	let index = 0;

	return new Promise((resolve) => {
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
					runNext();
				}
			} else if (running === 0) {
				resolve(results);
			}
		};

		for (let i = 0; i < limit && i < tasks.length; i++) {
			runNext();
		}
	});
}

export default defineEventHandler(async (event) => {
	const allLayers: Layer[] = [];
	let totalPages = 10;

	const query = getQuery(event);
	const searchText = query.searchText ? String(query.searchText) : undefined;

	try {
		let initialUrl = `${GEONODE_BASE_URL}/api/v2/layers?page_size=${PAGE_SIZE}&page=1`;
		if (searchText) {
			initialUrl += `&q=${encodeURIComponent(searchText)}`;
		}
		const initialResponse = await $fetch<GeoNodeApiResponse>(initialUrl);
		// totalPages = Math.ceil(initialResponse.total / PAGE_SIZE);
		allLayers.push(...initialResponse.layers);
		console.log('found: ', allLayers.length);
	} catch (err) {
		console.error('Failed to fetch initial page:', err);
		throw createError({
			statusCode: 500,
			statusMessage: 'Cannot determine total pages for parallel fetch.',
		});
	}

	const fetchTasks: (() => Promise<Layer[]>)[] = [];

	for (let page = 2; page <= totalPages; page++) {
		let pageUrl = `${GEONODE_BASE_URL}/api/v2/layers?page_size=${PAGE_SIZE}&page=${page}`;
		if (searchText) {
			pageUrl += `&q=${encodeURIComponent(searchText)}`;
		}
		fetchTasks.push(() =>
			$fetch<GeoNodeApiResponse>(pageUrl)
				.then((response) => response.layers)
				.catch((err) => {
					console.warn(`Error fetching page ${page}:`, err);
					return [];
				}),
		);
	}

	const results = await fetchWithConcurrencyLimit(fetchTasks, CONCURRENCY_LIMIT);
	results.forEach((pageLayers) => {
		allLayers.push(...pageLayers);
	});

	console.log(`Total layers fetched: ${allLayers.length}`);

	return allLayers.map((layer): LayerListItem => ({
		pk: layer.pk,
		title: layer.title,
		thumbnail_url: layer.thumbnail_url || '',
		abstract: layer.abstract || '',
		owner_username: layer.owner?.username || 'utente',
		created: layer.created || '',
		popular_count: layer.popular_count || '0',
	}));
});
