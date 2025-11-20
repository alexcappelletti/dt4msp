export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const targetUrl = query.ows || query.wfs; // Usa il nome del parametro corretto

	if (!targetUrl || typeof targetUrl !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing or invalid target URL parameter (e.g., ?ows=... or ?wfs=...)',
		});
	}
	if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
		 throw createError({
			statusCode: 400,
			statusMessage: 'Decoded URL is not a valid HTTP/HTTPS URL',
		});
	}
	console.log("Effettuando fetch verso:", targetUrl);

	try {
		const response: any = await $fetch(targetUrl); 
		const contentType = response.headers.get('content-type');
		if (contentType) {
			// Imposta l'header Content-Type della *tua* risposta Nuxt
			event.node.res.setHeader('Content-Type', contentType);
		}

		// Restituisci i dati binari (es. immagine PNG) come ArrayBuffer
		// Questo è il modo corretto per gestire risposte non-JSON in Nuxt 3
		return await response.arrayBuffer(); 
	} catch (error) {
		console.error('Proxy fetch error:', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Proxy request failed',
		});
	}
});
