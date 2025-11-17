
import type { GeonodeLayer, LayerParams, RawLayerDef } from '~/models/geonode.d.ts'
import { normalizeUrl } from '~/utils/geoserverUrls.ts'
const GEONODE_BASE_URL = 'https://geoplatform.tools4msp.eu/api/v2/maps';


// Funzione helper generica per il parsing sicuro, che restituisce il tipo corretto o null
const safeJsonParse = <T>(jsonString: string | null | undefined): T | null => {
		if (!jsonString) return null;
		try {
				return JSON.parse(jsonString) as T;
		} catch (e) {
				console.error("Errore nel parsing JSON:", e);
				return null;
		}
};



//get method with restUrl parameter: a proxy to geonode restful API
export default defineEventHandler(async (event) => {
	
	const query = getQuery(event);
	const restfulApi = query.cmd;
	const id = query.mapid
	if (!id || typeof id !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Missing or invalid "mapid" query parameter' });
	}
	if (restfulApi === 'layers') {
		return fetchGeonodeLayers(id);
	}
	throw createError({ statusCode: 400, statusMessage: 'Unsupported "cmd" query parameter' });
});

// Function to fetch and process layers from GeoNode API
const fetchGeonodeLayers = async (id: string): Promise<GeonodeLayer[]> => {	
	console.log("requesting layers for map id: " + id);

	try {
		const response = await fetch(`${GEONODE_BASE_URL}/${encodeURIComponent(id)}/layers`);
		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				statusMessage: `GeoNode API responded with status: ${response.statusText}`
			});
		}
		const rawLayersUnknown: unknown = await response.json(); 
		if (!Array.isArray(rawLayersUnknown)) {
			throw createError({ statusCode: 500, statusMessage: 'Invalid response format: not an array' });
		}

		const processedLayers: GeonodeLayer[] = rawLayersUnknown
			.filter((l): l is RawLayerDef => {
				// Questa funzione verifica se l'oggetto grezzo ha i campi minimi come stringhe
				return typeof l === 'object' 
					&& l !== null 
					&& 'pk' in l 
					&& typeof l.layer_params === 'string';
			})
			.map((l: RawLayerDef) =>{
				const parsedParams = safeJsonParse<LayerParams>(l.layer_params);
				const sourceParams = safeJsonParse<Record<string, any>>(l.source_params);
				// Costruiamo l'oggetto ProcessedGeonodeLayer senza cast impliciti
				const processed: GeonodeLayer = {
					pk: l.pk,
					name: l.name,
					store: l.store,
					stack_order: l.stack_order,
					format: l.format,
					opacity: l.opacity,
					styles: l.styles,
					transparent: l.transparent,
					fixed: l.fixed,
					group: l.group,
					visibility: l.visibility,
					owsUrl: normalizeUrl(l.ows_url),
					raw_url: l.ows_url,
					local: l.local,
					// Usiamo gli oggetti parsati, fornendo un fallback vuoto se il parsing fallisce
					layer_params: parsedParams || {} as LayerParams, 
					source_params: sourceParams || {},
				}
				return processed;
			});
		return processedLayers
		
	} catch (err) {
    	// Gestione degli errori di rete o parsing
    	throw createError({ statusCode: 502, statusMessage: 'Failed to process GeoNode data' });
	}				
};
