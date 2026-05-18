import type { GeonodeMap, GeonodeMapListItem, GeonodeMapsResponse } from '#/shared/types/geonodeTypes';

const PAGE_SIZE = 20;
const MAX_PAGES = 20;

type GeoNodeMapItem = Partial<GeonodeMap> & { id?: string | number };
type GeoNodeMapsResponseLike = GeonodeMapsResponse & {
	objects?: GeoNodeMapItem[];
	results?: GeoNodeMapItem[];
	maps?: GeoNodeMapItem[];
};

function extractNextPage(nextUrl: string | null): number | null {
	if (!nextUrl) return null;
	try {
		const parsed = new URL(nextUrl);
		const pageRaw = parsed.searchParams.get('page');
		if (!pageRaw) return null;
		const page = Number(pageRaw);
		return Number.isFinite(page) && page > 0 ? page : null;
	} catch {
		return null;
	}
}

function pickMapItems(response: GeoNodeMapsResponseLike): GeoNodeMapItem[] {
	if (Array.isArray(response.maps)) return response.maps;
	if (Array.isArray(response.objects)) return response.objects;
	if (Array.isArray(response.results)) return response.results;
	return [];
}

export default defineEventHandler(async (event) => {
	const GEONODE_BASE_URL = useRuntimeConfig(event).geonodeApiUrl || "https://geoplatform.tools4msp.eu";
	const allMaps: GeoNodeMapItem[] = [];
	let nextPage: number | null = 1;
	let pageCount = 0;

	const query = getQuery(event);
	const searchText = query.searchText ? String(query.searchText) : undefined;
	console.log(`Fetching maps from GeoNode`);
	while (nextPage && pageCount < MAX_PAGES) {
		let pageUrl = `${GEONODE_BASE_URL}/api/v2/maps?page_size=${PAGE_SIZE}&page=${nextPage}`;
		if (searchText) {
			pageUrl += `&q=${encodeURIComponent(searchText)}`;
		}
		try {
			const response = await $fetch<GeoNodeMapsResponseLike>(pageUrl);
			allMaps.push(...pickMapItems(response));
			nextPage = extractNextPage(response.links?.next || null);
			pageCount += 1;
		} catch (err) {
			console.error(`Error fetching maps page ${nextPage}:`, err);
			break;
		}
	}
	console.log(`found ${allMaps.length} maps from GeoNode in ${pageCount} pages`);
	return allMaps.map((mapItem): GeonodeMapListItem => ({
		pk: String(mapItem.pk ?? mapItem.id ?? ''),
		title: String(mapItem.title || 'Mappa senza titolo'),
		thumbnail_url: String(mapItem.thumbnail_url || ''),
		abstract: String(mapItem.abstract || ''),
		owner_username: String(mapItem.owner?.username || 'utente'),
		created: String(mapItem.created || ''),
		popular_count: String(mapItem.popular_count || '0'),
		share_count: String(mapItem.share_count || '0'),
		rating: String(mapItem.rating || '0'),
		detail_url: String(mapItem.detail_url || ''),
	}));
});
