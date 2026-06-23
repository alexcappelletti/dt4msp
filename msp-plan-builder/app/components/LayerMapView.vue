<!-- components/geospatial/MapViewer.vue (modificato) -->
<script setup lang="ts">
import { useOgcHelper } from "@/composables/useOgcHelper";
import maplibregl, {
	Map as MaplibreMap,
	type LayerSpecification,
	type GeoJSONSource,
} from "maplibre-gl";
import { onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { useLayeredMapStore } from "~/stores/layeredMapStore";
//@ts-ignore
maplibregl.config.FILL_LARGE_MESH_ARRAYS = true;
const config = useRuntimeConfig();
const ESRI_APIKEY = config.public.esriApiKey;
const basemapURL =
	"https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const basemapEnum = "arcgis/topographic";
const MarMediterraneo = {
	center: [8.01419, 37.89222] as maplibregl.LngLatLike,
	zoom: 5.0,
};

console.log("Using ESRI API Key: ", ESRI_APIKEY ? "[REDACTED]" : "MISSING");
console.log("Basemap URL: ", ESRI_APIKEY);

const MAP_STYLE = {
	version: 8,
	sources: {
		// Un layer base di sfondo, qui OpenStreetMap
		"osm-base": {
			type: "raster",
			tiles: ["a.tile.openstreetmap.org{z}/{x}/{y}.png"],
			tileSize: 256,
			maxzoom: 19,
		},
	},
	layers: [
		{
			id: "osm-base-layer",
			type: "raster",
			source: "osm-base",
		},
	],
};
const mapStore = useLayeredMapStore();
const { convertLLBoxToMapLibreBbox } = useOgcHelper();

const mapContainer = shallowRef(null);
const map = shallowRef<MaplibreMap | null>(null);
const centerCoords = ref<[number, number]>([0, 0]);
const zoomLevel = ref<number>(0);

const dynamicLayerIds = shallowRef<string[]>([]);
const dynamicSourceIds = shallowRef<string[]>([]);
const isLoadingLayers = ref(false);
let requestedRenderId = 0;
let processedRenderId = 0;
let isRenderingMap = false;

const waitForMapIdle = async () => {
	if (!map.value) return;
	if (map.value.loaded() && !mapStore.isAnyLayerLoading && !isLoadingLayers.value) {
		return;
	}

	await new Promise<void>((resolve) => {
		const mapInstance = map.value;
		if (!mapInstance) {
			resolve();
			return;
		}

		const handleIdle = () => {
			mapInstance.off("idle", handleIdle);
			resolve();
		};

		mapInstance.on("idle", handleIdle);
	});
};

const initializeMap = () => {
	// ... (logica inizializzazione mappa) ...
	map.value = new maplibregl.Map({
		container: mapContainer.value!,
		style: `${basemapURL}/${basemapEnum}?token=${ESRI_APIKEY}`,
		center: MarMediterraneo.center,
		zoom: MarMediterraneo.zoom,
		preserveDrawingBuffer: true,
	});
	map.value.on("load", async () => {
		console.log("loaded map ");
		await updateMap();
	});
	map.value.on("error", (e) => {
		console.error("Errore mappa:", e);
	});
	map.value.on("move", () => {
		updateMapInfo();
	});
};

const requestMapUpdate = async () => {
	requestedRenderId += 1;
	if (isRenderingMap) {
		return;
	}

	isRenderingMap = true;
	try {
		while (processedRenderId !== requestedRenderId) {
			processedRenderId = requestedRenderId;
			await updateMap();
		}
	} finally {
		isRenderingMap = false;
	}
};

watch(
	[
		() => mapStore.getFeaturedLayersState,
		() => mapStore.getRasterLayersState,
		() => mapStore.getRenderOrder,
	],
	async () => {
		try {
			await requestMapUpdate();
		} catch (err) {
			console.error(
				"Errore durante l'aggiornamento della mappa: ",
				err,
			);
		}
	},
	{ immediate: true, deep: true },
);

function clearMap() {
	if (!map.value) return;
	const mapInstance = map.value;

	console.log("[LayerMapView] Clearing all dynamic layers and sources...");

	const removeLayer = (layerId: string) => {
		try {
			if (mapInstance.getLayer(layerId)) {
				mapInstance.removeLayer(layerId);
				console.log("[LayerMapView] Removed layer:", layerId);
			}
		} catch (e) {
			console.warn("[LayerMapView] Could not remove layer:", layerId, e);
		}
	};

	const removeSource = (sourceId: string) => {
		try {
			if (mapInstance.getSource(sourceId)) {
				mapInstance.removeSource(sourceId);
				console.log("[LayerMapView] Removed source:", sourceId);
			}
		} catch (e) {
			console.warn("[LayerMapView] Could not remove source:", sourceId, e);
		}
	};

	// Rimuovi tutti i layer tracciati
	dynamicLayerIds.value.forEach(removeLayer);
	dynamicLayerIds.value = [];

	// Rimuovi tutti i source tracciati
	dynamicSourceIds.value.forEach(removeSource);
	dynamicSourceIds.value = [];

	// Scansiona lo stile e rimuovi tutti i layer/source rimanenti con il prefisso
	const style = mapInstance.getStyle();
	if (style) {
		// Rimuovi tutti i layer che iniziano con "layer-"
		if (Array.isArray(style.layers)) {
			style.layers.forEach((layer) => {
				if (layer.id?.startsWith("layer-")) {
					removeLayer(layer.id);
				}
			});
		}

		// Rimuovi tutti i source che iniziano con "source-"
		if (style.sources) {
			const sourceIds = Object.keys(style.sources).filter((sourceId) =>
				sourceId.startsWith("source-"),
			);
			sourceIds.forEach(removeSource);
		}
	}

	console.log("[LayerMapView] Map cleared");
}

function buildDefaultLayerConfig(
	sourceId: string,
	geonodeLayerPk: string,
	geometryType?: string,
): LayerSpecification {
	if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
		return {
			id: `layer-${geonodeLayerPk}`,
			source: sourceId,
			type: "fill",
			paint: {
				"fill-color": "#088",
				"fill-opacity": 0.5,
			},
		};
	}

	if (geometryType === "LineString" || geometryType === "MultiLineString") {
		return {
			id: `layer-${geonodeLayerPk}`,
			source: sourceId,
			type: "line",
			paint: { "line-color": "#000000", "line-width": 2 },
		};
	}

	if (geometryType === "Point" || geometryType === "MultiPoint") {
		return {
			id: `layer-${geonodeLayerPk}`,
			source: sourceId,
			type: "circle",
			paint: {
				"circle-color": "#FF0000",
				"circle-radius": 6,
			},
		};
	}

	return {
		id: `layer-${geonodeLayerPk}`,
		source: sourceId,
		type: "fill",
		paint: {
			"fill-color": "#02Ae23",
			"fill-opacity": 0.3,
		},
	};
}

