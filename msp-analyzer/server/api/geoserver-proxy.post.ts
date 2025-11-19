export default defineEventHandler(async (event) => {
	const body = await readBody(event);
    //il 'body' sarà un oggetto tipo: { 
	// url: 'https://geoplatform...', 
	// layers: '...', 
	// BBOX: 'minX, minY, maxX, maxY' }

    const remoteUrl = body.url; 
    const bbox = body.BBOX;
    const layers = body.layers;
    const format = body.format;
	const crs = 'EPSG:3857'; // Assumiamo 3857 come standard per i tiles MapLibre
	const tileSize = 256;
    
    // Ricostruisci l'URL completo WMS con i dati corretti
	//VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layers}&FORMAT=${format}&TRANSPARENT=true&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX=${bbox}`;
    const realURL = new URL(remoteUrl);
	realURL.searchParams.set('SERVICE', 'WMS');
	realURL.searchParams.set('VERSION', '1.3.0');
	realURL.searchParams.set('REQUEST', 'GetMap');
	realURL.searchParams.set('LAYERS', layers);
	realURL.searchParams.set('STYLES', '');
	realURL.searchParams.set('FORMAT', format);
	realURL.searchParams.set('TRANSPARENT', 'true');
	realURL.searchParams.set('CRS', crs); // MapLibre usa di default 3857 per i tilesets
	realURL.searchParams.set('WIDTH', tileSize.toString());
	realURL.searchParams.set('HEIGHT', tileSize.toString());
	realURL.searchParams.set('BBOX', bbox); 
    try {
        // Effettua la richiesta fetch al server remoto
        console.log("proxy fetching URL" +realURL.toString())
        const response = await fetch(realURL.toString());

        if (!response.ok) {
            throw new Error(`Proxy request failed: ${response.statusText}`);
        }

         // 4. Passa l'immagine/blob direttamente al client
        // È importante mantenere il tipo di contenuto originale
        const contentType = response.headers.get('content-type');
        if (contentType) {
            event.node.res.setHeader('Content-Type', contentType);
        }
        return response.arrayBuffer(); // Usa arrayBuffer o blob

    } catch (error) {
        console.error("Proxy error:", error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Proxy failed to reach the remote server',
        });
    }
});

// 	const query = getQuery(event);
// 	const encodedTargetUrl = query.ows || query.wfs; // Usa il nome del parametro corretto

// 	if (!encodedTargetUrl || typeof encodedTargetUrl !== 'string') {
// 		throw createError({
// 			statusCode: 400,
// 			statusMessage: 'Missing or invalid target URL parameter (e.g., ?ows=... or ?wfs=...)',
// 		});
// 	}

// 	// 2. DECodifica l'URL di destinazione prima di usarlo
// 	const targetUrl = decodeURIComponent(encodedTargetUrl);
	
// 	// Assicurati che l'URL decodificato sia valido prima di fetcharlo
// 	if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
// 		 throw createError({
// 			statusCode: 400,
// 			statusMessage: 'Decoded URL is not a valid HTTP/HTTPS URL',
// 		});
// 	}

// 	console.log("Effettuando fetch verso:", targetUrl);

// 	// 3. Esegui la fetch con l'URL DECODIFICATO
// 	try {
// 		const response = await $fetch(targetUrl); // Usa $fetch di Nuxt per semplicità
// 		return response;
// 	} catch (error) {
// 		console.error('Proxy fetch error:', error);
// 		throw createError({
// 			statusCode: 500,
// 			statusMessage: 'Proxy request failed',
// 		});
// 	}
// });
