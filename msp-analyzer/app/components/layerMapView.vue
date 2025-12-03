<!-- components/geospatial/MapViewer.vue (modificato) -->
<script setup lang="ts">
import { shallowRef, watch, onMounted, onUnmounted } from 'vue';
import maplibregl, { Map as MaplibreMap } from 'maplibre-gl';
import type { Layer } from '#/shared/types/gn-layer';
import { useLayerHelper } from '@/composables/useLayerHelper';

const MarMediterraneo = { center: [8.01419, 37.89222] as maplibregl.LngLatLike, zoom: 5.0 }	

const ESRI_APIKEY = "AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTNIlRYVvxbQjLzaP8nBzH_b9mqspYcaz4ndzHeyjVzD3ZEbNgRdTUwCPlZDm5A2xuAFgzeES7XcWB0s81eXFW7FIr0z0OTu27HBXm2W81y4Sca7zEGL9BQg-bq8vMU28suXRlP-AyOWLXBNadCQrNZl53Yo3tO2BWKB_qjyUXVOeuDLMMOeI0oMgyGKV95U8Gk.AT1_UFi7OU63"
const basemapURL = "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const basemapEnum = "arcgis/topographic";

const MAP_STYLE = {
	version: 8,
	sources: {
		// Un layer base di sfondo, qui OpenStreetMap
		'osm-base': {
			type: 'raster',
			tiles: ['a.tile.openstreetmap.org{z}/{x}/{y}.png'],
			tileSize: 256,
			maxzoom: 19,
		},
	},
	layers: [
		{
			id: 'osm-base-layer',
			type: 'raster',
			source: 'osm-base',
		},
	],
};


const props = defineProps<{
	activeLayers: Layer[];
}>();
const {convertLLBoxToMapLibreBbox, 
	ogcTypes,
	featureUrl4Proxy,
	buildWmsUrlForMapLibre } = useLayerHelper();
const mapContainer = shallowRef(null);
const map = shallowRef<MaplibreMap | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(0)

const initializeMap = () => {
	// ... (logica inizializzazione mappa) ...
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style: `${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		center: MarMediterraneo.center, 
		zoom: MarMediterraneo.zoom

	});
	map.value.on('load', () => {
		console.log("loaded map ")
		updateMapLayers();
	});
	map.value.on('error', (e) => { console.error('Errore mappa:', e) });
	map.value.on('move', () => { updateMapInfo() });
};

const updateMapLayers = () => {
	if (!map.value) { return; }

	const mapInstance = map.value;
	const currentLayerIds = mapInstance.getStyle().layers.map(l => l.id);

	// 1. Rimuovi i layer che non sono più nell'array di quelli attivi
	currentLayerIds.forEach(id => {
		if (id.startsWith('layer-') && !props.activeLayers.some(l => `layer-${l.pk}` === id)) {
			mapInstance.removeLayer(id);
			if (mapInstance.getSource(id)) { mapInstance.removeSource(id); }
		}
	});

	let boundsAdded = false;
	console.log("updateMapLayers #", props.activeLayers.length)
	// 2. Aggiungi o aggiorna i layer attivi
	props.activeLayers.forEach(layer => {
		const sourceId = `source-${layer.pk}`;
		const layerId = `layer-${layer.pk}`;

		const types  = ogcTypes(layer);

		if (!mapInstance.getSource(sourceId)) {
			console.log("qui si")
			if (types.some(t => t === "wfs")){
				
				console.log("qui si")
				const tileUrl = featureUrl4Proxy(layer);
				mapInstance.addSource(sourceId, {
					type: 'vector',
					tiles:[ tileUrl],
				})
				mapInstance.addLayer({
					id: layerId,
					type: 'fill',
					source: sourceId,
					'source-layer': layer.alternate,
					// paint: {
					// 	'fill-color': '#088',
					// 	'fill-opacity': 0.5,
					// 	'fill-outline-color': '#000000'
					// }
				})
			}
			else if (types.some(t => t ==="wms")) {
				const tileTemplate = buildWmsUrlForMapLibre(layer)
				// mapInstance.addSource(sourceId, {
				// 	type: 'raster',
				// 	tiles: [tileTemplate], 
				// 	tileSize: 256,
				// });
				// mapInstance.addLayer({
				// 	id: layerId,
				// 	type: 'raster',
				// 	source: sourceId,
				// 	paint: {
				// 		'raster-opacity': 1 
				// 	}
				// })
			}
			else return;
		}

		// Centra sulla vista del primo layer aggiunto, se non è ancora stato fatto
		if (!boundsAdded && layer.ll_bbox_polygon && layer.ll_bbox_polygon.coordinates) {
			const bBox = convertLLBoxToMapLibreBbox(layer)
			if (bBox) {
				mapInstance.fitBounds(bBox,{ padding: 20, duration: 1000 })
				boundsAdded = true;
			}
			
		}
	});
};


onMounted(initializeMap);
onUnmounted(() => { if (map.value) map.value.remove(); });


watch(() => props.activeLayers, () => {
	updateMapLayers();
}, { deep: true });

function updateMapInfo() {
	if (map.value) {
		const center = map.value.getCenter();
		centerCoords.value = [center.lng, center.lat];
		zoomLevel.value = map.value.getZoom();
	}
}
function getBoundingBox(): [number, number, number, number] | null {
	if (!map.value) return null;
	const bounds = map.value.getBounds();
	return [
		bounds.getWest(),  // minX
		bounds.getSouth(), // minY
		bounds.getEast(),  // maxX
		bounds.getNorth()  // maxY
	];
}


</script>

<template>
	<div ref="mapContainer" class="tw:w-full tw:h-full tw:relative tw:bg-green-500 tw:border-1 tw:rounded-md tw:shadow-inner"></div>
</template>
