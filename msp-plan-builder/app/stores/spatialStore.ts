
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
// Assicurati che il percorso di importazione per il tipo Layer completo sia corretto
import type { DatasetListItem, GeonodeMapListItem, GeonodeMapListResponse, Layer, LayerListItem } from '#/shared/types/geonodeTypes';




export const useSpatialResourceStore = defineStore('remote-spatial-resources', () => {
	const layers = ref<LayerListItem[]>([]);
	const mapDatasets = ref<DatasetListItem[]>([]);
	const maps = ref<GeonodeMapListItem[]>([]);
	const selectedLayerDetails = ref<Layer | null>(null);
	const error = ref<Error | null>(null);
	const busy = ref<boolean>(false);
	const currentPage = ref<number>(1);
	const totalMaps = ref<number>(0);
	const pageSize = ref<number>(20);
	const currentSearchText = ref<string>('');


	const availableLayers = computed(() => layers.value);
	const availableMapDatasets = computed(() => mapDatasets.value);
	const availableMaps = computed(() => maps.value);
	const currentlySelectedLayer = computed(() => selectedLayerDetails.value);
	const hasMoreMaps = computed(() => currentPage.value * pageSize.value < totalMaps.value);

	const loadMaps = async (page = 1, searchText?: string) => {
		busy.value = true;
		error.value = null;
		try {
			const query: Record<string, string> = {
				page: String(page),
				page_size: String(pageSize.value),
			};
			if (typeof searchText === 'string' && searchText.trim()) {
				query.searchText = searchText.trim();
				currentSearchText.value = searchText.trim();
			} else if (page === 1) {
				currentSearchText.value = '';
			}

			const response = await $fetch<GeonodeMapListResponse>('/api/geonode/maps', {
				method: 'GET',
				query,
			});

			if (page === 1) {
				maps.value = response.maps;
			} else {
				maps.value = [...maps.value, ...response.maps];
			}

			currentPage.value = response.page;
			totalMaps.value = response.total;
			pageSize.value = response.page_size;
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	const loadMoreMaps = async () => {
		if (!hasMoreMaps.value) return;
		await loadMaps(currentPage.value + 1, currentSearchText.value);
	};

	const loadLayers = async (searchText?: string) => {
		busy.value = true;
		error.value = null;
		try {
			layers.value = await $fetch<Array<LayerListItem>>('/api/geonode/layers', {
				method: 'GET',
				query: {
					searchText,
				},
			});
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	const loadMapDatasets = async (mapId: string) => {
		busy.value = true;
		error.value = null;
		try {
			mapDatasets.value = await $fetch<Array<DatasetListItem>>('/api/geonode/map-datasets', {
				method: 'GET',
				query: {
					mapId,
				},
			});
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	const resetMapDatasets = () => {
		mapDatasets.value = [];
	};

	const getLayer = async(pk: string): Promise<Layer> =>{
		return await $fetch<Layer>('/api/geonode/layer', {
			method: 'GET',
			query: {
				pk: pk
			},

		})
	}

	/**
	 * Carica i dettagli completi per un layer specifico e lo imposta come selezionato.
	 * @param pk La PK del layer da caricare
	 */
	const selectLayer = async (pk: string) => {
		busy.value = true;
		error.value = null;
		selectedLayerDetails.value = null; // Resetta il dettaglio precedente
		try {
			// getLayer ritorna il tipo Layer completo
			selectedLayerDetails.value = await getLayer(pk);
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	// Ritorna lo stato e le azioni
	return {
		loadMaps,
		loadMoreMaps,
		loadLayers,
		loadMapDatasets,
		resetMapDatasets,
		getLayer,
		selectLayer,
		availableLayers,
		availableMapDatasets,
		availableMaps,
		hasMoreMaps,
		currentPage,
		totalMaps,
		pageSize,
		currentlySelectedLayer,
		error,
		busy
	};
});
