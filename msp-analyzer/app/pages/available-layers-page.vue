<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGeonodeApi } from '@/composables/useGeonodeApi';
import type { Layer } from '#shared/types/gn-layer'

const { getAllAvailableLayers, getLayer } = useGeonodeApi();
const loading = ref(false);
const error = ref<Error | null>(null);
const layerSummaries = ref<Layer[]>([]); // Lista usata per la colonna SX
const selectedLayerDetails = ref<Layer | null>(null); // Dettagli completi per la colonna DX

// Variabile computata per mostrare/nascondere il pannello dettagli
const showDetails = computed(() => selectedLayerDetails.value !== null);

const loadLayers = async () => {
	loading.value = true;
	error.value = null;
	selectedLayerDetails.value = null;
	try {
		layerSummaries.value = await getAllAvailableLayers();
	} catch (err: any) {
		error.value = err instanceof Error ? err : new Error(String(err));
	} finally {
		loading.value = false;
	}
};


const selectLayer = async (pk: string) => {
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
		<button @click="loadLayers" :disabled="loading">
			{{ loading ? 'Caricamento...' : 'Carica Tutti i Layer' }}
		</button>

		<div v-if="error" class="error">Errore: {{ error.message }}</div>

		<div class="content-wrapper">
			<!-- COLONNA SINISTRA: Lista Layer -->
			<div class="layer-list-panel">
				<h2>Lista ({{ layerSummaries.length }})</h2>
				<p v-if="loading && layerSummaries.length === 0">Caricamento lista in corso...</p>
				<ul v-if="layerSummaries.length > 0">
					<li v-for="layer in layerSummaries" :key="layer.pk"
						:class="{ selected: selectedLayerDetails?.pk === layer.pk }"
						@click="() => selectLayer(layer.pk)">
						{{ layer.title }}
					</li>
				</ul>
			</div>

			<!-- COLONNA DESTRA: Dettagli Layer Selezionato -->
			<div class="details-panel">
				<h2>Dettagli Layer</h2>
				<div v-if="loading && selectedLayerDetails === null">
					Caricamento dettagli...
				</div>
				<div v-else-if="showDetails && selectedLayerDetails">
					<!-- Mostra i campi richiesti -->
					<p><strong>Titolo:</strong> {{ selectedLayerDetails.title }}</p>
					<p><strong>Nome (Name):</strong> {{ selectedLayerDetails.name }}</p>
					<p><strong>Alternativo (Alternate):</strong> {{ selectedLayerDetails.alternate }}</p>
					<p><strong>OWS URL:</strong> <a :href="selectedLayerDetails.ows_url" target="_blank">{{
						selectedLayerDetails.ows_url }}</a></p>
					<p><strong>Style di Default:</strong> {{ selectedLayerDetails.default_style?.name || 'Nessuno' }}
					</p>

					<h3>Descrizione (Abstract):</h3>
					<p>{{ selectedLayerDetails.abstract || 'Nessuna descrizione fornita.' }}</p>

				</div>
				<div v-else>
					Seleziona un layer dalla lista a sinistra per visualizzare i dettagli.
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.container {
	padding: 20px;
}

.content-wrapper {
	display: flex;
	gap: 20px;
	margin-top: 20px;
}

.layer-list-panel,
.details-panel {
	flex: 1;
	padding: 15px;
	border: 1px solid #ccc;
	border-radius: 5px;
	min-height: 300px;
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
