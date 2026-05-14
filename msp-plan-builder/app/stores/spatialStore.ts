
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Assicurati che il percorso di importazione per il tipo Layer completo sia corretto
import type { GeonodeMapListItem, Layer, LayerListItem } from '#/shared/types/geonodeTypes';




export const useSpatialResourceStore = defineStore('remote-spatial-resources', () => {
	const layers = ref<LayerListItem[]>([]);
	const maps = ref<GeonodeMapListItem[]>([]);
	const selectedLayerDetails = ref<Layer | null>(null);
	const error = ref<Error | null>(null);
	const busy = ref<boolean>(false);


	const availableLayers = computed(() => layers.value);
	const availableMaps = computed(() => maps.value);
	const currentlySelectedLayer = computed(() => selectedLayerDetails.value);

	const loadMaps = async (searchText?: string) => {
		busy.value = true;
		error.value = null;
		try {
			const query: Record<string, string> = {};
			if (typeof searchText === 'string' && searchText.trim()) {
				query.searchText = searchText.trim();
			}
			maps.value = await $fetch<Array<GeonodeMapListItem>>('/api/geonode/maps', {
				method: 'GET',
				query,
			});
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
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
		loadLayers,
		getLayer,
		selectLayer,
		availableLayers,
		availableMaps,
		currentlySelectedLayer,
		error,
		busy
	};
});