function syncTrackedIds(mapInstance: MaplibreMap) {
	const style = mapInstance.getStyle();
	if (!style) return;

	dynamicLayerIds.value = dynamicLayerIds.value.filter((id) =>
		Boolean(mapInstance.getLayer(id)),
	);
	dynamicSourceIds.value = dynamicSourceIds.value.filter((id) =>
		Boolean(mapInstance.getSource(id)),
	);

	const knownLayerIds = new Set(dynamicLayerIds.value);
	const knownSourceIds = new Set(dynamicSourceIds.value);

	for (const layer of style.layers ?? []) {
		if (layer.id?.startsWith("layer-") && !knownLayerIds.has(layer.id)) {
			dynamicLayerIds.value.push(layer.id);
		}
	}

	for (const sourceId of Object.keys(style.sources ?? {})) {
		if (sourceId.startsWith("source-") && !knownSourceIds.has(sourceId)) {
			dynamicSourceIds.value.push(sourceId);
		}
	}
}

function removeObsoleteMapItems(
	mapInstance: MaplibreMap,
	desiredLayerIds: Set<string>,
	desiredSourceIds: Set<string>,
) {
	for (const layerId of [...dynamicLayerIds.value]) {
		if (!desiredLayerIds.has(layerId) && mapInstance.getLayer(layerId)) {
			mapInstance.removeLayer(layerId);
		}
	}

	dynamicLayerIds.value = dynamicLayerIds.value.filter((id) =>
		desiredLayerIds.has(id) && Boolean(mapInstance.getLayer(id)),
	);

	for (const sourceId of [...dynamicSourceIds.value]) {
		if (!desiredSourceIds.has(sourceId) && mapInstance.getSource(sourceId)) {
			mapInstance.removeSource(sourceId);
		}
	}

	dynamicSourceIds.value = dynamicSourceIds.value.filter((id) =>
		desiredSourceIds.has(id) && Boolean(mapInstance.getSource(id)),
	);
}

function applyLayerOrder(mapInstance: MaplibreMap) {
	const renderOrder = mapStore.getRenderOrder;
	if (!renderOrder.length) return;

	for (const layerPk of renderOrder) {
		const exactLayerId = `layer-${layerPk}`;
		if (mapInstance.getLayer(exactLayerId)) {
			mapInstance.moveLayer(exactLayerId);
		}

		dynamicLayerIds.value
			.filter((layerId) =>
				layerId.startsWith(`layer-${layerPk}`) && layerId !== exactLayerId,
			)
			.forEach((layerId) => {
				if (mapInstance.getLayer(layerId)) {
					mapInstance.moveLayer(layerId);
				}
			});
	}
}

