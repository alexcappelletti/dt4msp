<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Layer } from '#shared/types/gn-layer'
import { useGeonodeApi } from '@/composables/useGeonodeApi';
import { useSpatialResourceStore } from '@/stores/spatialResourceStore';
import LayerDetailsPanel from '@/components/layerDetailsPanel.vue';


const { getLayer } = useGeonodeApi();
const store = useSpatialResourceStore();
const loading = ref(false);
const error = ref<Error | null>(null);
const selectedLayerDetails = ref<Layer | null>(null); // Dettagli completi per la colonna DX

// Variabile computata per mostrare/nascondere il pannello dettagli
const showDetails = computed(() => selectedLayerDetails.value !== null);
const layerSummaries = computed(() => store.availableLayers) // Lista usata per la colonna SX


const setLayerDetails = async (pk: string) => {
	loading.value = true;
	error.value = null;
	try {
		// Chiamata all'API per ottenere i dettagli completi del layer
		selectedLayerDetails.value = await getLayer(pk);
	} catch (err: any) {
		error.value = err instanceof Error ? err : new Error(String(err));
		selectedLayerDetails.value = null; // Resetta se fallisce
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="container">
		<h1>Catalogo Layer GeoNode</h1>
		<v-btn @click="store.loadLayers()" :disabled="store.busy">
			{{ store.busy ? 'Caricamento...' : 'Carica Tutti i Layer' }}
		</v-btn>


		<div v-if="store.error" class="error">Errore: {{ store.error.message }}</div>

		<div class="tw:grid tw:grid-cols-3 content-wrapper">
			<!-- COLONNA SINISTRA: Lista Layer -->
			<div class="tw:full-h">
				<h2>Lista ({{ layerSummaries.length }})</h2>
				<p v-if="store.busy && layerSummaries.length === 0">Caricamento lista in corso...</p>
				<ul v-if="layerSummaries.length > 0" class="scrollable-list">
					<li v-for="(layer, idx) in layerSummaries" :key="layer.pk"
						:class="{ selected: selectedLayerDetails?.pk === layer.pk }"
						@click="async () => await setLayerDetails(layer.pk)">
						{{ idx }}. {{ layer.title }}
					</li>
				</ul>
			</div>

			<!-- COLONNA DESTRA: Dettagli Layer Selezionato -->
			<LayerDetailsPanel  class="tw:col-span-2 details-panel tw:w-full tw:full-h"
                :layer="selectedLayerDetails" 
                :is-loading="store.busy" 
            />
		</div>
	</div>
</template>

<style scoped lang="css">
@reference "@/assets/css/tailwind.css";

.container {
	@apply 
		tw:min-h-screen;
	padding: 20px;
}

.content-wrapper {
	margin-top: 20px;
}

.scrollable-list {
	list-style-type: none;
	padding: 0;
	/* Imposta l'altezza massima desiderata, es: 400px o 50vh */
	
	max-height: 1000px;
	overflow-y: auto;
	overflow-x: hidden;

	/* Opzionale: aggiunge un bordo se vuoi visibilità */
	border-top: 1px solid #eee;
}


.details-panel {
	@apply 
		tw:flex tw:flex-col tw:h-full;
	padding: 15px;
	border: 1px solid #ccc;
	border-radius: 5px;
	min-height: 300px;
}


/* STILI AGGIUNTI PER THUMBNAIL E MAPPA */
.thumbnail-container {
    margin-bottom: 15px;
    text-align: center;
}

.layer-thumbnail {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}




.layer-list-panel ul {
	list-style-type: none;
	padding: 0;
}

.error {
	color: red;
	margin-top: 10px;
}

ul li {
	cursor: pointer;
	padding: 8px 5px;
	border-bottom: 1px solid #eee;
	transition: background-color 0.2s;
}

ul li:hover {
	background-color: #f0f0f0;
}

ul li.selected {
	background-color: #e0e0e0;
	font-weight: bold;
}

.details-panel h3 {
	margin-top: 10px;
	margin-bottom: 5px;
}
</style>
