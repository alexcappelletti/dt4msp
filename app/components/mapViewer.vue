<script setup lang="ts">
import { onMounted, ref } from 'vue'
import maplibregl, { type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapVisual } from '~/models/visual';


const props = defineProps<{
	visuals: Array<MapVisual>
}>()
//scade il 15-11-2025
const ESRI_APIKEY = "AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTNIlRYVvxbQjLzaP8nBzH_b9mqspYcaz4ndzHeyjVzD3ZEbNgRdTUwCPlZDm5A2xuAFgzeES7XcWB0s81eXFW7FIr0z0OTu27HBXm2W81y4Sca7zEGL9BQg-bq8vMU28suXRlP-AyOWLXBNadCQrNZl53Yo3tO2BWKB_qjyUXVOeuDLMMOeI0oMgyGKV95U8Gk.AT1_UFi7OU63"
//secret client: 07d01b791f7144f692e6b8f2fcd3a60a
const basemapURL = "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";

//const basemapEnum = "arcgis/streets";
//const basemapEnum = "arcgis/navigation";
const basemapEnum = "arcgis/topographic";
//const basemapEnum = "arcgis/outdoor";
// const basemapEnum = "arcgis/light-gray";
// const basemapEnum = "arcgis/imagery";


const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<maplibregl.Map | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(0);
const activeLayers = ref<Record<string, boolean>>({});

const SaintLucia = {
	center: [-62.7250, 14.72225] as LngLatLike, // Caraibi
  	zoom: 7.76
}
const Messina = {
	center: [15.61502, 38.23433] as LngLatLike, // Stretto di Messina
  	zoom: 12.70
}
const StraitOfSicily = {
	center: [13.14948, 36.67817] as LngLatLike, // Stretto di Sicilia
  	zoom: 7.2
}


onMounted(() => {
	//initializeMap()
	if (!mapContainer.value) return
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style: `${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		center: SaintLucia.center, // [lng, lat]
		zoom: SaintLucia.zoom,
		//oom: props.visual.zoomLevel ?? 2
	})
	map.value.on('load', () => {
		console.log('Map loaded')
		// Aggiungi il layer WMS
		props.visuals.forEach((visual, index) => {
			try {
				if (map.value && visual.serviceUrl && visual.layerName) {
					setSource(visual, map.value);
					activeLayers.value[getLayerId(visual)] = true;
				}
			}
			catch (error) {
				console.error(`Errore nell'aggiunta della sorgente/layer per visual ${index}:`, error)
			}
		});
		updateMapInfo();
	});
	map.value.on('error', (e) => {
		console.error('Errore mappa:', e)
	})
	map.value.on('move', () => {
		updateMapInfo()
	});




	// // Marker opzionale con popup
	// if (props.visual.layerName) {
	// 	new maplibregl.Marker()
	// 		.setLngLat([11.119, 46.0705]) // puoi sostituire con coordinate reali se disponibili
	// 		.setPopup(new maplibregl.Popup().setText(props.visual.layerName))
	// 		.addTo(map)
	// }

	// Se vuoi caricare dati WFS o GeoJSON, puoi farlo qui
	// Esempio: fetch(props.visual.getUrl()).then(...)
})
function getLayerId(visual: MapVisual): string {
	return `layer-source-${visual.layerName?.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

function setSource(visual: MapVisual, map: maplibregl.Map) {
	const sourceId = `source-${visual.layerName?.replace(/[^a-zA-Z0-9]/g, '-')}`;
	const proxyUrl = `/api/geoserver-proxy?wfs=${visual.getUrl()}`;
	if (visual.layerType && visual.layerType.toLowerCase() === 'vector') {
		map.addSource(sourceId, {
			type: 'vector',
			tiles: [proxyUrl],
			minzoom: visual.zoomLevel || 0,
		});
		map.addLayer({
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
	} else if (visual.layerType && visual.layerType.toLowerCase() === 'raster') {
		map.addSource(sourceId, {
			type: 'raster',
			tiles: [visual.serviceUrl],
			tileSize: 256
		});
		map.addLayer({
			id: `layer-${sourceId}`,
			type: 'raster',
			source: sourceId,
			paint: {}
		});
	} else if (visual.layerType && visual.layerType.toLowerCase() === 'geojson') {
		map.addSource(sourceId, {
			type: 'geojson',
			data: visual.serviceUrl
		});
		map.addLayer({
			id: `layer-${sourceId}`,
			type: 'fill',
			source: sourceId,
			paint: {
				'fill-color': '#e2acf4',
				'fill-opacity': 0.8,
				'fill-outline-color': '#000000'
			}
		});
	}
	else { throw new Error(`Unsupported layer type: ${visual.layerType ?? 'undefined'}`) }
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
	<div class="relative h-full w-full bg-green-500">
		<div ref="mapContainer" class="h-full w-full" />

		<!-- Pannello laterale -->
		<div class="absolute top-4 left-4 bg-white bg-opacity-90 rounded shadow-md p-3 w-82 text-sm space-y-3 z-10">
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
				<span v-else>–</span>
			</div>

			<div class="space-y-2 pt-2">
				<div v-for="visual in props.visuals" :key="visual.layerName" class="flex items-center justify-between">
					<label>{{ visual.layerName }}</label>
					<input type="checkbox" :checked="activeLayers[getLayerId(visual)]"
						@change="toggleLayer(getLayerId(visual))" class="toggle-switch px-4 py-2 rounded hover:bg-purple-800/80" />
				</div>
			</div>

			<div class="flex flex-col pt-2">
				<button @click="flyToPosition({
					from: SaintLucia.center as [number, number],
					to: Messina.center as [number, number],
					fromZoom: SaintLucia.zoom,
					toZoom: Messina.zoom,
					speed: 0.8,
					curve: 1.5,
					delay: 1000
				})" class="w-full px-2 py-1 bg-sky-700 text-white rounded hover:bg-purple-800/80">
					Stretto di Messina
				</button>
				<button @click="flyToPosition({
					from: Messina.center as [number, number],
					to: StraitOfSicily.center as [number, number],
					fromZoom: Messina.zoom,
					toZoom: StraitOfSicily.zoom,
					speed: 0.3,
					curve: 1.5,
					delay: 2000
				})" class="w-full mt-2 px-2 py-1 bg-sky-700 text-white rounded hover:bg-purple-800">
					Canale di Sicilia
				</button>


			</div>

		</div>
	</div>
</template>



<style scoped lang="scss">
$p : var(--color-primary); // Tailwind gray-200
$bg: var(--color-secondary); // Tailwind gray-200
$gray-800: #1f2937; // Tailwind gray-800
.toggle-switch {
  appearance: none;
  width: 3rem; // w-12
  height: 1.5rem; // h-6
  background-color: #eeecf6;
  border-radius: 9999px; // rounded-full
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0.125rem; // top-0.5
    left: 0.125rem;
    width: 1.25rem; // w-5
    height: 1.25rem;
    background-color: white;
    border-radius: 9999px;
    transition: transform 0.3s ease;
  }

  &:checked {
    background-color: $p;//(Tailwind: purple-600)

    &::before {
      transform: translateX(1.5rem); // sposta il pallino a destra
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #c4b5fd; // ring-purple-300
  }
}


</style>
