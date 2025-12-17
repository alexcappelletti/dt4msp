<script setup lang="ts">
import { ref, computed } from 'vue';
import { shallowRef, watch, onMounted, onUnmounted } from 'vue';
import maplibregl, { Map as MaplibreMap } from 'maplibre-gl';
import type { Layer } from '#/shared/types/gn-layer';

const MarMediterraneo = { center: [8.01419, 37.89222] as maplibregl.LngLatLike, zoom: 5.0 }	
const Trapani = {center: [12.4833, 38.0167] as maplibregl.LngLatLike, zoom: 12 }
const ESRI_APIKEY = "AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTNIlRYVvxbQjLzaP8nBzH_b9mqspYcaz4ndzHeyjVzD3ZEbNgRdTUwCPlZDm5A2xuAFgzeES7XcWB0s81eXFW7FIr0z0OTu27HBXm2W81y4Sca7zEGL9BQg-bq8vMU28suXRlP-AyOWLXBNadCQrNZl53Yo3tO2BWKB_qjyUXVOeuDLMMOeI0oMgyGKV95U8Gk.AT1_UFi7OU63"
const basemapURL = "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const basemapEnum = "arcgis/topographic";

const mapContainer = shallowRef(null);
const map = shallowRef<MaplibreMap | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(20)
const activeLayers = ref<Layer[]>([]);

const initializeMap = () => {
	// ... (logica inizializzazione mappa) ...
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style: `${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		// center: [-122.447303, 37.753574],
		// zoom: 13
		center: Trapani.center, 
		zoom: Trapani.zoom

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
	const sourceId = `source-${1}`;
	const layerId = `layer-${1}`;
	const types  = ["wfs"]
	if (!mapInstance.getSource(sourceId)) {
		console.log("qui si")
		if (types.some(t => t === "wfs")){
			
			console.log("qui si")
			const tileUrl = "";
			mapInstance.addSource('contours', {
				type: 'vector',
				//tiles:[ "http://localhost:3000"+tileUrl],
				url:"https://api.maptiler.com/tiles/contours/tiles.json?key=Mvvx2kpF9y1yah2p0HnG",
			})
		mapInstance.addLayer({
            'id': 'contour-lines',
            'type': 'line',
            'source': 'contours',
            'source-layer': 'contour',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
           
        });

        mapInstance.addLayer({
            'id': 'contour-labels',
            'type': 'symbol',
            'source': 'contours',
            'source-layer': 'contour',
            "layout": {
              "text-field": "{height}",
              "symbol-placement": "line",
              "text-font": ["Noto Sans Regular"],
            },
            'paint': {
                'text-color': '#ff69b4',
            }
        });
		}
		else if (types.some(t => t ==="wms")) {
			const tileTemplate = ""
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
};
function updateMapInfo() {
	if (map.value) {
		const center = map.value.getCenter();
		centerCoords.value = [center.lng, center.lat];
		zoomLevel.value = map.value.getZoom();
	}
}

onMounted(initializeMap);
onUnmounted(() => { if (map.value) map.value.remove(); });


watch(() => activeLayers, () => {
	updateMapLayers();
}, { deep: true });

</script>

<template>
	<div class="container">
		<div ref="mapContainer" class="tw:w-full tw:h-full tw:relative tw:bg-green-500 tw:border-1 tw:rounded-md tw:shadow-inner"></div>
	</div>
</template>

<style scoped lang="css">
@reference "@/assets/css/tailwind.css";

.container {
	@apply 
		tw:min-h-screen;
	padding: 20px;
}

.content-wrapper {
	margin-top: 20px;
}

.scrollable-list {
	list-style-type: none;
	padding: 0;
	/* Imposta l'altezza massima desiderata, es: 400px o 50vh */
	
	max-height: 1000px;
	overflow-y: auto;
	overflow-x: hidden;

	/* Opzionale: aggiunge un bordo se vuoi visibilità */
	border-top: 1px solid #eee;
}


.details-panel {
	@apply 
		tw:flex tw:flex-col tw:h-full;
	padding: 15px;
	border: 1px solid #ccc;
	border-radius: 5px;
	min-height: 300px;
}


/* STILI AGGIUNTI PER THUMBNAIL E MAPPA */
.thumbnail-container {
    margin-bottom: 15px;
    text-align: center;
}

.layer-thumbnail {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}




.layer-list-panel ul {
	list-style-type: none;
	padding: 0;
}

.error {
	color: red;
	margin-top: 10px;
}

ul li {
	cursor: pointer;
	padding: 8px 5px;
	border-bottom: 1px solid #eee;
	transition: background-color 0.2s;
}

ul li:hover {
	background-color: #f0f0f0;
}

ul li.selected {
	background-color: #e0e0e0;
	font-weight: bold;
}

.details-panel h3 {
	margin-top: 10px;
	margin-bottom: 5px;
}
</style>
