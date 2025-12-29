<!-- components/geospatial/MapViewer.vue (modificato) -->
<script setup lang="ts">
import { shallowRef, watch, onMounted, onUnmounted, ref } from 'vue';
import maplibregl, { Map as MaplibreMap, type LayerSpecification } from 'maplibre-gl';
import type { Layer } from '#/shared/types/gn-layer';
import { useLayerHelper, type OGSType } from '@/composables/useLayerHelper';
import { useLayeredMapStore } from '~/stores/layeredMapStore';
//@ts-ignore
maplibregl.config.FILL_LARGE_MESH_ARRAYS = true;
const ESRI_APIKEY = "AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTP7fd66lmhb44NjpznHUMmUbUW4c5zuBA0K1q_2W1WwqW0rGcK-V8LjzvjmnL558_Hn7DLP25ffbh9UVMXFGHbmv6IPCCqHSu6sXStyeDtpHbxUejS9G9aGbVdYUqqP6j4GR1mLv7IUpEzZZoTZLQTmg2voDNClLdhDMjLPcqPZDRB4d2PplWgNJZLPH0EAWJ4.AT1_UFi7OU63"
const basemapURL = "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const basemapEnum = "arcgis/topographic";
const MarMediterraneo = { center: [8.01419, 37.89222] as maplibregl.LngLatLike, zoom: 5.0 }

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
const mapStore = useLayeredMapStore();
const { convertLLBoxToMapLibreBbox } = useLayerHelper();

const mapContainer = shallowRef(null);
const map = shallowRef<MaplibreMap | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(0)

const dynamicLayerIds = shallowRef<string[]>([]);
const dynamicSourceIds = shallowRef<string[]>([]);
const isLoadingLayers = ref(false);	


