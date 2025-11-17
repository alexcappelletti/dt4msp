import * as tilebelt from '@mapbox/tilebelt'
import type { Visual } from '@/models/visual'



interface OWSFeatureUrlOptions {
	z?: number
	x?: number
	y?: number
	params?: Record<string, string>
	bboxParamName?: string // default: 'bbox'
	
}




export function useOwsProxyUrl() {
	const projectTo3857 = (lon: number, lat: number): [number, number] => {
	const R = 6378137
	const x = R * lon * Math.PI / 180
	const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))
	return [x, y]
	}

	const getBbox3857 = (z: number, x: number, y: number): string => {
	const bbox4326 = tilebelt.tileToBBOX([x, y, z])
	const [minX, minY] = projectTo3857(bbox4326[0], bbox4326[1])
	const [maxX, maxY] = projectTo3857(bbox4326[2], bbox4326[3])
	return `${minX},${minY},${maxX},${maxY}`
	}

	const buildWmsUrl = ({
		mapUrl,
		service = 'WMS',
		request = 'GetMap',
		params = {},
		z,
		x,
		y
		}: {
		mapUrl: string
		service?: string
		request?: string
		params?: Record<string, string>
		z?: number
		x?: number
		y?: number
		}): string => {
		const query = new URLSearchParams({
			mapUrl,
			SERVICE: service,
			REQUEST: request
		})

		// Aggiungi parametri custom
		for (const [key, value] of Object.entries(params)) {
			query.set(key.toUpperCase(), value)
		}

		// Se serve BBOX calcolato da z/x/y
		const bboxPlaceholder = query.get('BBOX')
		const shouldInjectBbox =
			bboxPlaceholder?.includes('{bbox-epsg-3857}') &&
			z !== undefined &&
			x !== undefined &&
			y !== undefined

		if (shouldInjectBbox) {
			query.set('z', z.toString())
			query.set('x', x.toString())
			query.set('y', y.toString())
			query.set('BBOX', getBbox3857(z, x, y))
		}

		return `/api/geoserver-maplibre-proxy?${query.toString()}`
	}

	function buildFeaturesUrl(visual: Visual, options?: OWSFeatureUrlOptions): string {
		const searchParams = new URLSearchParams()

		searchParams.set('mapUrl', visual.serviceUrl)
		searchParams.set('ows_type', visual.layerType)
		searchParams.set('layers', visual.layerName)

		if (options?.z !== undefined) searchParams.set('z', options.z.toString())
		if (options?.x !== undefined) searchParams.set('x', options.x.toString())
		if (options?.y !== undefined) searchParams.set('y', options.y.toString())

		if (options?.params) {
			for (const [key, value] of Object.entries(options.params)) {
				searchParams.set(key, value)
			}
		}

		return `/api/gs-service?${searchParams.toString()}`
	}


	return { 
		buildWmsUrl,
		buildFeaturesUrl }
}
