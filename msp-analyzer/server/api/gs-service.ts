import * as tilebelt from '@mapbox/tilebelt'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const { mapUrl, ows_type, z, x, y, layers, ...rest } = query

	if (!mapUrl || !ows_type) {
		return createError({ statusCode: 400, statusMessage: 'Missing mapUrl or ows_type' })
	}

	const url = new URL(mapUrl as string)

	

	// Calcolo BBOX da tile se z/x/y presenti
	if (z !== undefined && x !== undefined && y !== undefined) {
		const tile:tilebelt.Tile = [parseInt(x as string), parseInt(y as string), parseInt(z as string)]
		const [minLon, minLat, maxLon, maxLat] = tilebelt.tileToBBOX(tile)
		const bbox = `${minLon},${minLat},${maxLon},${maxLat}`

		// Imposta BBOX se non già presente
		if (!url.searchParams.has('bbox') && !url.searchParams.has('BBOX')) {
			const bboxParam = ows_type === 'vector' ? 'BBOX' : 'bbox'
			url.searchParams.set(bboxParam, bbox)
		}
	}

	// Configura parametri specifici per WFS
	if (!url.searchParams.has('SERVICE')) url.searchParams.set('SERVICE', 'WFS')
	if (!url.searchParams.has('VERSION')) url.searchParams.set('VERSION', '2.0.0')
	if (!url.searchParams.has('REQUEST')) url.searchParams.set('REQUEST', 'GetFeature')
	if (!url.searchParams.has('OUTPUTFORMAT')) url.searchParams.set('OUTPUTFORMAT', 'application/json')
	
	// Configura parametri specifici per GeoJSON REST
	if (ows_type === 'geojson') {
		url.searchParams.set('typename', layers?.toString() || '')
	}

	try {
		console.log("requesting... " + url.toString())
		const response = await fetch(url.toString())
		if (!response.ok) {
			console.error(`Errore HTTP: ${response.status} ${response.statusText}`)
			return createError({ statusCode: response.status, statusMessage: response.statusText })
		}

		const contentType = response.headers.get('content-type') || 'application/json'
		const text = await response.text()

		return new Response(text, {
			status: 200,
			headers: { 'Content-Type': contentType }
		})
	} catch (err) {
		console.error('Errore durante il fetch:', err)
		return createError({ statusCode: 502, statusMessage: 'Proxy error' })
	}
})
