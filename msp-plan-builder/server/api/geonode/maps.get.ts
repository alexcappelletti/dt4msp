import type { GeonodeMap, GeonodeMapListItem, GeonodeMapsResponse } from '#/shared/types/geonodeTypes';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type GeoNodeMapItem = Partial<GeonodeMap> & { id?: string | number };
type GeoNodeMapsResponseLike = GeonodeMapsResponse & {
	objects?: GeoNodeMapItem[];
	results?: GeoNodeMapItem[];
	maps?: GeoNodeMapItem[];
};

function pickMapItems(response: GeoNodeMapsResponseLike): GeoNodeMapItem[] {
	if (Array.isArray(response.maps)) return response.maps;
	if (Array.isArray(response.objects)) return response.objects;
	if (Array.isArray(response.results)) return response.results;
	return [];
}

export default defineEventHandler(async (event) => {
	const GEONODE_BASE_URL = useRuntimeConfig(event).geonodeApiUrl || "https://geoplatform.tools4msp.eu";
	const query = getQuery(event);
	const searchText = query.searchText ? String(query.searchText) : undefined;
	const page = Number(query.page ?? 1) || 1;
	const page_size = Math.min(Math.max(Number(query.page_size ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

	let pageUrl = `${GEONODE_BASE_URL}/api/v2/maps?page_size=${page_size}&page=${page}`;
	if (searchText) {
		pageUrl += `&q=${encodeURIComponent(searchText)}`;
	}

	console.log(`Fetching GeoNode maps page ${page} (size ${page_size})`);
	const response = await $fetch<GeoNodeMapsResponseLike>(pageUrl);
	const mapItems = pickMapItems(response);

	const mapped = mapItems.map((mapItem): GeonodeMapListItem => ({
		pk: String(mapItem.pk ?? mapItem.id ?? ''),
		uuid: String(mapItem.uuid || ''),
		title: String(mapItem.title || 'Mappa senza titolo'),
		abstract: String(mapItem.abstract || ''),
		attribution: mapItem.attribution ?? null,
		owner: mapItem.owner,
		owner_username: String(mapItem.owner?.username || 'utente'),
		poc: mapItem.poc,
		metadata_author: mapItem.metadata_author,
		created: String(mapItem.created || ''),
		last_updated: mapItem.last_updated ? String(mapItem.last_updated) : undefined,
		date: mapItem.date ? String(mapItem.date) : undefined,
		date_type: mapItem.date_type ? String(mapItem.date_type) : undefined,
		temporal_extent_start: mapItem.temporal_extent_start ?? null,
		temporal_extent_end: mapItem.temporal_extent_end ?? null,
		group: mapItem.group ?? null,
		language: mapItem.language ? String(mapItem.language) : undefined,
		popular_count: String(mapItem.popular_count || '0'),
		share_count: String(mapItem.share_count || '0'),
		rating: String(mapItem.rating || '0'),
		featuredurl: mapItem.featuredurl ? String(mapItem.featuredurl) : undefined,
		featured: Boolean(mapItem.featured),
		is_published: Boolean(mapItem.is_published),
		is_approved: Boolean(mapItem.is_approved),
		detail_url: String(mapItem.detail_url || ''),
		thumbnail_url: String(mapItem.thumbnail_url || ''),
		embed_url: mapItem.embed_url ? String(mapItem.embed_url) : undefined,
		resource_type: mapItem.resource_type as GeonodeMapListItem['resource_type'],
		urlsuffix: mapItem.urlsuffix ? String(mapItem.urlsuffix) : undefined,
		projection: mapItem.projection ? String(mapItem.projection) : undefined,
		zoom: typeof mapItem.zoom === 'number' ? mapItem.zoom : undefined,
		center_x: typeof mapItem.center_x === 'number' ? mapItem.center_x : undefined,
		center_y: typeof mapItem.center_y === 'number' ? mapItem.center_y : undefined,
	}));

	return {
		links: {
			next: response.links?.next ?? null,
			previous: response.links?.previous ?? null,
		},
		total: response.total ?? 0,
		page: response.page ?? page,
		page_size: response.page_size ?? page_size,
		maps: mapped,
	};
});
