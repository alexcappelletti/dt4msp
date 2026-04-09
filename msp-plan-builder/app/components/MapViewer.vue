<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import maplibregl, { type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useProxyMapServices } from '~/composables/useOwsProxyURL';
import type { MapRequest } from '#/shared/types/mapRequest';





const props = withDefaults(defineProps<{
	// Cambiato il tipo della prop da MapVisual a MapVisualInterface
	visuals: Array<MapRequest>,
	info: boolean,
}>(), {
	visuals: () => [], // Factory function per array/oggetti
	info: false,
});

// ... (ESRI_APIKEY, basemapURL, proxyUrl, basemapEnum, coords objects, etc. rimangono uguali) ...
//const ESRI_APIKEY = "AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTNIlRYVvxbQjLzaP8nBzH_b9mqspYcaz4ndzHeyjVzD3ZEbNgRdTUwCPlZDm5A2xuAFgzeES7XcWB0s81eXFW7FIr0z0OTu27HBXm2W81y4Sca7zEGL9BQg-bq8vMU28suXRlP-AyOWLXBNadCQrNZl53Yo3tO2BWKB_qjyUXVOeuDLMMOeI0oMgyGKV95U8Gk.AT1_UFi7OU63"
const ESRI_APIKEY = "AAPTamBcW2CEWxstDTu3oZc8atA..1V_5I8LeEygMhB-1wvwgzIuaXdwuA12EAp3wByBusVUUZhdQc3ufHAD5i0Uz0LeMIk0orAHl7LsTBOfEV22eGKl7rdhhVcSkD9Vbrpy1Ce5C4laKH2iTWV4qKEuN1WRVmUbcDv9YETRgRw-O2GLu6tR5Mipas4geYZOx-d63HrGD0-FerhUqk7Tt5kdyZfRorMcKkgz9N3iS_qEMB-CQOpTx2ZDs-Zi3Q7Ouiul502ssgOILh26sPls.AT1_UFi7OU63"
const basemapURL = "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const basemapEnum = "arcgis/topographic";
const SaintLucia = { center: [-62.7250, 14.72225] as LngLatLike, zoom: 7.76 }
const FasciaCostiera = { center: [13.83100, 37.07896] as LngLatLike, zoom: 10.5 }
const Messina = { center: [15.61502, 38.23433] as LngLatLike, zoom: 12.70 }
const MarMediterraneo = { center: [8.01419, 37.89222] as LngLatLike, zoom: 5.0 }
const SOS = { center: [13.14948, 36.67817] as LngLatLike, zoom: 7.2 }


const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<maplibregl.Map | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(0);
const activeLayers = ref<Record<string, boolean>>({});


const { buildWmsUrlForMapLibre, buildFeaturesUrl } = useProxyMapServices()




//
//const sample = 'https://ows.emodnet-bathymetry.eu/wms?request=GetMap&styles&format=image/png&layers=emodnet:mean_multicolour&WIDTH=500&HEIGHT=500&BBOX=-70.5000000000000000,11.0000000000000000,43.0000000000000853,90.0000000000000000&transparent=true&SERVICE=WMS&VERSION=1.3.0'
//const sample = 'https://ows.emodnet-bathymetry.eu/wms?' 


onMounted(() => {
	if (!mapContainer.value) return
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style: `${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		center: MarMediterraneo.center, // [lng, lat]
		zoom: MarMediterraneo.zoom,
	})

	// Gestione eventi mappa
	map.value.on('load', () => {
		console.log('Base Map loaded');
		// Chiama la funzione per aggiungere i layer iniziali/correnti
		addVisualLayers(props.visuals);
		updateMapInfo();
		nextTick(() => map.value?.resize());
	});

	map.value.on('error', (e) => { console.error('Errore mappa:', e) });
	//map.value.on('move', () => { updateMapInfo() });
});


watch(() => props.visuals, (newVisuals) => {
	// Questo si attiva ogni volta che lo store aggiorna la prop 'visuals'
	console.log("Props visuals aggiornate, aggiungo i layer...");
	addVisualLayers(newVisuals);
}, { deep: true }); // deep: true è utile se la struttura interna cambia


// Funzione helper per aggiungere i layer alla mappa
function addVisualLayers(visuals: MapRequest[]) {
	if (!map.value || !map.value.isStyleLoaded()) {
		console.log("Mappa non ancora pronta, skippo l'aggiunta layer.");
		return;
	}

	// Rimuovi eventuali sorgenti/layer precedenti se necessario, per evitare duplicati
	// (Implementazione di rimozione omessa per brevità, ma necessaria per un'app robusta)

	visuals.forEach((visual, index) => {
		try {
			if (visual.serviceUrl && visual.layerName) {
				console.log(`Aggiunta visual: ${visual.layerName}`);
				setSource(visual);
				activeLayers.value[getLayerId(visual)] = true;
			} else {
				console.log(`Visual non valido all'indice ${index}`);
			}
		}
		catch (error) {
			console.error(`Errore nell'aggiunta della sorgente/layer per visual ${index}:${error}`);
		}
	});
}



function getLayerId(visual: MapRequest): string {
	// Usa visual.layerName?.replace(/.../)
	return `layer-source-${visual.layerName?.replace(/[^a-zA-Z0-9]/g, '-')}`; // Aggiunto fallback index
}

