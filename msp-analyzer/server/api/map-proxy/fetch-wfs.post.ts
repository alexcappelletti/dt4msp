import WFS from 'ol/format/WFS';
import GeoJSON from 'ol/format/GeoJSON';
import type { Feature, GeoJsonProperties, Polygon } from 'geojson'; // Importa i tipi specifici per maggiore chiarezza


import type { Layer } from '#/shared/types/gn-layer'
import { useLayerHelper } from '@/composables/useLayerHelper'
import * as turf from '@turf/turf';



export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const xmlPayload: string | undefined = body.lyPayload
	const ows_url: string | undefined = body.owl_url

	if (xmlPayload === undefined) {
		return createError({ statusCode: 400, statusMessage: 'Missing layer-payload for request' })
	}
	if (ows_url === undefined) {
		return createError({ statusCode: 400, statusMessage: 'Missing layer owl_url for request' })
	}
	try {
		console.log("-payload: ", xmlPayload)
		//const url2 = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
		const response = await fetch(ows_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
			},
			body: xmlPayload,
		});

		let geojsonData = (await response.json()) as GeoJSON.FeatureCollection;
		if (geojsonData && geojsonData.type === "FeatureCollection") {
			const originalCount = geojsonData.features.length;
			geojsonData.features = geojsonData.features.map(feature => {
				if (!feature || !feature.geometry || !feature.geometry.type) {
					console.warn("invalid feature or geometry null, excluding:", feature.id);
					return null; // Contrassegna per l'esclusione
				}
				try {
					feature.geometry = turf.cleanCoords(feature.geometry);
					if (!feature.geometry) {
						return null;
					}
				} catch (e: any) {
					console.warn("can't clean feature, skip it ", e.message);
					return null; // Contrassegna per l'esclusione
				}
				return feature;
			}).filter(Boolean) as Feature<any, GeoJsonProperties>[]; //esclude null

			if (geojsonData.features.length > 0) {
				const tolerance = 0.0001;
				try {
					geojsonData = turf.simplify(geojsonData, { tolerance: tolerance, highQuality: false });
				} catch (e) {
					console.warn("Turf error in simplify action:", e);
				}
			}
			//ne prendo poche:
			//geojsonData.features = geojsonData.features.slice(0, 50);
			console.log(`read ${geojsonData.features.length} features from ${originalCount} by WFS service`);
		}
		return geojsonData as GeoJSON.FeatureCollection;
	}
	catch (err) {
		console.error("feature request err:", err)
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: no features read',
		});

	}


});