async function updateMap() {
	if (!map.value || !map.value.isStyleLoaded()) {
		return;
	}

	isLoadingLayers.value = true;

	// Delay per garantire che il rendering dello spinner avvenga
	await new Promise((resolve) => setTimeout(resolve, 100));

	const mapInstance = map.value;
	syncTrackedIds(mapInstance);

	const results = mapStore.getFeaturedLayersState;
	const desiredLayerIds = new Set<string>();
	const desiredSourceIds = new Set<string>();

	results.forEach((fState) => {
		if (fState.fetchStatus !== "idle" || !fState.geojsonData) {
			return;
		}
		const { geonodeLayer, geojsonData, styles } = fState;
		const sourceId = `source-${geonodeLayer.pk}`;
		desiredSourceIds.add(sourceId);

		const existingSource = mapInstance.getSource(sourceId) as
			| GeoJSONSource
			| undefined;
		if (existingSource) {
			existingSource.setData(geojsonData);
		} else {
			mapInstance.addSource(sourceId, {
				type: "geojson",
				data: geojsonData,
			});
			dynamicSourceIds.value.push(sourceId);
		}

		if (styles.length === 0) {
			const geometryType = geojsonData.features?.[0]?.geometry?.type;
			const layerConfig = buildDefaultLayerConfig(
				sourceId,
				geonodeLayer.pk,
				geometryType,
			);
			desiredLayerIds.add(layerConfig.id);
			if (!mapInstance.getLayer(layerConfig.id)) {
				mapInstance.addLayer(layerConfig);
				dynamicLayerIds.value.push(layerConfig.id);
			}
		} else {
			styles.forEach((s) => {
				const styledLayer = {
					...s,
					source: sourceId,
				} as LayerSpecification;
				desiredLayerIds.add(styledLayer.id);
				if (!mapInstance.getLayer(styledLayer.id)) {
					mapInstance.addLayer(styledLayer);
					dynamicLayerIds.value.push(styledLayer.id);
				}
			});
		}
	});

	const rasterLayers = mapStore.getRasterLayersState;

	rasterLayers.forEach((lState) => {
		const sourceId = `source-${lState.geonodeLayer.pk}`;
		const layerId = `layer-${lState.geonodeLayer.pk}`;
		desiredSourceIds.add(sourceId);
		desiredLayerIds.add(layerId);

		if (!mapInstance.getSource(sourceId)) {
			mapInstance.addSource(sourceId, {
				type: "raster",
				tiles: lState.rasterTiles,
				tileSize: 256,
			});
			dynamicSourceIds.value.push(sourceId);
		}

		if (!mapInstance.getLayer(layerId)) {
			mapInstance.addLayer({
				id: layerId,
				type: "raster",
				source: sourceId,
				paint: {
					"raster-opacity": 1,
				},
			});
			dynamicLayerIds.value.push(layerId);
		}
	});

	applyLayerOrder(mapInstance);
	removeObsoleteMapItems(mapInstance, desiredLayerIds, desiredSourceIds);
	isLoadingLayers.value = false;
}

onMounted(initializeMap);
onUnmounted(() => {
	if (map.value) map.value.remove();
});

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
		bounds.getWest(), // minX
		bounds.getSouth(), // minY
		bounds.getEast(), // maxX
		bounds.getNorth(), // maxY
	];
}

const captureThumbnail = async (): Promise<string | null> => {
	if (!map.value || !map.value.isStyleLoaded()) return null;

	await waitForMapIdle();
	map.value.resize();
	map.value.triggerRepaint();
	await new Promise((resolve) => requestAnimationFrame(resolve));
	await new Promise((resolve) => requestAnimationFrame(resolve));
	const canvas = map.value.getCanvas();
	if (!canvas.width || !canvas.height) return null;
	try {
		return canvas.toDataURL("image/png");
	} catch (error) {
		console.error("Errore durante la cattura thumbnail della mappa:", error);
		return null;
	}
};

defineExpose({
	captureThumbnail,
});
</script>

<template>
	<div class="map-container-wrapper">
		<!-- Il contenitore della mappa deve essere relativo per il posizionamento assoluto dello spinner -->
		<div ref="mapContainer" class="map-container"></div>

		<!-- Overlay di caricamento Vuetify -->
		<v-overlay :model-value="mapStore.isAnyLayerLoading || isLoadingLayers"
			class="align-center justify-center loading-overlay" persistent contained>
			<div class="tw:flex tw:flex-col tw:items-center">
				<v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
				<span class="tw:mt-4 tw:text-white tw:font-bold tw:text-sm">
					loading geographic data...</span>
			</div>
		</v-overlay>

		<!-- Informazioni sulla mappa (opzionale) -->
		<div class="map-info">
			Center: {{ centerCoords[0].toFixed(4) }},
			{{ centerCoords[1].toFixed(4) }} | Zoom: {{ zoomLevel.toFixed(2) }}
		</div>
	</div>
</template>

<style scoped>
.map-container-wrapper {
	position: relative;
	height: 100%;
	min-height: 100%;
	width: 100%;
	overflow: hidden;
}

:deep(.loading-overlay) {
	z-index: 9999 !important;
}

:deep(.v-overlay__scrim) {
	background: rgba(0, 0, 0, 0.4) !important;
	/* Nero semitrasparente */
	opacity: 1 !important;
}

.map-container {
	width: 100%;
	height: 100%;
}

:deep(.maplibregl-map),
:deep(.maplibregl-canvas-container),
:deep(.maplibregl-canvas) {
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
