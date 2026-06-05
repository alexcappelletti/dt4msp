import type { Dataset, DatasetListItem } from '#/shared/types/geonodeTypes';

const PAGE_SIZE = 20;
const MAX_PAGES = 20;

interface GeoNodeLayersResponse {
	links: { next: string | null; previous: string | null };
	total: number;
	page: number;
	page_size: number;
	layers?: Dataset[];
	datasets?: Dataset[];
	objects?: Dataset[];
}

function pickLayerItems(response: GeoNodeLayersResponse): Dataset[] {
	if (Array.isArray(response.layers)) return response.layers;
	if (Array.isArray(response.objects)) return response.objects;
	if (Array.isArray(response.datasets)) return response.datasets;
	return [];
}

export default defineEventHandler(async (event) => {
	const GEONODE_BASE_URL: string = useRuntimeConfig(event).geonodeApiUrl || "https://geoplatform.tools4msp.eu";
	const allLayers: Dataset[] = [];
	let nextPage: number | null = 1;
	let pageCount = 0;

	const query = getQuery(event);
	const searchText = query.searchText ? String(query.searchText) : undefined;

	while (nextPage && pageCount < MAX_PAGES) {
		let pageUrl: string = `${GEONODE_BASE_URL}/api/v2/datasets?page_size=${PAGE_SIZE}&page=${nextPage}`;
		if (searchText) {
			pageUrl += `&q=${encodeURIComponent(searchText)}`;
		}
		try {
			const response: GeoNodeLayersResponse = await $fetch<GeoNodeLayersResponse>(pageUrl);
			allLayers.push(...pickLayerItems(response));
			nextPage = response.links?.next ? nextPage + 1 : null;
			pageCount += 1;
			console.log(`Fetched page ${response.page} of layers, total so far: ${allLayers.length}`);
		} catch (err) {
			console.error(`Error fetching layers page ${nextPage}:`, err);
			break;
		}
	}

	return allLayers
		.filter((layer) => Array.isArray(layer.perms) && layer.perms.length > 0)
		.map((layer): DatasetListItem => ({
			pk: layer.pk,
			title: layer.title,
			thumbnail_url: layer.thumbnail_url || '',
			abstract: layer.abstract || '',
			owner_username: layer.owner?.username || 'utente',
			created: layer.created || '',
			popular_count: layer.popular_count || '0',
		}));
});

