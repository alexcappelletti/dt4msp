// // server/api/geonode/layer.get.ts
// import type { Layer } from '#/shared/types/geonodeTypes';

// // URL di base dell'API GeoNode, ottenuto dalle variabili d'ambiente
// const GEONODE_BASE_URL = process.env.GEONODE_API_URL || "https://geoplatform.tools4msp.eu";

// export default defineEventHandler(async (event) => {
// 	// 1. Estrai i parametri della query
// 	const query = getQuery(event);
// 	const pk = query.pk;

// 	// 2. Valida l'input
// 	if (!pk || typeof pk !== 'string') {
// 		throw createError({
// 			statusCode: 400,
// 			statusMessage: 'PK (Primary Key) del layer non valida o mancante.',
// 		});
// 	}

// 	// 3. Effettua la richiesta all'API esterna di GeoNode
// 	const url = `${GEONODE_BASE_URL}/api/v2/layers/${pk}`;

// 	try {
// 		// Usa $fetch di Nuxt per la richiesta lato server
// 		const layerDetails = await $fetch<{layer:Layer}>(url);

// 		// 4. Ritorna i dati puliti al client
// 		return layerDetails.layer;

// 	} catch (err: any) {
// 		console.error(`Errore nel fetching del layer PK ${pk}:`, err.message);

// 		// Gestione degli errori specifici
// 		if (err.statusCode === 404) {
// 			throw createError({
// 				statusCode: 404,
// 				statusMessage: `Layer con PK ${pk} non trovato.`,
// 			});
// 		}

// 		// Errore generico del server
// 		throw createError({
// 			statusCode: 500,
// 			statusMessage: 'Errore durante il recupero dei dettagli del layer.',
// 		});
// 	}
// });
