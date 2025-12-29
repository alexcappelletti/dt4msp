import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LayerSpecification } from 'maplibre-gl'
import WFS from 'ol/format/WFS';
import { XMLSerializer } from 'xmldom';

import { useLayerHelper, type OGSType } from '@/composables/useLayerHelper'
import type { Layer } from '#/shared/types/gn-layer';
import { getLayerFromSLDResponse, type SourcedLayer } from '#/shared/utils/sld';


interface LayerState {
	geonodeLayer: Layer;
	geojsonData: GeoJSON.FeatureCollection | null;
	rasterTiles: string[];
	styles: SourcedLayer[];
	loading: boolean;
	error: string | null;
	fetchStatus: 'idle' | 'fetching' | 'error';
}
export const useLayeredMapStore = defineStore('layeredMap', () => {
	const { ogcTypes, buildWmsUrlForMapLibre } = useLayerHelper();
	let currentAbortController: AbortController | null = null;

	const ogsType = ref<OGSType>("wms");  //defaul: raster
	const selectedGnLayer = ref<string | null>(null);
	const layersData = reactive<Record<string, LayerState>>({});
	const getLayerState = computed(() => (layerPk: string) => layersData[layerPk]);

	const getAvailableOGCTypes = computed(() => {
		const typesSet = new Set<OGSType>();
		Object.values(layersData).forEach(state => {
			const types = ogcTypes(state.geonodeLayer);
			types.forEach(t => typesSet.add(t as OGSType));
		});
		return Array.from(typesSet);
	})

	const selectedOGCType = computed(() => ogsType.value);

	function setSelectedOGCType(type: OGSType) {
		ogsType.value = type;
	}


	const getRasterLayersState = computed(() => {
		return Object.values(layersData).filter(state => {
			// Verifichiamo se tra i tipi OGC del layer è presente 'wms'
			const types = ogcTypes(state.geonodeLayer);
			return types.includes('wms');
		});
	});


	const getFirstLayerState = computed(() => {
		const allLayers = Object.values(layersData);
		return allLayers.length > 0 ? allLayers[0] : null;
	});
	const getGnLayers = computed(() => Object.values(layersData).map(state => state.geonodeLayer));

	const getFeaturedLayersState = computed(() => {
		return Object.values(layersData).filter(state => {
			const types = ogcTypes(state.geonodeLayer);
			return types.includes('wfs') || types.includes('geojson');
		});
	});


	const isAnyLayerLoading = computed(() => {
		return Object.values(layersData).some(l => l.loading);
	});

	function resetStore() {
		Object.keys(layersData).forEach(key => delete layersData[Number(key)]);
	}
	function clearLayer(pk: number) {
		delete layersData[pk];
	}

	async function selectGnLayer(gnLayer: Layer) {
		selectedGnLayer.value = gnLayer.pk;
		await fetchOGCLayerData([gnLayer]);
	}

	async function fetchOGCLayerData(gnLayers: Layer[], typeFilter?: OGSType): Promise<void> {
		if (currentAbortController) {
			currentAbortController.abort();
			console.log("Precedente fetch interrotto (Abort)");
		}
		currentAbortController = new AbortController();
		const signal = currentAbortController.signal;
		resetStore();
		const validTasks = gnLayers.reduce<Promise<void>[]>((acc, layer) => {
			console.log("fetchOGCLayerData for layer:", layer.name);
			const types = ogcTypes(layer);
			const isVector = types.some(t => t === "wfs" || t === "geojson");
			const isRaster = types.some(t => t === "wms");
			
			if (isVector) {
				console.log(`Layer ${layer.name} supports WMS.`);
				fetchWMSLayerData(layer);
			}



			if (typeFilter) {
				if (typeFilter === "wfs" && isVector) {
					acc.push(fetchWFSLayerData(layer, signal));
				} else if (typeFilter === "wms" && isRaster) {
					fetchWMSLayerData(layer);
				}
			} else {
				if (isVector) {
					acc.push(fetchWFSLayerData(layer, signal));
				}
				if (isRaster) {
					fetchWMSLayerData(layer);
				}
			}
			return acc;
		}, []);
		try {
			const results = await Promise.all(validTasks);
		}
		catch (error: any) {
			if (error.name === 'AbortError') {
				console.log("Fetch annullato correttamente.");
			} else {
				throw error;
			}
		}
	}

	async function fetchWFSLayerData(layer: Layer, signal: AbortSignal): Promise<void> {
		if (layersData[layer.pk]?.loading || layersData[layer.pk]?.geojsonData) {
			return;
		}
		layersData[layer.pk] = {
			rasterTiles: [],
			geojsonData: null,
			styles: [],
			loading: true,
			error: null,
			geonodeLayer: layer,
			fetchStatus: 'idle'
		};
		try {
			// 1. Fetch WFS Features tramite il tuo proxy
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
					method: 'POST',
					signal: signal,
					body: { lyPayload: xmlPayload, owl_url: layer.ows_url }
				}),
				layer.default_style
					? $fetch<string>('/api/map-proxy/fetch-sld-style', {
						method: 'POST',
						signal,
						body: { sldStyle: layer.default_style }
					})
					: Promise.resolve(null)
			]);

			let styles: SourcedLayer[] = [];
			if (sldText) {
				styles = await getLayerFromSLDResponse(sldText) as SourcedLayer[];
			}

			// 3. Aggiornamento atomico dello stato
			layersData[layer.pk] = {
				rasterTiles: [],
				geonodeLayer: layer,
				geojsonData,
				styles,
				loading: false,
				error: null,
				fetchStatus: 'idle'
			};
		}
		catch (error: any) {
			console.error("Error fetching WFS layer data:", error);
			if (error.name === 'AbortError') return; // Non facciamo nulla se è un annullamento volontario

			layersData[layer.pk] = {
				rasterTiles: [],
				geonodeLayer: layer,
				geojsonData: null,
				styles: [],
				loading: false,
				error: (error as Error).message,
				fetchStatus: 'error'
			};
		}
		console.log("Loaded WFS layer data for:", layer.name);
	}
	function fetchWMSLayerData(layer: Layer) {
		if (layersData[layer.pk]?.loading) {
			return;
		}
		layersData[layer.pk] = {
			geonodeLayer: layer,
			rasterTiles: [buildWmsUrlForMapLibre(layer)],
			geojsonData: null, // I WMS non hanno GeoJSON
			styles: [],
			loading: false, // I WMS sono pronti subito per la mappa
			error: null,
			fetchStatus: 'idle'
		};
	}


	return {
		getAvailableOGCTypes,
		setSelectedOGCType,
		selectedOGCType,
		selectGnLayer,
		fetchOGCLayerData,
		getRasterLayersState,
		getFeaturedLayersState,
		getFirstLayerState,
		getGnLayers,
		isAnyLayerLoading,
		resetStore,
	}
})