<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Layer } from '#/shared/types/gn-layer';
import { useLayerHelper, type OGCType } from '@/composables/useLayerHelper';
import { useLayeredMapStore } from '~/stores/layeredMapStore';

const props = defineProps<{
	layer: Layer | null;
	isLoading: boolean;
}>();

const { ogcTypes } = useLayerHelper();
const mapStore = useLayeredMapStore();

const hasDetails = computed(() => props.layer !== null);

/**
 * Logica di default: 
 * Se il layer cambia, decidiamo il tipo OGC iniziale.
//  */
watch(() => props.layer, async (newLayer) => {
	if (newLayer) {
		const availableTypes = ogcTypes(newLayer); // es: ['wms', 'wfs']
		
		if (availableTypes.includes('wms')) {
			// Altrimenti usa WMS
			mapStore.setSelectedOGCType('wms');
		} else if (availableTypes.includes('wfs')) {
			// Priorità al WFS se presente (anche se c'è WMS)
			mapStore.setSelectedOGCType('wfs');
		}
	}
}, { immediate: true });

// Mapping reattivo tra il componente Vuetify e lo Store
const selectedOGCType = computed({
  get: () => mapStore.selectedOGCType,
  set: (newValue) => {
    if (newValue) {
      mapStore.setSelectedOGCType(newValue as OGCType);
    }
  }
});

// Calcolo dinamico delle feature caricate dallo store
const featuresFound = computed(() => {
  if (props.layer && mapStore.selectedOGCType === 'wfs') {
    const state = mapStore.getFeaturedLayersState.find(s => s.geonodeLayer.pk === props.layer?.pk);
    return state?.geojsonData?.features?.length || 0;
  }
  return 0;
});
</script>

<template>
	<div class="tw:flex-1 tw:p-4 tw:border tw:border-gray-300 tw:rounded-md tw:bg-white tw:flex tw:flex-col">
		<!-- Stato caricamento -->
		<div v-if="isLoading && !hasDetails" class="tw:text-gray-600 tw:p-4">
			<p class="tw:mb-2">Caricamento dettagli...</p>
			<v-progress-linear indeterminate color="primary"></v-progress-linear>
		</div>

		<!-- Dettagli Layer -->
		<div v-else-if="hasDetails && layer">
			<h2 class="tw:text-2xl tw:font-bold tw:mb-4">{{ layer.title }}</h2>
			
			<p class="tw:mt-4 tw:mb-4 tw:text-gray-700 tw:text-sm">
				{{ layer.abstract || 'Nessuna descrizione fornita.' }}
			</p>

			<div class="tw:flex tw:flex-wrap tw:gap-6 tw:mb-4">
				<!-- COLONNA SINISTRA: Controlli -->
				<div class="tw:flex-1 tw:min-w-0">
					<div class="tw:my-4">
						<div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
							<span class="tw:text-sm tw:font-semibold">Servizio OGC:</span>
							<a :href="layer.ows_url" target="_blank" class="tw:text-xs tw:text-blue-500 tw:hover:underline">
								Endpoint Server
							</a>
						</div>

						<v-btn-toggle 
							v-model="selectedOGCType"
							mandatory 
							color="primary" 
							density="compact" 
							variant="outlined"
							divided
						>
							<v-btn v-if="ogcTypes(layer).includes('wms')" value="wms">
								<v-icon start>mdi-layers-outline</v-icon>
								WMS (Raster)
							</v-btn>
							<v-btn v-if="ogcTypes(layer).includes('wfs')" value="wfs">
								<v-icon start>mdi-vector-selection</v-icon>
								WFS (Vettoriale)
							</v-btn>
						</v-btn-toggle>
					</div>

					<v-alert
						v-if="selectedOGCType === 'wfs'"
						density="compact"
						type="info"
						variant="tonal"
						class="tw:mt-2"
					>
						<template v-slot:prepend>
							<v-icon size="small">mdi-database-check</v-icon>
						</template>
						<span class="tw:text-xs">
							Feature vettoriali caricate: <strong>{{ featuresFound }}</strong>
						</span>
					</v-alert>
				</div>

				<!-- COLONNA DESTRA: Thumbnail -->
				<div class="tw:w-64">
					<v-img 
						:src="layer.thumbnail_url" 
						:alt="layer.title" 
						class="tw:rounded-md tw:shadow-md" 
						cover 
						height="160"
					>
						<template v-slot:placeholder>
							<div class="tw:flex tw:items-center tw:justify-center tw:h-full tw:bg-gray-100">
								<v-icon color="grey-lighten-1">mdi-image-off</v-icon>
							</div>
						</template>
					</v-img>
				</div>
			</div>

			<!-- Anteprima Mappa -->
			<div class="tw:mt-6">
				<div class="tw:flex tw:justify-between tw:items-end tw:mb-2">
					<h3 class="tw:text-lg tw:font-bold">Anteprima Mappa</h3>
					<v-chip size="x-small" color="grey-darken-2" variant="flat">
						MODALITÀ: {{ selectedOGCType }}
					</v-chip>
				</div>
				<div class="tw:w-full tw:border tw:rounded-lg tw:overflow-hidden tw:bg-slate-50">
					<layer-map-view />
				</div>
			</div>
		</div>

		<!-- Stato Vuoto -->
		<div v-else class="tw:flex-1 tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-gray-400 tw:gap-4">
			<v-icon size="64" color="grey-lighten-1">mdi-map-search-outline</v-icon>
			<p>Seleziona un layer dalla lista per visualizzare i dettagli e l'anteprima.</p>
		</div>
	</div>
</template>
