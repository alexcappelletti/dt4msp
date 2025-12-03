// store/spatialResource.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Assicurati che il percorso di importazione per il tipo Layer completo sia corretto
import type { Layer } from '#/shared/types/gn-layer';
import { useGeonodeApi } from '@/composables/useGeonodeApi';



export const useSpatialResourceStore = defineStore('remote-spatial-resources', () => {
	const { getAllAvailableLayers, getLayer } = useGeonodeApi();
	const layers = ref<Layer[]>([]);
	const selectedLayerDetails = ref<Layer | null>(null);
	const error = ref<Error | null>(null);
	const busy = ref<boolean>(false);


	const availableLayers = computed(() => layers.value);
	const currentlySelectedLayer = computed(() => selectedLayerDetails.value);


	const loadLayers = async (searchText?: string) => {
		busy.value = true;
		error.value = null;
		try {
			// getAllAvailableLayers ritorna LayerSummary[]
			layers.value = await getAllAvailableLayers(searchText);
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
		} finally {
			busy.value = false;
		}
	};

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
		loadLayers,
		availableLayers,
		currentlySelectedLayer,
		error,
		busy
	};
});
