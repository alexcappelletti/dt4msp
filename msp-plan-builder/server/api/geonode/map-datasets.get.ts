import type {
	Dataset,
	DatasetListItem,
	GeoNodeDatasetsResponse,
} from '#/shared/types/geonodeTypes';

type GeoNodeMapDatasetsPayload = Dataset[] | GeoNodeDatasetsResponse;

function isDatasetLike(item: unknown): item is Dataset {
	if (!item || typeof item !== 'object') {
		return false;
	}

	const candidate = item as Record<string, unknown>;
	return typeof candidate.pk !== 'undefined' && typeof candidate.title === 'string';
}

function pickDatasetItems(payload: GeoNodeMapDatasetsPayload): Dataset[] {
	if (Array.isArray(payload)) {
		return payload.filter(isDatasetLike);
	}

	const candidates: unknown[] = [];
	if (Array.isArray(payload.datasets)) candidates.push(...payload.datasets);
	if (Array.isArray(payload.layers)) candidates.push(...payload.layers);
	if (Array.isArray(payload.layer_set)) candidates.push(...payload.layer_set);
	if (Array.isArray(payload.objects)) candidates.push(...payload.objects);
	if (Array.isArray(payload.results)) candidates.push(...payload.results);

	return candidates.filter(isDatasetLike);
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const mapId = query.mapId || query.map_id;
	const GEONODE_BASE_URL = useRuntimeConfig(event).geonodeApiUrl || 'https://geoplatform.tools4msp.eu';

	if (!mapId || typeof mapId !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro mapId mancante o non valido.',
		});
	}

	const tryUrls = [
		`${GEONODE_BASE_URL}/api/v2/maps/${encodeURIComponent(mapId)}/datasets`,

	];

	let response: GeoNodeMapDatasetsPayload | null = null;
	let lastError: any = null;

	for (const url of tryUrls) {
		try {
			response = await $fetch<GeoNodeMapDatasetsPayload>(url);
			if (response) {
				break;
			}
		} catch (err: any) {
			lastError = err;
			// continue to fallback URLs
		}
	}

	if (!response) {
		console.error(`Errore recupero map datasets per mapId ${mapId}:`, lastError);
		throw createError({
			statusCode: lastError?.statusCode === 404 ? 404 : 500,
			statusMessage: lastError?.statusMessage || 'Impossibile recuperare i dataset della mappa.',
		});
	}

	const datasets = pickDatasetItems(response);
	const visibleDatasets = datasets// .filter(
	// 	(dataset) => Array.isArray(dataset.perms) && dataset.perms.length > 0,
	// );
	console.log(`Recuperati ${visibleDatasets.length} dataset visibili per mapId ${mapId}
		.`);
	return visibleDatasets.map((dataset): DatasetListItem => ({
		pk: String(dataset.pk),
		title: dataset.title || '',
		thumbnail_url: dataset.thumbnail_url || '',
		abstract: dataset.abstract || dataset.raw_abstract || '',
		owner_username: dataset.owner?.username || 'utente',
		created: dataset.created || '',
		popular_count: dataset.popular_count || '0',
		canVisualize: Array.isArray(dataset.perms) && dataset.perms.length > 0,
	}));
});
