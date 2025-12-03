<!-- components/geospatial/LayerDetailsPanel.vue -->

<script setup lang="ts">
// Assicurati che il percorso di importazione per il tipo Layer completo sia corretto
import type { Layer } from '#/shared/types/gn-layer';
import { computed } from 'vue';

const props = defineProps<{
	layer: Layer | null;
	isLoading: boolean;
}>();

const hasDetails = computed(() => props.layer !== null);

// ... (logica watch/initializeMap omessa per brevità) ...
</script>

<template>
	<div class="tw:flex-1 tw:p-4 tw:border tw:border-gray-300 tw:rounded-md tw:bg-white tw:flex tw:flex-col">
		<h2 class="tw:text-xl tw:font-semibold tw:mb-4">Dettagli Layer</h2>

		<div v-if="isLoading && !hasDetails" class="tw:text-gray-600">
			Caricamento dettagli...
		</div>

		<div v-else-if="hasDetails && layer">

			<!-- CONTENITORE PRINCIPALE: Diviso in 2 colonne con prefisso tw: -->
			<div class="tw:flex tw:flex-wrap tw:gap-4 tw:mb-4">

				<!-- COLONNA SINISTRA: Campi di testo con prefisso tw: -->
				<div class="tw:flex-1 tw:min-w-0">
					<p class="tw:mb-1"><strong class="tw:font-semibold">Titolo:</strong> {{ layer.title }}</p>
					<p class="tw:mb-1"><strong class="tw:font-semibold">Nome (Name):</strong> {{ layer.name }}</p>
					<p class="tw:mb-1"><strong class="tw:font-semibold">Alternativo (Alternate):</strong> {{ layer.alternate }}</p>
					<p class="tw:mb-1">
						<strong class="tw:font-semibold">OWS URL:</strong>
						<a :href="layer.ows_url" target="_blank" class="tw:text-blue-500 tw:hover:underline tw:break-all">
							{{ layer.ows_url }}
						</a>
					</p>
					<p class="tw:mb-1"><strong class="tw:font-semibold">Style di Default:</strong> {{ layer.default_style?.name ||
						'Nessuno' }}</p>
				</div>

				<!-- COLONNA DESTRA (Immagine) con prefisso tw: -->
				<div class="tw:w-48 tw:ml-auto">
					<img :src="layer.thumbnail_url" :alt="'Thumbnail ' + layer.title" class="tw:max-w-full tw:h-auto
						tw:rounded-md tw:shadow-md tw:object-cover"/>
				</div>
			</div>

			<!-- Descrizione -->
			<h3 class="tw:text-lg tw:font-semibold tw:mt-4 tw:mb-2">Descrizione (Abstract):</h3>
			<p class="tw:mb-4 tw:text-gray-700">{{ layer.abstract || 'Nessuna descrizione fornita.' }}</p>

			<!-- Mappa -->
			<h3 class="tw:text-lg tw:font-semibold tw:mt-4 tw:mb-2">Anteprima Mappa</h3>
			<div class="tw:w-full tw:h-150 ">
				<!-- Passiamo solo il layer corrente e il suo BBOX calcolato -->
				<layer-map-view :active-layers="[layer]" />

			</div>
		</div>	
		<div v-else class="tw:text-gray-500">
			Seleziona un layer dalla lista a sinistra per visualizzare i dettagli.
		</div>
	</div>
</template>

<!-- Rimosso completamente il tag <style scoped> -->
