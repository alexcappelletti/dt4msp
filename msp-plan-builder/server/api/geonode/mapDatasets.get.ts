import type {
	Dataset,
	GeoNodeDatasetsResponse,
	MapDatasetItem,
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
	const geonodeBaseUrl =
		useRuntimeConfig(event).geonodeApiUrl || 'https://geoplatform.tools4msp.eu';

	if (!mapId || typeof mapId !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro mapId mancante o non valido.',
		});
	}

	try {
		const url = `${geonodeBaseUrl}/api/v2/maps/${encodeURIComponent(mapId)}/datasets`;
		const response = await $fetch<GeoNodeMapDatasetsPayload>(url);
		const datasets = pickDatasetItems(response);

		return datasets.map(
			(dataset, index): MapDatasetItem => ({
				pk: String(dataset.pk),
				datasetName: dataset.title || dataset.name || '',
				progressiveNumber: index + 1,
			}),
		);
	} catch (err: any) {
		console.error(`Errore recupero map datasets per mapId ${mapId}:`, err);
		throw createError({
			statusCode: err?.statusCode === 404 ? 404 : 500,
			statusMessage: err?.statusMessage || 'Impossibile recuperare i dataset della mappa.',
		});
	}
});
