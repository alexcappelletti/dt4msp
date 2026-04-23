<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Layer } from '#/shared/types/geonodeTypes';
import { useSpatialResourceStore } from '@/stores/spatialStore';
import { useLayeredMapStore } from '#imports';

const LAYER_SELECTION_STORAGE_KEY = 'geonode.selectedLayerPk';

const mapStore = useSpatialResourceStore();
const gnLayerStore = useLayeredMapStore();
const loading = ref(false);
const error = ref<Error | null>(null);
const selectedLayerDetails = ref<Layer | null>(null);
const layerSummaries = computed(() => mapStore.availableLayers);
const selectedLayerTitle = computed(() => {
	if (selectedLayerDetails.value?.title) {
		return selectedLayerDetails.value.title;
	}
	return 'Nessun layer selezionato';
});

const saveSelectedLayerPk = (pk: string) => {
	if (!import.meta.client) return;
	localStorage.setItem(LAYER_SELECTION_STORAGE_KEY, pk);
};

const restoreSelection = async () => {
	if (!import.meta.client) return;
	const savedPk = localStorage.getItem(LAYER_SELECTION_STORAGE_KEY);
	if (!savedPk) return;
	const existsInCurrentList = layerSummaries.value.some((layer) => layer.pk === savedPk);
	if (!existsInCurrentList) return;
	await setLayerDetails(savedPk);
};

onMounted(async () => {
	if (layerSummaries.value.length === 0) {
		await mapStore.loadLayers();
	}
	await restoreSelection();
});

const setLayerDetails = async (pk: string) => {
	loading.value = true;
	error.value = null;
	try {
		selectedLayerDetails.value = await mapStore.getLayer(pk);
		await gnLayerStore.selectGnLayer(selectedLayerDetails.value);
		saveSelectedLayerPk(pk);
	} catch (err: any) {
		error.value = err instanceof Error ? err : new Error(String(err));
		selectedLayerDetails.value = null;
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="container">
		
		<!-- <v-btn @click="mapStore.loadLayers()" :disabled="mapStore.busy">
			{{ mapStore.busy ? 'Caricamento...' : 'Carica Tutti i Layer' }}
		</v-btn> -->
		<v-text-field
			label="layer selezionato"
			:model-value="selectedLayerTitle"
			readonly
			density="comfortable"
			variant="outlined"
			class="tw:mb-3 tw:mt-3"
		/>

		<div v-if="mapStore.error" class="error">Errore: {{ mapStore.error.message }}</div>
		<div v-if="error" class="error">Errore dettaglio layer: {{ error.message }}</div>

		<div class="tw:grid tw:grid-cols-3 content-wrapper">
			<div class="tw:full-h">
				<h4>Lista ({{ layerSummaries.length }})</h4>
				<GeonodeLayerList
					:layers="layerSummaries"
					:selected-pk="selectedLayerDetails?.pk"
					:loading="mapStore.busy"
					@select="setLayerDetails"
				/>
			</div>

			<LayerDetailsPanel
				class="tw:col-span-2 details-panel tw:w-full tw:full-h"
				:layer="selectedLayerDetails"
				:is-loading="loading"
			/>
		</div>
	</div>
</template>	
