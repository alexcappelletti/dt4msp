import type { Dataset, DatasetListItem } from '#/shared/types/geonodeTypes';

const PAGE_SIZE = 20;
const MAX_PAGES = 20;

interface GeoNodeDatasetsResponse {
	links: { next: string | null; previous: string | null };
	total: number;
	page: number;
	page_size: number;
	layers?: Dataset[];
	datasets?: Dataset[];
	objects?: Dataset[];
}

function pickDatasetItems(response: GeoNodeDatasetsResponse): Dataset[] {
	if (Array.isArray(response.layers)) return response.layers;
	if (Array.isArray(response.objects)) return response.objects;
	if (Array.isArray(response.datasets)) return response.datasets;
	return [];
}

export default defineEventHandler(async (event) => {
	const GEONODE_BASE_URL: string = useRuntimeConfig(event).geonodeApiUrl || "https://geoplatform.tools4msp.eu";
	const allDatasets: Dataset[] = [];
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
			const response: GeoNodeDatasetsResponse = await $fetch<GeoNodeDatasetsResponse>(pageUrl);
			allDatasets.push(...pickDatasetItems(response));
			nextPage = response.links?.next ? nextPage + 1 : null;
			pageCount += 1;
			console.log(`Fetched page ${response.page} of datasets, total so far: ${allDatasets.length}`);
		} catch (err) {
			console.error(`Error fetching datasets page ${nextPage}:`, err);
			break;
		}
	}

	return allDatasets
		.filter((dataset) => Array.isArray(dataset.perms) && dataset.perms.length > 0)
		.map((dataset): DatasetListItem => ({
			pk: dataset.pk,
			title: dataset.title,
			thumbnail_url: dataset.thumbnail_url || '',
			abstract: dataset.abstract || '',
			owner_username: dataset.owner?.username || 'utente',
			created: dataset.created || '',
			popular_count: dataset.popular_count || '0',
			canVisualize: Array.isArray(dataset.perms) && dataset.perms.length > 0,
		}));
});
