import type { Dataset, GeoNodeDatasetsResponse } from '#/shared/types/geonodeTypes';

function isDatasetLike(item: unknown): item is Dataset {
	if (!item || typeof item !== 'object') {
		return false;
	}

	const candidate = item as Record<string, unknown>;
	return typeof candidate.pk !== 'undefined' && typeof candidate.title === 'string';
}

function pickDatasetItems(payload: Dataset[] | GeoNodeDatasetsResponse): Dataset[] {
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
	const pk = query.pk;
	const GEONODE_BASE_URL = useRuntimeConfig(event).geonodeApiUrl || 'https://geoplatform.tools4msp.eu';

	if (!mapId || typeof mapId !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro mapId mancante o non valido.',
		});
	}

	if (!pk || typeof pk !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'PK del dataset mancante o non valido.',
		});
	}
	let lastError: any = null;

	
	try {
		const layerUrl = `${GEONODE_BASE_URL}/api/v2/datasets/${encodeURIComponent(pk)}`;
		const layerResponse = await $fetch<{ dataset: Dataset }>(layerUrl);
		const layerData = layerResponse.dataset;
		//solo quelli con permessi definiti altrimenti skip
		if (Array.isArray(layerData.perms) && layerData.perms.length === 0) {
			const { perms, ...cleanedLayer } = layerData;
			return cleanedLayer as Dataset;
		}
		return layerData;
	} catch (err: any) {
		console.error(`Errore recupero dettagli dataset PK ${pk}:`, err?.message || err);
		if (err?.statusCode === 404) {
			throw createError({
				statusCode: 404,
				statusMessage: `Dettagli dataset con PK ${pk} non trovati.`,
			});
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Errore durante il recupero dei dettagli del dataset.',
		});
	}
});
