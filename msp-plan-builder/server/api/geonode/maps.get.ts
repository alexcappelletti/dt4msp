import type { GeonodeMap, GeonodeMapsResponse } from '#/shared/types/geonodeTypes';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type GeoNodeMapItem = Partial<GeonodeMap> & { id?: string | number };
type GeoNodeMapsResponseLike = Omit<Partial<GeonodeMapsResponse>, 'maps'> & {
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

	const mapped = mapItems.map((mapItem): GeonodeMap => ({
		pk: String(mapItem.pk ?? mapItem.id ?? ''),
		uuid: String(mapItem.uuid || ''),
		zoom: typeof mapItem.zoom === 'number' ? mapItem.zoom : 0,
		projection: String(mapItem.projection || ''),
		center_x: typeof mapItem.center_x === 'number' ? mapItem.center_x : 0,
		center_y: typeof mapItem.center_y === 'number' ? mapItem.center_y : 0,
		urlsuffix: String(mapItem.urlsuffix || ''),
		featuredurl: String(mapItem.featuredurl || ''),
		resource_type: 'map',
		polymorphic_ctype_id: String(mapItem.polymorphic_ctype_id || ''),
		owner: mapItem.owner ?? {},
		poc: mapItem.poc ?? {},
		metadata_author: mapItem.metadata_author ?? {},
		title: String(mapItem.title || 'Mappa senza titolo'),
		abstract: String(mapItem.abstract || ''),
		attribution: mapItem.attribution ?? null,
		owner_username: String(mapItem.owner?.username || 'utente'),
		doi: mapItem.doi ?? null,
		alternate: mapItem.alternate ?? null,
		date: String(mapItem.date || ''),
		date_type: String(mapItem.date_type || ''),
		temporal_extent_start: mapItem.temporal_extent_start ?? null,
		temporal_extent_end: mapItem.temporal_extent_end ?? null,
		edition: mapItem.edition ?? null,
		purpose: mapItem.purpose ?? null,
		maintenance_frequency: mapItem.maintenance_frequency ?? null,
		constraints_other: mapItem.constraints_other ?? null,
		language: String(mapItem.language || ''),
		supplemental_information: String(mapItem.supplemental_information || ''),
		data_quality_statement: mapItem.data_quality_statement ?? null,
		bbox_polygon: mapItem.bbox_polygon ?? { type: 'Polygon', coordinates: [] },
		ll_bbox_polygon: mapItem.ll_bbox_polygon ?? { type: 'Polygon', coordinates: [] },
		srid: String(mapItem.srid || ''),
		group: typeof mapItem.group === 'string' ? mapItem.group : null,
		popular_count: String(mapItem.popular_count || '0'),
		share_count: String(mapItem.share_count || '0'),
		rating: String(mapItem.rating || '0'),
		featured: Boolean(mapItem.featured),
		is_published: Boolean(mapItem.is_published),
		is_approved: Boolean(mapItem.is_approved),
		detail_url: String(mapItem.detail_url || ''),
		created: String(mapItem.created || ''),
		last_updated: String(mapItem.last_updated || ''),
		raw_abstract: String(mapItem.raw_abstract || ''),
		raw_purpose: mapItem.raw_purpose ?? null,
		raw_constraints_other: mapItem.raw_constraints_other ?? null,
		raw_supplemental_information: String(mapItem.raw_supplemental_information || ''),
		raw_data_quality_statement: mapItem.raw_data_quality_statement ?? null,
		metadata_only: Boolean(mapItem.metadata_only),
		processed: Boolean(mapItem.processed),
		embed_url: String(mapItem.embed_url || ''),
		thumbnail_url: String(mapItem.thumbnail_url || ''),
		keywords: Array.isArray(mapItem.keywords) ? mapItem.keywords : [],
		tkeywords: Array.isArray(mapItem.tkeywords) ? mapItem.tkeywords : [],
		regions: Array.isArray(mapItem.regions) ? mapItem.regions : [],
		category: mapItem.category ?? null,
		restriction_code_type: mapItem.restriction_code_type ?? null,
		license: mapItem.license ?? null,
		spatial_representation_type: typeof mapItem.spatial_representation_type === 'string'
			? mapItem.spatial_representation_type
			: null,
		link: String(mapItem.link || ''),
		perms: Array.isArray(mapItem.perms) ? mapItem.perms : [],
		links: Array.isArray(mapItem.links) ? mapItem.links : [],
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
