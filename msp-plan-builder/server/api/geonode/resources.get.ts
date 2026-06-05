import type {
	GeonodeResourceListItem,
	GeonodeResourcesResponse,
} from '#/shared/types/geonodeTypes';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type GeoNodeResourceItem = Record<string, unknown> & {
	id?: string | number;
	pk?: string | number;
	uuid?: string;
	title?: string;
	abstract?: string;
	resource_type?: string;
	detail_url?: string;
	thumbnail_url?: string;
	created?: string;
	last_updated?: string;
	popular_count?: string | number;
	share_count?: string | number;
	rating?: string | number;
	owner?: {
		username?: string;
	};
};

type GeoNodeResourcesResponseLike = GeonodeResourcesResponse & {
	resources?: GeoNodeResourceItem[];
	objects?: GeoNodeResourceItem[];
	results?: GeoNodeResourceItem[];
};

function pickResourceItems(response: GeoNodeResourcesResponseLike): GeoNodeResourceItem[] {
	if (Array.isArray(response.resources)) return response.resources;
	if (Array.isArray(response.objects)) return response.objects;
	if (Array.isArray(response.results)) return response.results;
	return [];
}

function mapResourceItem(resource: GeoNodeResourceItem): GeonodeResourceListItem {
	return {
		pk: String(resource.pk ?? resource.id ?? ''),
		uuid: resource.uuid ? String(resource.uuid) : undefined,
		resource_type: String(resource.resource_type || 'resource'),
		title: String(resource.title || 'Risorsa senza titolo'),
		abstract: String(resource.abstract || ''),
		owner_username: String(resource.owner?.username || 'utente'),
		created: String(resource.created || ''),
		last_updated: resource.last_updated ? String(resource.last_updated) : undefined,
		detail_url: String(resource.detail_url || ''),
		thumbnail_url: String(resource.thumbnail_url || ''),
		popular_count: String(resource.popular_count || '0'),
		share_count: String(resource.share_count || '0'),
		rating: String(resource.rating || '0'),
	};
}

export default defineEventHandler(async (event) => {
	const geonodeBaseUrl =
		useRuntimeConfig(event).geonodeApiUrl || 'https://geoplatform.tools4msp.eu';
	const query = getQuery(event);
	const searchText = query.searchText ? String(query.searchText) : undefined;
	const resourceTypeFilter = query.resourceTypeFilter
		? String(query.resourceTypeFilter).trim().toLowerCase()
		: undefined;
	const pageSize = Math.min(
		Math.max(Number(query.page_size ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1),
		MAX_PAGE_SIZE,
	);
	const buildPageUrl = (page: number) => {
		let pageUrl = `${geonodeBaseUrl}/api/v2/resources?page_size=${pageSize}&page=${page}`;
		if (searchText) {
			pageUrl += `&q=${encodeURIComponent(searchText)}`;
		}
		return pageUrl;
	};

	const firstResponse = await $fetch<GeoNodeResourcesResponseLike>(buildPageUrl(1));
	const total = Number(firstResponse.total ?? pickResourceItems(firstResponse).length) || 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const remainingResponses =
		totalPages > 1
			? await Promise.all(
					Array.from({ length: totalPages - 1 }, (_, index) =>
						$fetch<GeoNodeResourcesResponseLike>(buildPageUrl(index + 2)),
					),
				)
			: [];

	const allResourceItems = [firstResponse, ...remainingResponses]
		.flatMap((response) => pickResourceItems(response))
		.map(mapResourceItem);

	const resources = resourceTypeFilter
		? allResourceItems.filter(
				(resource) => resource.resource_type.toLowerCase() === resourceTypeFilter,
			)
		: allResourceItems;

	return {
		total,
		total_filtered: resources.length,
		page: 1,
		page_size: pageSize,
		total_pages: totalPages,
		resourceTypeFilter: resourceTypeFilter ?? null,
		resources,
	};
});