const initializeMap = () => {
	// ... (logica inizializzazione mappa) ...
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style:`${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		center: MarMediterraneo.center,
		zoom: MarMediterraneo.zoom

	});
	map.value.on('load', async () => {
		console.log("loaded map ")
		await updateMap();
	});
	map.value.on('error', (e) => { console.error('Errore mappa:', e) });
	map.value.on('move', () => { updateMapInfo() });
};


watch(
	[() => mapStore.getGnLayers, ()=> mapStore.selectedOGCType],
	async ([newGnLayers, newTypeFilter], [oldLayers, oldFilter]) => {
		if (newGnLayers === oldLayers && newTypeFilter === oldFilter) {
			return; 
		}	
		try{updateMap();} 
		catch (err) {console.error("Errore durante l'aggiornamento della mappa: ", err);}
	}, 
	{ immediate: true, deep: true });

function clearMap() {
    if (!map.value) return;
    dynamicLayerIds.value.forEach(id => {
		if (map.value?.getLayer(id)) {
			map.value.removeLayer(id);
	}});
	dynamicLayerIds.value = []; 
	dynamicSourceIds.value.forEach(id => {
		if (map.value?.getSource(id)) {
			map.value.removeSource(id);
		}
	});
	dynamicSourceIds.value = []; 
	
}

async function updateMap() {
	if (!map.value || !map.value.isStyleLoaded()) return;
    clearMap();
	const mapInstance = map.value;
	
	const results = mapStore.getFeaturedLayersState
	results.forEach(fState => {
		if (fState.fetchStatus !== 'idle' || !fState.geojsonData) {return;}
		const { geonodeLayer, geojsonData, styles } = fState;
		const sourceId = `source-${geonodeLayer.pk}`;
		if (mapInstance.getSource(sourceId) !== undefined) {
			console.log("source already set; skip it " + sourceId)
			return;
		}
		console.log("now add WFS/GeoJSON source! ", geojsonData.features.length)
		mapInstance.addSource(sourceId, {
			type: 'geojson',
			data: geojsonData,
		});
		dynamicSourceIds.value.push(sourceId);
		console.log("found styles: ", styles.length)
		if (styles.length === 0) {	
			const geometryType = geojsonData.features?.[0]?.geometry?.type;
			function getLayerConfig(): LayerSpecification {
				if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
					return {
						id: `layer-${geonodeLayer.pk}`,
						source: sourceId,
						type: 'fill',
						paint: { 'fill-color': '#088', 'fill-opacity': 0.5 } 
					};
				} else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
					return {
						id: `layer-${geonodeLayer.pk}`,
						source: sourceId,
						type: 'line',
						paint: { 'line-color': '#000000', 'line-width': 2 } 
					};
				} else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
					return {
						id: `layer-${geonodeLayer.pk}`,
						source: sourceId,
						type: 'circle',
						paint: { 'circle-color': '#FF0000', 'circle-radius': 6 }
					};
				} else {
					// Default a symbol se il tipo non è riconosciuto
					return {
						id: `layer-${geonodeLayer.pk}`,
						source: sourceId,
						type: 'fill',
						paint: {'fill-color': '#02Ae23', 'fill-opacity': 0.3} 
					};
				}
			}
			const layerConfig = getLayerConfig();
			mapInstance.addLayer(layerConfig)
			dynamicLayerIds.value.push(layerConfig.id);
		}
		else {
			let sCount = 0;
			styles.forEach(s => {
				s.source = sourceId;
				console.log("adding styled layer for " + s.id)
				mapInstance.addLayer(s);
				dynamicLayerIds.value.push(s.id);
			});
			
		}
	});

	mapStore.getRasterLayersState.forEach(lState => {
		const sourceId = `source-${lState.geonodeLayer.pk}`;
		const layerId = `layer-${lState.geonodeLayer.pk}`;

		if (!mapInstance.getSource(sourceId)) {
			console.log("now add WMS source! ", lState.geonodeLayer.name)
			mapInstance.addSource(sourceId, {
				type: 'raster',
				tiles: lState.rasterTiles,
				tileSize: 256,
			});
			dynamicSourceIds.value.push(sourceId);
			mapInstance.addLayer({
				id: layerId,
				type: 'raster',
				source: sourceId,
				paint: {
					'raster-opacity': 1
				}
			});
			dynamicLayerIds.value.push(layerId);
		}

	});


	// --- FASE 3: Centratura della mappa (una volta che tutto è aggiunto) ---
	let boundsAdded = false;
	mapStore.getGnLayers.forEach(layer => {
		if (!boundsAdded && layer.ll_bbox_polygon) {
			const bBox = convertLLBoxToMapLibreBbox(layer);
			if (bBox) {
				mapInstance.fitBounds(bBox, { padding: 20, duration: 1000 });
				boundsAdded = true;
			}
		}
	});
	isLoadingLayers.value = false; 
};


onMounted(initializeMap);
onUnmounted(() => { if (map.value) map.value.remove(); });

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
	<div class="map-container-wrapper">
		<!-- Il contenitore della mappa deve essere relativo per il posizionamento assoluto dello spinner -->
		<div ref="mapContainer" class="map-container"></div>

		<!-- Overlay di caricamento Vuetify -->
		<v-overlay 
			:model-value="mapStore.isAnyLayerLoading" 
			class="align-center justify-center"
			persistent
			contained
		>
			<v-progress-circular
				color="primary"
				indeterminate
				size="64"
			></v-progress-circular>
		</v-overlay>

        <!-- Informazioni sulla mappa (opzionale) -->
        <div class="map-info">
            Center: {{ centerCoords[0].toFixed(4) }}, {{ centerCoords[1].toFixed(4) }} | Zoom: {{ zoomLevel.toFixed(2) }}
        </div>
	</div>
</template>


<style scoped>
.map-container-wrapper {
	position: relative; /* Importante per 'contained' di v-overlay */
	height: 600px; /* Imposta un'altezza fissa o gestiscila con flexbox */
	width: 100%;
}

.map-container {
	width: 100%;
	height: 100%;
}

.map-info {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(255, 255, 255, 0.8);
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 10;
}
</style>