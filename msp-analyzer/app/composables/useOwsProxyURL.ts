import * as tilebelt from '@mapbox/tilebelt'
import type { MapVisual, Visual } from '@/models/visual'



interface OwsUrlOptions {
	z?: number
	x?: number
	y?: number
	params?: Record<string, string>
	bboxParamName?: string // default: 'bbox'
	
}




export function useProxyMapServices() {
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
	function buildWmsUrlForMapLibre(mapVisual: MapVisual, opts?: OwsUrlOptions): string {
		const query = new URLSearchParams({
			mapUrl: mapVisual.serviceUrl,
			SERVICE: 'WMS',
			VERSION: '1.3.0',
			REQUEST: 'GetMap',
			LAYERS: mapVisual.layerName ?? '',
			FORMAT: 'image/png',
			TRANSPARENT: 'true',
			CRS: 'EPSG:3857',
			WIDTH: '256',
			HEIGHT: '256',
			BBOX: '{bbox-epsg-3857}'
		})

		//Aggiungi parametri custom
		for (const [key, value] of Object.entries(opts?.params ??{})) {
			query.set(key.toUpperCase(), value)
		}
		opts = opts ?? {z:undefined, x:undefined, y:undefined}
		// Se serve BBOX calcolato da z/x/y
		const bboxPlaceholder = query.get('BBOX')
		const shouldInjectBbox = bboxPlaceholder?.includes('{bbox-epsg-3857}') 
			&& opts?.z !== undefined 
			&& opts?.x !== undefined 
			&& opts?.y !== undefined
		if (shouldInjectBbox) {
			query.set('z', opts.z.toString())
			query.set('x', opts.x.toString())
			query.set('y', opts.y.toString())
			query.set('BBOX', getBbox3857(opts.z, opts.x, opts.y))
		}
		return `/api/map-proxy/wms-request?${query.toString()}&z={z}&x={x}&y={y}`
		
	}

	function buildFeaturesUrl(visual: MapVisual, options?: OwsUrlOptions): string {
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

		return `/api/map-proxy/ows-request?${searchParams.toString()}`
	}


	return { 
		buildWmsUrlForMapLibre,
		buildFeaturesUrl
	}
}
