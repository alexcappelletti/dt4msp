import * as tilebelt from '@mapbox/tilebelt'


export default defineEventHandler(async (event) => {

	const query = getQuery(event)
	const { mapUrl, z, x, y, ...rest } = query

	if (!mapUrl) {
		return createError({ statusCode: 400, statusMessage: 'Missing mapUrl' })
	}

	// Costruisci URL base
	const url = new URL(mapUrl as string)
	for (const [key, value] of Object.entries(rest)) {
		url.searchParams.set(key, value as string)
	}

	// Se serve BBOX calcolato da z/x/y
	const bboxPlaceholder = url.searchParams.get('BBOX')
	const shouldInjectBbox =
		bboxPlaceholder?.includes('{bbox-epsg-3857}') &&
		z !== undefined &&
		x !== undefined &&
		y !== undefined

	if (shouldInjectBbox) {
		const tile = [parseInt(x as string), parseInt(y as string), parseInt(z as string)] as tilebelt.Tile
		const bbox4326 = tilebelt.tileToBBOX(tile)

		const project = (lon: number, lat: number): [number, number] => {
			const R = 6378137
			const x = R * lon * Math.PI / 180
			const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))
			return [x, y]
		}

		const [minX, minY] = project(bbox4326[0], bbox4326[1])
		const [maxX, maxY] = project(bbox4326[2], bbox4326[3])
		const bbox = `${minX},${minY},${maxX},${maxY}`

		url.searchParams.set('BBOX', bbox)
	}

	try {
		//console.log("wms url: ", url.toString())
		const response:any = await fetch(url.toString())
		if (!response.ok) {
			console.error(`Errore HTTP: ${response.status} ${response.statusText}`)
			return createError({ statusCode: response.status, statusMessage: response.statusText })
		}
		const contentType = response.headers.get('content-type') || 'image/png'
		const buffer = await response.arrayBuffer()

		return new Response(buffer, {
			status: 200,
			headers: { 'Content-Type': contentType }
		})
	} catch (err) {
		return createError({ statusCode: 502, statusMessage: 'Proxy error' })
	}
})