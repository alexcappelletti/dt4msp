import * as tilebelt from '@mapbox/tilebelt'
import type { Layer } from '#/shared/types/gn-layer'
import type { LngLatBoundsLike } from 'maplibre-gl'



export type OGSType = "wfs" | "wms" | "geojson" | "undefined";

interface OwsUrlOptions {
	z?: number
	x?: number
	y?: number
	params?: Record<string, string>
	bboxParamName?: string // default: 'bbox'
}


export const useLayerHelper = () => {
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




	const buildWfsGetFeatureParams = (
		l: Layer,
		options?: {
			cqlFilter?: string;
			maxFeatures?: number;
			srsName?: string;
			outputFormat?: string;
		}
	): Record<string, string> => {
		const defaultOptions = {
			outputFormat: 'application/json',
			srsName: 'EPSG:3857',
			maxFeatures: 50,
		};
		const merged = { ...defaultOptions, ...options }

		const params: Record<string, string> = {
			VERSION: '2.0.0',
			SERVICE: 'WFS',
			REQUEST: 'GetFeature',
			TYPENAME: `${l.workspace}:${l.name}`,
			OUTPUTFORMAT: merged.outputFormat,
			SRSNAME: merged.srsName,
			//maxFeatures: String(merged.maxFeatures),
		}
		if (merged.cqlFilter) {
			params['cql_filter'] = merged.cqlFilter;
		}

		return params
	}

	function featureUrl4Proxy(l: Layer, options?: OwsUrlOptions): string {
			const query = new URLSearchParams(buildWfsGetFeatureParams(l))
			query.set("mapUrl", l.ows_url)
			
			if (options?.z !== undefined) query.set('z', options.z.toString())
			if (options?.x !== undefined) query.set('x', options.x.toString())
			if (options?.y !== undefined) query.set('y', options.y.toString())
	
			if (options?.params) {
				for (const [key, value] of Object.entries(options.params)) {
					query.set(key, value)
				}
			}
			console.log("requesting:  ", query.toString())
			return `/api/map-proxy/ows-request?${query.toString()}`
		}
	/**
	  * Converte un oggetto BoundingBoxPolygon di GeoNode in un BBOX valido per MapLibre.
	  * Formato output: [minLng, minLat, maxLng, maxLat]
	  */
	const convertLLBoxToMapLibreBbox = (l: Layer): LngLatBoundsLike | null => {

		const ring = l.ll_bbox_polygon.coordinates?.[0]; // Accesso al primo anello

		if (!ring || ring.length < 1 || !Array.isArray(ring)) {
			console.error("LLBox coords are null or invalid.");
			return null;
		}
		if (!ring[0] || !Array.isArray(ring[0]) || ring[0].length < 2) {
			console.error("Il primo punto nel BBOX non è valido.");
			return null;
		}

		let minLng: number = ring[0]![0]!;
		let minLat: number = ring[0]![1]!;
		let maxLng: number = ring[0]![0]!;
		let maxLat: number = ring[0]![1]!;


		for (const point of ring) {
			const lng = point[0]!;
			const lat = point[1]!;

			minLng = Math.min(minLng, lng);
			minLat = Math.min(minLat, lat);
			maxLng = Math.max(maxLng, lng);
			maxLat = Math.max(maxLat, lat);
		}

		// MapLibre accetta esattamente questo formato: [west, south, east, north]
		return [minLng, minLat, maxLng, maxLat];
	}

	const buildWmsUrlForMapLibre = (l: Layer, opts?: OwsUrlOptions): string =>{
		const query = new URLSearchParams({
			mapUrl: l.ows_url,
			SERVICE: 'WMS',
			VERSION: '1.3.0',
			REQUEST: 'GetMap',
			LAYERS: l.alternate ?? `${l.workspace}:${l.name}`,
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
			query.set('z', opts.z?.toString() ?? "")
			query.set('x', opts.x?.toString() ??"")
			query.set('y', opts.y?.toString() ??"")
			query.set('BBOX', getBbox3857(opts.z ?? 0, opts.x ?? 0, opts.y ?? 0))
		}
		return `/api/map-proxy/wms-request?${query.toString()}&z={z}&x={x}&y={y}`
		
	}



	const ogcTypes = (l: Layer): OGSType[] => {
		const foundTypes = new Set<OGSType>();
		l.links.forEach(link => {
			if (link.link_type === 'OGC:WFS') {
				foundTypes.add('wfs');
			} else if (link.link_type === 'OGC:WMS') {
				foundTypes.add('wms');
			} else if (link.link_type === 'application/json' || link.url.endsWith('.geojson')) {
				foundTypes.add('geojson');
			}
		});

		if (foundTypes.size === 0) {
			foundTypes.add('undefined');
		}
		return Array.from(foundTypes);
	}

	return {
		buildWfsGetFeatureParams,
		ogcTypes,
		convertLLBoxToMapLibreBbox,
		featureUrl4Proxy,
		buildWmsUrlForMapLibre

	}


}