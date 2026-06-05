
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Dataset, DatasetListItem, GeonodeMapListItem, GeonodeMapListResponse } from '#/shared/types/geonodeTypes';

export interface SpatialResourceGroup {
	group: 'base' | 'map';
	label: string;
	items: DatasetListItem[];
}

export const useSpatialResourceStore = defineStore('remote-spatial-resources', () => {
	const layers = ref<DatasetListItem[]>([]);
	const mapDatasets = ref<DatasetListItem[]>([]);
	const spatialResourceGroups = ref<SpatialResourceGroup[]>([]);
	const maps = ref<GeonodeMapListItem[]>([]);
	const selectedDatasetDetails = ref<Dataset | null>(null);
	const selectedMapId = ref<string | null>(null);
	const error = ref<Error | null>(null);
	const busy = ref<boolean>(false);
	const currentPage = ref<number>(1);
	const totalMaps = ref<number>(0);
	const pageSize = ref<number>(20);
	const currentSearchText = ref<string>('');


	const availableLayers = computed(() => layers.value);
	const availableMapDatasets = computed(() => mapDatasets.value);
	const availableSpatialResources = computed(() => spatialResourceGroups.value);
	const availableMaps = computed(() => maps.value);
	const currentlySelectedDataset = computed(() => selectedDatasetDetails.value);
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
			console.log("trying to load dataset ");
			// layers.value = await $fetch<Array<DatasetListItem>>('/api/geonode/layers', {
			// 	method: 'GET',
			// 	query: {
			// 		searchText,
			// 	},
			// });
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	const updateSpatialResourceGroups = () => {
		const layerPks = new Set(layers.value.map(layer => layer.pk));
		const uniqueMapDatasets = mapDatasets.value.filter(
			dataset => !layerPks.has(dataset.pk),
		);

		spatialResourceGroups.value = [
			{
				group: 'base',
				label: 'Layer Generali',
				items: layers.value,
			},
			{
				group: 'map',
				label: 'Dataset della Mappa',
				items: uniqueMapDatasets,
			},
		];
	};

	const loadMapDatasets = async (mapId: string) => {
		console.log('loading map datasets for mapId: ', mapId);
		selectedMapId.value = mapId;
		busy.value = true;
		error.value = null;
		mapDatasets.value = [];
		layers.value = [];
		spatialResourceGroups.value = [];

		const mapDatasetsPromise = $fetch<Array<DatasetListItem>>('/api/geonode/map-datasets', {
			method: 'GET',
			query: {
				mapId,
			},
		})
			.then((data) => {
				mapDatasets.value = data;
				updateSpatialResourceGroups();
				return data;
			});

		const layersPromise = $fetch<Array<DatasetListItem>>('/api/geonode/layers', {
			method: 'GET',
		})
			.then((data) => {
				layers.value = data;
				updateSpatialResourceGroups();
				return data;
			});

		try {
			const results = await Promise.allSettled([
				mapDatasetsPromise,
				layersPromise,
			]);

			const rejected = results.filter(
				(result): result is PromiseRejectedResult => result.status === 'rejected',
			);

			if (rejected.length === 2) {
				throw rejected[0].reason;
			}

			if (rejected.length === 1) {
				error.value = rejected[0].reason instanceof Error ? rejected[0].reason : new Error(String(rejected[0].reason));
			}
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

	const resetMapDatasets = () => {
		mapDatasets.value = [];
	};

	const getDataset = async (pk: string): Promise<Dataset> => {
		return await $fetch<Dataset>('/api/geonode/dataset', {
			method: 'GET',
			query: {
				mapId: selectedMapId.value,
				pk: pk
			},

		})
	}

	/**
	 * Carica i dettagli completi per un layer specifico e lo imposta come selezionato.
	 * @param pk La PK del layer da caricare
	 */
	const selectDataset = async (pk: string) => {
		busy.value = true;
		error.value = null;
		selectedDatasetDetails.value = null; // Resetta il dettaglio precedente
		try {
					selectedDatasetDetails.value = await getDataset(pk);
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
		getDataset,
		selectDataset,
		availableLayers,
		availableMapDatasets,
		availableSpatialResources,
		availableMaps,
		hasMoreMaps,
		currentPage,
		totalMaps,
		pageSize,
		currentlySelectedDataset: currentlySelectedDataset,
		error,
		busy
	};
});
