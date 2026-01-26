<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Measure, Theme } from '#/shared/types/msp-project';
import { useScenarioStore } from '@/stores/scenarioStore';
export type MeasureType = 'Spatial' | 'Non-spatial';


const props = defineProps<{
	measures: Measure[];
}>();
const store = useScenarioStore();

// --- Gestione dei Temi Disponibili (Caricati da un'altra fonte/API) ---
// Utilizziamo un ref locale o carichiamo questi dati all'avvio dell'app/pagina principale
const availableThemes = computed(() => store.availableThemes);



// Logica di filtro basata sull'immagine ("Spatial", "Non-spatial", "Theme")
const currentFilter = ref('Tutti');
const availableFilters = ['Tutti', 'Spatial', 'Non-spatial'];


const filteredMeasures = computed(() => {
	if (currentFilter.value === 'Tutti') return props.measures;
	// Filtro basato sul tipo di misura (Spatial/Non-spatial)
	if (currentFilter.value === 'Spatial') {
		return props.measures.filter(m => isSpatial(m));
	}
	if (currentFilter.value === 'Non-spatial') {
		return props.measures.filter(m => isNonSpatial(m));
	}
	return []
});

function isSpatial(measure: Measure): boolean {
	return measure.geospatialResources !== undefined && Array.isArray(measure.geospatialResources);
}
function isNonSpatial(measure: Measure): boolean {
	return measure.geospatialResources === undefined;
}
// Eventi emessi dal componente per gestire edit, delete e l'apertura del form per nuova misura
const emit = defineEmits(['delete:measure', 'edit:measure']);

const deleteMeasure = (id: string) => {
	emit('delete:measure', id);
};

const editMeasure = (measure: Measure) => {
	console.log('Editing measure:', measure);
	emit('edit:measure', measure);
};

</script>

<template>
	<div class="measures-list-container">
		<!-- Area Filtri come da immagine -->
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>
			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip v-for="filter in availableFilters" :key="filter" :value="filter">
					{{ filter }}
				</v-chip>
				<!-- Dropdown 'Theme' come da immagine -->
				<v-chip append-icon="mdi-menu-down">Tema</v-chip>
			</v-chip-group>
		</div>

		<!-- Lista di Card -->
		<div v-if="filteredMeasures.length > 0" class="measures-grid">
			<v-card v-for="measure in filteredMeasures" :key="measure.id" class="measure-card hover-effect"
				@click="editMeasure(measure)">
				<v-card-item>
					<div class="d-flex justify-space-between align-start">
						<div class="d-flex align-center">
							<!-- Icona/Avatar N o S basata sul tipo di misura (Non-spatial/Spatial) -->
							<v-avatar size="32" class="mr-3"
								:color="isSpatial(measure) ? 'secondary' : 'primary'">
								<span class="white--text">{{ isSpatial(measure) ? 'S' : 'N' }}</span>
							</v-avatar>
							<div>
								<div class="text-subtitle-1"><strong>{{ measure.name }}</strong></div>
								<div class="text-caption text-medium-emphasis">
									<!-- Mostra "Non-spatial measure" o "Spatial measure" -->
									{{ isSpatial(measure) ? 'Spatial' : 'Non-spatial' }} measure
								</div>
							</div>
						</div>
						<v-btn icon variant="text" size="small" @click.stop="deleteMeasure(measure.id)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</div>
				</v-card-item>

				<!-- Parte centrale con immagine segnaposto (come da immagine) -->
				<div class="image-placeholder bg-grey-lighten-3">
					<v-icon size="64" color="grey-darken-1">mdi-image</v-icon>
				</div>

				<v-card-text>
					<p class="font-weight-bold mb-1">Long name</p>
					<p class="text-medium-emphasis mb-3">{{ measure.name + measure.id }}</p>

					<p class="font-weight-bold mb-1">Description:</p>
					<p class="text-medium-emphasis text-caption">
						{{ measure.description || 'Nessuna descrizione disponibile.' }}</p>
				</v-card-text>
			</v-card>
		</div>
		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Nessuna misura trovata.
		</v-alert>
	</div>
</template>

<style scoped>
.measures-list-container {
	min-width: 100%;
	padding: 20px;
	/* Rimosso background-color: aquamarine; come richiesto dal template originale */
}

.measures-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 16px;
}

.measure-card {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.image-placeholder {
	height: 120px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 16px;
	border-radius: 4px;
}

/* Posizionamento del FAB fisso in basso a destra, come nell'immagine finale */
.fab-container {
	position: fixed;
	bottom: 20px;
	right: 20px;
	z-index: 1000;
}
</style>
