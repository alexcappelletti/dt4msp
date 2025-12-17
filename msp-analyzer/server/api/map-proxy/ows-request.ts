import * as tilebelt from '@mapbox/tilebelt'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const { mapUrl, z, x, y, ...rest } = query
	console.log("ows req: ", mapUrl)
	if (!mapUrl) {
		return createError({ statusCode: 400, statusMessage: 'Missing mapUrl ' })
	}
	let url = new URL(mapUrl as string)

	// Calcolo BBOX da tile se z/x/y presenti
	if (z !== undefined && x !== undefined && y !== undefined) {
		const tile:tilebelt.Tile = [parseInt(x as string), parseInt(y as string), parseInt(z as string)]
		const [minLon, minLat, maxLon, maxLat] = tilebelt.tileToBBOX(tile)
		const bbox = `${minLon},${minLat},${maxLon},${maxLat}`

		// Imposta BBOX se non già presente
		if (!url.searchParams.has('bbox') && !url.searchParams.has('BBOX')) {
			url.searchParams.set("BBOX", bbox)
		}
	}
	for (const key in rest) {
		if (Object.prototype.hasOwnProperty.call(rest, key)) {
			const value = rest[key];
			if (value !== undefined) {
				// Assicurati che i valori siano gestiti come stringhe
				url.searchParams.set(key, String(value));
			}
		}
	}

	// // Configura parametri specifici per WFS
	// if (!url.searchParams.has('SERVICE')) url.searchParams.set('SERVICE', 'WFS')
	// if (!url.searchParams.has('VERSION')) url.searchParams.set('VERSION', '2.0.0')
	// if (!url.searchParams.has('REQUEST')) url.searchParams.set('REQUEST', 'GetFeature')
	// if (!url.searchParams.has('OUTPUTFORMAT')) url.searchParams.set('OUTPUTFORMAT', 'application/json')
	
	try {
		console.log("requ url: ",url.toString() )
		const response = (await fetch(url.toString())) as Response
		if (!response.ok) {
			console.error(`Errore HTTP: ${response.status} ${response.statusText}`)
			return createError({ statusCode: response.status, statusMessage: response.statusText })
		}

		const contentType = response.headers.get('content-type') || 'application/json'
		
		return new Response(await response.body, {
			status: 200,
			headers: { 'Content-Type': contentType }
		})
	} catch (err) {
		console.error('Errore durante il fetch:', err)
		return createError({ statusCode: 502, statusMessage: 'Proxy error' })
	}
})
