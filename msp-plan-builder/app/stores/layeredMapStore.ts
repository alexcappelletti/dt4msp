import type { Dataset } from '#/shared/types/geonodeTypes';
import { getLayerFromSLDResponse, type SourcedLayer } from '#/shared/utils/sld';
import { useOgcHelper, type OGCType } from '@/composables/useOgcHelper';
import WFS from 'ol/format/WFS';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { XMLSerializer } from 'xmldom';


interface LayerState {
	geonodeLayer: Dataset;
	geojsonData: GeoJSON.FeatureCollection | null;
	rasterTiles: string[];
	styles: SourcedLayer[];
	loading: boolean;
	error: string | null;
	fetchStatus: 'idle' | 'fetching' | 'error';
}


export const useLayeredMapStore = defineStore('layeredMap', () => {
	const { ogcTypes, buildWmsUrlForMapLibre } = useOgcHelper();

	let currentAbortController: AbortController | null = null;

	const ogcType = ref<OGCType | null>(null);
	const selectedGnLayer = ref<string | null>(null);
	const layersData = reactive<Record<string, LayerState>>({});

	// Getter per il tipo selezionato (ritorna il ref o un default)
	const selectedOGCType = computed(() => ogcType.value);

	async function setSelectedOGCType(type: OGCType) {
		ogcType.value = type;
		const currentLayerPk = selectedGnLayer.value;
		if (currentLayerPk && layersData[currentLayerPk]) {
			const layer = layersData[currentLayerPk].geonodeLayer;
			await fetchOGCLayerData([layer], type);
		}
	}
	/**
	 * Seleziona il layer e decide quale tipo OGC attivare
	 */
	async function selectGnLayer(gnLayer: Dataset) {
		selectedGnLayer.value = gnLayer.pk;
		const availableTypes = ogcTypes(gnLayer).map(t => t.toLowerCase()) as OGCType[];
		let targetType: OGCType;
		// 1. Se l'utente ha già una selezione attiva ed è supportata dal nuovo layer, la teniamo
		if (ogcType.value && availableTypes.includes(ogcType.value.toLowerCase() as OGCType)) { targetType = ogcType.value; }
		// 2. PRIORITÀ WFS: Se non c'è selezione precedente, ma il layer supporta WFS, scegliamo WFS
		else if (availableTypes.includes('wms')) { targetType = 'wms'; }
		else if (availableTypes.includes('wfs')) { targetType = 'wfs'; }
		else { targetType = availableTypes[0] || 'wms'; }
		console.log("targetType", targetType)
		await setSelectedOGCType(targetType);
		await fetchOGCLayerData([gnLayer], targetType);
	}

	async function fetchOGCLayerData(gnLayers: Dataset[], typeFilter?: OGCType): Promise<void> {
		console.log("[layeredMapStore] fetchOGCLayerData called with", gnLayers.length, "layers:", gnLayers.map(l => ({ pk: l.pk, name: l.name })));

		if (currentAbortController) {
			currentAbortController.abort();
		}
		currentAbortController = new AbortController();
		const signal = currentAbortController.signal;

		resetStore();
		console.log("[layeredMapStore] Store reset");

		const tasks: Promise<void>[] = [];
		gnLayers.forEach(layer => {
			const types = ogcTypes(layer) as OGCType[];
			console.log("[layeredMapStore] Layer", layer.pk, "available types:", types);

			const targetType = typeFilter
				|| (types.includes('wms')
					? 'wms'
					: ((types.includes('wfs') || types.includes('geojson')) ? 'wfs' : 'wms'));

			console.log("[layeredMapStore] Layer", layer.pk, "target type:", targetType);

			if (targetType === 'wfs' && (types.includes('wfs') || types.includes('geojson'))) {
				console.log("[layeredMapStore] Fetching WFS for", layer.pk);
				tasks.push(fetchWFSLayerData(layer, signal));
			}
			else if (targetType === 'wms' && types.includes('wms')) {
				console.log("[layeredMapStore] Fetching WMS for", layer.pk);
				fetchWMSLayerData(layer);
			}
		});

		try {
			await Promise.all(tasks);
		} catch (error: any) {
			if (error.name !== 'AbortError') throw error;
		}

		console.log("[layeredMapStore] fetchOGCLayerData complete. Store state:");
		console.log("  - Featured layers:", getFeaturedLayersState.value.length, getFeaturedLayersState.value.map(l => l.geonodeLayer.pk));
		console.log("  - Raster layers:", getRasterLayersState.value.length, getRasterLayersState.value.map(l => l.geonodeLayer.pk));
	}
	async function fetchWFSLayerData(layer: Dataset, signal: AbortSignal): Promise<void> {
		layersData[layer.pk] = {
			geonodeLayer: layer,
			rasterTiles: [],
			geojsonData: null,
			styles: [],
			loading: true,
			error: null,
			fetchStatus: 'fetching'
		} as LayerState;
		try {
			const featureRequest = new WFS().writeGetFeature({
				featureNS: "",
				featurePrefix: layer.workspace,
				featureTypes: [`${layer.name}`],
				outputFormat: 'application/json',
				srsName: 'EPSG:4326',
			});

			const xmlPayload = new XMLSerializer().serializeToString(featureRequest);
			const [geojsonData, sldText] = await Promise.all([
				$fetch<GeoJSON.FeatureCollection>('/api/map-proxy/fetch-wfs', {
					method: 'POST', signal,
					body: { lyPayload: xmlPayload, owl_url: layer.ows_url }
				}),
				layer.default_style ? $fetch<string>('/api/map-proxy/fetch-sld-style', {
					method: 'POST', signal,
					body: { sldStyle: layer.default_style }
				}) : Promise.resolve(null)
			]);

			let styles: SourcedLayer[] = [];
			if (sldText) styles = await getLayerFromSLDResponse(sldText) as SourcedLayer[];
			layersData[layer.pk] = {
				...layersData[layer.pk]!,
				geojsonData,
				styles,
				fetchStatus: 'idle',
				loading: false // Spegne lo spinner
			};
			console.log("[layeredMapStore] WFS data stored for", layer.pk, "features:", geojsonData.features.length);

		} catch (error: any) {
			if (error.name === 'AbortError') return;
			console.error("[layeredMapStore] Error fetching WFS for", layer.pk, error);
			layersData[layer.pk] = {
				...layersData[layer.pk]!,
				loading: false,
				error: error.message,
				fetchStatus: 'error'
			};
		}
	}

	function fetchWMSLayerData(layer: Dataset) {
		layersData[layer.pk] = {
			geonodeLayer: layer,
			rasterTiles: [buildWmsUrlForMapLibre(layer)],
			geojsonData: null,
			styles: [],
			loading: false,
			error: null,
			fetchStatus: 'idle'
		};
		console.log("[layeredMapStore] WMS data stored for", layer.pk);
	}

	function resetStore() {
		for (const key in layersData) delete layersData[key];
	}

	// --- GETTERS ---
	const getRasterLayersState = computed(() => Object.values(layersData).filter(s => s.rasterTiles.length > 0));
	const getFeaturedLayersState = computed(() => Object.values(layersData).filter(s => s.geojsonData !== null));
	const getGnLayers = computed(() => Object.values(layersData).map(state => state.geonodeLayer));
	const isAnyLayerLoading = computed(() => Object.values(layersData).some(l => l?.loading === true));

	return {
		selectedOGCType,
		setSelectedOGCType,
		selectGnLayer,
		fetchOGCLayerData,
		getRasterLayersState,
		getFeaturedLayersState,
		getGnLayers,
		isAnyLayerLoading,
		resetStore
	}
})
