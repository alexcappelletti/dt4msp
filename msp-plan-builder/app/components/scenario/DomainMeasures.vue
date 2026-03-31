<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DomainMeasure,  } from '#/shared/types/msp-project';
import { isNonSpatialMeasure, isSpatialMeasure } from '#/shared/types/msp-project';


interface MenuItem {
	title: string;
	icon: string;
	action: (measure: DomainMeasure) => void;
}



export type MeasureType = 'Spatial' | 'Non-spatial';


const props = defineProps<{
	domainMeasures: DomainMeasure[];
}>();
// Eventi emessi dal componente per gestire edit, delete e l'apertura del form per nuova misura

const emit = defineEmits<{
	(e: "edit:measure", measure: DomainMeasure): void;
	(e: "delete:measure", measure: DomainMeasure): void;
	(e: "clone:measure", measure: DomainMeasure): void;
}>();

const store = useScenarioStore();
const availableThemes = computed(() => store.availableThemes);

type Filter = 'Tutti' | 'Spatial' | 'Non-spatial';
const currentFilter = ref<Filter>('Tutti');
const selectedThemeId = ref<string | null>(null);
const selectedThemeLabel = computed(() => {
	if (!selectedThemeId.value) return 'Tema';
	const theme = availableThemes.value.find((t) => t.id === selectedThemeId.value);
	return theme?.name ?? 'Tutti i temi';
});



function measureType(measure: DomainMeasure): MeasureType {
	if (measure.type === 'Spatial') { return 'Spatial'; }
	return 'Non-spatial';
}

function themesForMeasure(measure: DomainMeasure): Theme[] {
	const all = (measure.referenceThemes ?? []);
	const map = new Map<string, Theme>();
	for (const th of all) map.set(th.id, th);
	return [...map.values()];
}

const filteredMeasures = computed(() => {
	let list = props.domainMeasures ?? [];

	// Filtro basato sul tipo di misura (Spatial/Non-spatial)
	if (currentFilter.value === 'Spatial') {
		list = props.domainMeasures.filter(m => isSpatialMeasure(m));
	}else if (currentFilter.value === 'Non-spatial') {
		list = props.domainMeasures.filter(m => isNonSpatialMeasure(m));
	}
	// Filtro basato sul tema selezionato (se presente)
	if (selectedThemeId.value) {
		list = list.filter(m =>
			themesForMeasure(m).some(t => t.id === selectedThemeId.value)
		);
	}
	return list;
});


const menuItems = (measure: DomainMeasure): MenuItem[] => [
	{ title: 'Duplicate', icon: 'mdi-content-copy', action: (measure) => emit('clone:measure', measure) },
	{ title: 'Delete', icon: 'mdi-delete', action: (measure) => emit('delete:measure', measure) },
];


</script>

<template>
	<div class="measures-list-container">
		<!-- Area Filtri -->
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>
			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip value="Tutti">Tutti</v-chip>
				<v-chip value="Spatial">Spatial</v-chip>
				<v-chip value="Non-spatial">Non-spatial</v-chip>
			</v-chip-group>
				<!-- Dropdown 'Theme'  -->
				<v-menu class="ml-3">
					<template #activator="{ props: menuProps }">
						<v-chip v-bind="menuProps" append-icon="mdi-menu-down" variant="outlined">
							{{ selectedThemeLabel }}
						</v-chip>
					</template>

					<v-list density="compact" style="min-width: 240px">
						<v-list-item title="Tutti i temi" @click="selectedThemeId = null" />
						<v-divider />
						<v-list-item v-for="t in availableThemes" :key="t.id" :title="t.name"
							@click="selectedThemeId = t.id" />
					</v-list>
				</v-menu>
		</div>

		<!-- Lista di Card -->
		<div v-if="filteredMeasures.length > 0" class="measures-grid">
			<v-card v-for="measure in filteredMeasures" :key="measure.id" class="measure-card hover-effect"
				@click="emit('edit:measure', measure)">
				<v-card-item>
					<div class="d-flex justify-space-between align-start">
						<div class="d-flex align-center">
							<!-- Icona/Avatar N o S basata sul tipo di misura (Non-spatial/Spatial) -->
							<v-avatar size="32" class="mr-3" :color="isSpatialMeasure(measure) ? 'secondary' : 'primary'">
								<span class="white--text">{{ isSpatialMeasure(measure) ? 'S' : 'N' }}</span>
							</v-avatar>
							<div>
								<div class="text-subtitle-1"><strong>{{ measure.name }}</strong></div>
								<div class="text-caption text-medium-emphasis">
									<!-- Mostra "Non-spatial measure" o "Spatial measure" -->
									{{ isSpatialMeasure(measure) ? 'Spatial' : 'Non-spatial' }} measure
								</div>
							</div>
						</div>

						<v-menu>
							<template v-slot:activator="{ props: menuProps }">
								<v-btn icon variant="text" size="small" v-bind="menuProps" @click.stop>
									<v-icon>mdi-dots-vertical</v-icon>
								</v-btn>
							</template>

							<v-list density="compact">
								<v-list-item v-for="(item, index) in menuItems(measure)" :key="index"
									@click="item.action(measure)">
									<template v-slot:prepend>
										<v-icon :icon="item.icon"></v-icon>
									</template>
									<v-list-item-title>{{ item.title }}</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>


					</div>
				</v-card-item>

				<!-- Parte centrale con immagine segnaposto (come da immagine) -->
				<div v-if="measure.type === 'Spatial'" class="image-placeholder bg-grey-lighten-3">
					<v-icon size="64" color="grey-darken-1">mdi-image</v-icon>
				</div>

				<v-card-text>
					<p class=""></p>
					<p class="font-weight-bold mb-1">{{ measure.longName || measure.id }}</p>

					<div v-if="measure.referenceThemes?.length" class="d-flex flex-wrap ga-2 mb-2">
						<v-chip
							v-for="(theme, index) in measure.referenceThemes"
							:key="theme.id ?? index"
							size="x-small"
							variant="tonal"
							color="primary"
							class="text-caption"
						>
							{{ theme.name }}
						</v-chip>
					</div>
<!-- 					
					<p class="text-medium-emphasis text-caption">
						{{ measure.description || 'Nessuna descrizione disponibile.' }}</p>
					 -->
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
.mytest {
	margin-top: 12px;
	background-color: var(--color-alex);
	padding: 4px 8px;
	border-radius: 4px;

}
</style>
