<script setup lang="ts">
	import type { Dataset } from "#/shared/types/geonodeTypes";
	import { useLayeredMapStore } from "#imports";
	import { useSpatialResourceStore } from "@/stores/spatialStore";
	import { computed, onMounted } from "vue";

	const LAYER_SELECTION_STORAGE_KEY = "geonode.selectedLayerPk";

	const mapStore = useSpatialResourceStore();
	const gnLayerStore = useLayeredMapStore();
	const loading = ref(false);
	const error = ref<Error | null>(null);
	const selectedLayerDetails = ref<Dataset | null>(null);
	const allLayerSummaries = computed(() => mapStore.availableLayers);
	const searchText = ref("");
	const layerSummaries = computed(() => {
		const query = searchText.value.trim().toLowerCase();
		if (!query) {
			return allLayerSummaries.value;
		}
		return allLayerSummaries.value.filter(
			(layer) =>
				layer.title.toLowerCase().includes(query) ||
				layer.abstract.toLowerCase().includes(query) ||
				layer.owner_username.toLowerCase().includes(query),
		);
	});

	const saveSelectedLayerPk = (pk: string) => {
		if (!import.meta.client) return;
		localStorage.setItem(LAYER_SELECTION_STORAGE_KEY, pk);
	};

	const restoreSelection = async () => {
		if (!import.meta.client) return;
		const savedPk = localStorage.getItem(LAYER_SELECTION_STORAGE_KEY);
		if (!savedPk) return;
		const existsInCurrentList = allLayerSummaries.value.some(
			(layer) => layer.pk === savedPk,
		);
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
			selectedLayerDetails.value = await mapStore.getDataset(pk);
			await gnLayerStore.selectGnLayer(selectedLayerDetails.value);
			searchText.value = selectedLayerDetails.value.title || "";
			saveSelectedLayerPk(pk);
		} catch (err: any) {
			error.value = err instanceof Error ? err : new Error(String(err));
			selectedLayerDetails.value = null;
		} finally {
			loading.value = false;
		}
	};

	const handleSearchTyping = (query: string) => {
		searchText.value = query ?? "";
		if (!searchText.value.trim()) {
			selectedLayerDetails.value = null;
			gnLayerStore.resetStore();
		}
	};

	const onEnterSelect = async () => {
		const firstMatch = layerSummaries.value[0];
		if (firstMatch) {
			await setLayerDetails(firstMatch.pk);
		}
	};
</script>

<template>
	<div class="container">
		<!-- <v-btn @click="mapStore.loadLayers()" :disabled="mapStore.busy">
			{{ mapStore.busy ? 'Caricamento...' : 'Carica Tutti i Layer' }}
		</v-btn> -->
		<v-text-field
			label="Mappa"
			v-model="searchText"
			variant="outlined"
			hide-details
			clearable
			:loading="mapStore.busy"
			class="tw:my-3"
			@update:model-value="handleSearchTyping"
			@click:clear="handleSearchTyping('')"
			@keydown.enter="onEnterSelect"
		/>
		<div v-if="mapStore.error" class="error">
			Errore: {{ mapStore.error.message }}
		</div>
		<div v-if="error" class="error">
			Errore dettaglio layer: {{ error.message }}
		</div>

		<div class="tw:grid tw:grid-cols-3 content-wrapper">
			<GeonodeLayerList
				:layers="layerSummaries"
				:selected-pk="selectedLayerDetails?.pk"
				:loading="mapStore.busy"
				@select="setLayerDetails"
			/>

			<LayerDetailsPanel
				class="tw:col-span-2 details-panel tw:w-full tw:full-h"
				:layer="selectedLayerDetails"
				:is-loading="loading"
			/>
		</div>
	</div>
</template>