// !!! Correzioni nella funzione setSource per i tipi !!!
function setSource(visual: MapRequest) {
	const sourceId = `source-${visual.layerName?.replace(/[^a-zA-Z0-9]/g, '-')}`;
	const mapObj = map.value
	if (mapObj === null) {
		console.error("null map!")
		return;
	}
	// Nota: MapVisualInterface ha standardType come proprietà, non layerType
	if (visual.standardType === 'vector') {
		const tilesURL = buildFeaturesUrl(visual)
		mapObj.addSource(sourceId, {
			type: 'vector',
			tiles: [tilesURL],
			minzoom: visual.zoomLevel || 0,
		});
		mapObj.addLayer({
			id: `layer-${sourceId}`,
			type: 'fill',
			source: sourceId,
			'source-layer': visual.layerName || '',
			paint: {
				'fill-color': '#088',
				'fill-opacity': 0.5,
				'fill-outline-color': '#000000'
			}
		});
	} else if (visual.standardType === 'geojson') {
		const dataUrl = buildFeaturesUrl(visual)
		mapObj.addSource(sourceId, {
			type: 'geojson',
			data: dataUrl
		});
		mapObj.addLayer({
			id: `layer-${sourceId}`,
			type: 'fill',
			source: sourceId,
			// Assicurati che visual.viewStyle sia compatibile con maplibre paint properties
			paint: visual.viewStyle || {}
		});
	} else if (visual.standardType === 'raster') {
		const tileTemplate = buildWmsUrlForMapLibre(visual)
		mapObj.addSource(sourceId, {
			type: 'raster',
			tiles: [tileTemplate],
			tileSize: 256,
		});
		mapObj.addLayer({
			id: `layer-${sourceId}`,
			type: 'raster',
			source: sourceId,
			paint: {
				'raster-opacity': 1
			}
		});
	} else { throw new Error(`Unsupported standard type: ${visual.standardType ?? 'undefined'}`) }
}
function toggleLayer(layerId: string) {
	const visibility = map.value?.getLayoutProperty(layerId, 'visibility');
	const newVisibility = visibility === 'none' ? 'visible' : 'none';
	map.value?.setLayoutProperty(layerId, 'visibility', newVisibility);
	activeLayers.value[layerId] = newVisibility === 'visible';
}
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
type FlyOptions = {
	from: [number, number]; // [lng, lat]
	to: [number, number];   // [lng, lat]
	fromZoom?: number;
	toZoom?: number;
	speed?: number;
	curve?: number;
	bearing?: number;
	pitch?: number;
	delay?: number;
};

function flyToPosition(options: FlyOptions) {
	if (!map.value) return;

	const {
		from,
		to,
		fromZoom = 7,
		toZoom,
		speed = 0.8,
		curve = 1.5,
		bearing = 0,
		pitch = 0,
		delay = 1000
	} = options;

	// Imposta la vista iniziale
	map.value.jumpTo({
		center: from,
		zoom: fromZoom,
		bearing,
		pitch
	});

	// Avvia l'animazione dopo un breve delay
	setTimeout(() => {
		map.value?.flyTo({
			center: to,
			zoom: toZoom,
			speed,
			curve,
			bearing,
			pitch,
			easing: (t) => t
		});
	}, delay);
}

</script>

<template>
	<div class="tw:relative tw:bg-green-500 tw:border-1 tw:h-full tw:w-full">

		<div ref="mapContainer" class="tw:h-full tw:w-full"></div>

		<!-- Pannello laterale -->
		<div v-if="props.info" class="cmd-panel">
			<!-- ... (display info: center, zoom, bbox) ... -->
			<div>
				<strong>Centro:</strong><br />
				{{ centerCoords[0].toFixed(5) }}, {{ centerCoords[1].toFixed(5) }}
			</div>
			<div>
				<strong>Zoom:</strong> {{ zoomLevel.toFixed(2) }}
			</div>
			<div>
				<strong>BBOX:</strong><br />
				<span v-if="getBoundingBox()">
					{{ getBoundingBox()![0].toFixed(5) }},
					{{ getBoundingBox()![1].toFixed(5) }},
					{{ getBoundingBox()![2].toFixed(5) }},
					{{ getBoundingBox()![3].toFixed(5) }}
				</span>
				<span v-else>-</span>
			</div>

			<div class="tw:space-y-2 tw:pt-2">
				<!-- Iterazione sulla prop visuals per la lista toggle -->
				<div v-for="visual in props.visuals" :key="visual.layerName"
					class="tw:flex tw:items-center tw:justify-between">
					<label>{{ visual.layerName }}</label>
					<input type="checkbox" :checked="activeLayers[getLayerId(visual)]"
						class="toggle-switch tw:px-4 tw:py-2 tw:rounded tw:hover:bg-purple-800/80"
						@change="toggleLayer(getLayerId(visual))" />
				</div>
			</div>
			<!-- ... (Bottoni FlyTo) ... -->
			<div class="tw:flex tw:flex-col tw:pt-2 ga-4">
				<v-btn @click="flyToPosition({
					from: MarMediterraneo.center as [number, number],
					to: SOS.center as [number, number],
					fromZoom: MarMediterraneo.zoom,
					toZoom: SOS.zoom,
					speed: 0.8,
					curve: 1.5,
					delay: 1000
				})" class="">
					Area di studio SOS
				</v-btn>
				<v-btn @click="flyToPosition({
					from: SOS.center as [number, number],
					to: FasciaCostiera.center as [number, number],
					fromZoom: SOS.zoom,
					toZoom: FasciaCostiera.zoom,
					speed: 0.3,
					curve: 1.5,
					delay: 2000
				})">Dettaglo Area
				</v-btn>
			</div>

		</div>
	</div>
</template>

<style scoped lang="css">
.cmd-panel {
	position: absolute;
	top: 10px;
	right: 10px;
	background-color: rgba(255, 255, 255, 0.9);
	padding: 15px;
	border-radius: 5px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	max-height: calc(100% - 20px);
	overflow-y: auto;
	width: 250px;
}
</style>
