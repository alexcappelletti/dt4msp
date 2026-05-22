<script setup lang="ts">
import type { Layer } from '#/shared/types/geonodeTypes';
import CardListLayout from '@/components/layouts/CardListLayout.vue';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useSpatialResourceStore } from '@/stores/spatialStore';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const scenarioStore = useScenarioStore();
const spatialResourceStore = useSpatialResourceStore();
const { currentProject } = storeToRefs(scenarioStore);

const mapId = computed(() => String(route.params.id || ''));
const isLoading = ref(false);
const selectedDatasetDetails = ref<Layer | null>(null);
const searchText = ref('');
const sortBy = ref<'title' | 'popular' | 'created'>('title');

const sortOptions = [
	{ label: 'Titolo', value: 'title' },
	{ label: 'Popolarita', value: 'popular' },
	{ label: 'Data di creazione', value: 'created' },
];

const availableMapDatasets = computed(() => spatialResourceStore.availableMapDatasets);
const datasetCountLabel = computed(() => {
	const count = sortedDatasets.value.length;
	if (count === 0) return 'Nessun dataset disponibile';
	if (count === 1) return '1 dataset disponibile';
	return `${count} dataset disponibili`;
});

const loadDatasetsForMap = async (mapIdValue: string) => {
	if (!mapIdValue) {
		spatialResourceStore.resetMapDatasets();
		return;
	}

	isLoading.value = true;
	try {
		await spatialResourceStore.loadMapDatasets(mapIdValue);
		selectedDatasetDetails.value = null;
	} finally {
		isLoading.value = false;
	}
};

watch(
	mapId,
	async (newMapId, oldMapId) => {
		if (!newMapId || newMapId === oldMapId) return;
		await loadDatasetsForMap(newMapId);
	},
	{ immediate: true },
);

// Compute filtered datasets based on search
const filteredDatasets = computed(() => {
	const query = searchText.value.trim().toLowerCase();
	if (!query) {
		return availableMapDatasets.value;
	}
	return availableMapDatasets.value.filter(
		(dataset) =>
			dataset.title.toLowerCase().includes(query) ||
			dataset.abstract.toLowerCase().includes(query) ||
			dataset.owner_username.toLowerCase().includes(query)
	);
});

const sortedDatasets = computed(() => {
	const datasets = [...filteredDatasets.value];
	switch (sortBy.value) {
		case 'popular':
			return datasets.sort((a, b) => (Number(b.popular_count ?? 0)) - (Number(a.popular_count ?? 0)));
		case 'created':
			return datasets.sort((a, b) => {
				const aDate = new Date(a.created).getTime();
				const bDate = new Date(b.created).getTime();
				return bDate - aDate;
			});
		case 'title':
		default:
			return datasets.sort((a, b) => a.title.localeCompare(b.title, 'it'));
	}
});

const associatedMapTitle = computed(() => currentProject.value?.areaOfInterest?.associatedMap?.title || 'Mappa');
const areaTitle = computed(() => currentProject.value?.areaOfInterest?.name || 'Area');

const selectDataset = async (pk: string) => {
	isLoading.value = true;
	try {
		await spatialResourceStore.selectLayer(pk);
		// ensure we store the actual value (not the computed ref)
		selectedDatasetDetails.value = (spatialResourceStore.currentlySelectedLayer as any)?.value ?? null;
	} finally {
		isLoading.value = false;
	}
};

const handleSearchTyping = (query: string) => {
	searchText.value = query ?? '';
};
</script>

<template>
	<div class="spatial-resources-container">
		<!-- Header -->
		<div class="pa-6 header-section">
			<p class="text-body2 text-grey">
				Risorse spaziali associate alla mappa <strong>{{ associatedMapTitle }}</strong> utilizzata nell'area <strong>{{ areaTitle }}</strong>
			</p>
		</div>

		<div class="tab-content px-6 py-4">
			<card-list-layout :loading="isLoading">
				<template #filters>
					<div class="filters-row">
						<v-text-field v-model="searchText" label="Ricerca dataset" variant="outlined"
							prepend-inner-icon="mdi-magnify" clearable hide-details class="mr-4"
							@update:model-value="handleSearchTyping" />
						<v-select v-model="sortBy" :items="sortOptions" label="Ordina per" hide-details
							variant="outlined" class="sort-select" />
					</div>
					<p class="text-caption text-medium-emphasis mb-2">
						{{ datasetCountLabel }}
					</p>
				</template>
				<template #detail>
					<div class="detail-panel">
						<div v-if="selectedDatasetDetails" class="detail-content">
							<v-img :src="selectedDatasetDetails.thumbnail_url" aspect-ratio="16/9" cover class="detail-thumb mb-3" />
							<h3 class="text-h6 mb-2">{{ selectedDatasetDetails.title }}</h3>
							<p class="text-body2 mb-3">{{ selectedDatasetDetails.abstract || selectedDatasetDetails.raw_abstract || 'Nessuna descrizione disponibile.' }}</p>
							<div class="text-caption text-grey d-flex gap-3 mb-3">
								<span class="d-flex align-center gap-1">
									<v-icon size="14">mdi-account</v-icon>
									{{ selectedDatasetDetails.owner?.username || '' }}
								</span>
								<span class="d-flex align-center gap-1">
									<v-icon size="14">mdi-calendar</v-icon>
									{{ selectedDatasetDetails.created }}
								</span>
							</div>
							<div class="detail-actions">
								<v-btn :href="selectedDatasetDetails.detail_url" target="_blank" rel="noopener noreferrer" variant="outlined" size="small">Apri su GeoNode</v-btn>
							</div>
						</div>
						<div v-else class="detail-empty text-caption text-medium-emphasis">Seleziona un dataset per vedere il dettaglio</div>
					</div>
				</template>
				<template #list>
					<div class="datasets-grid">
						<div v-if="isLoading && sortedDatasets.length === 0" class="loading-state">
							<v-progress-circular indeterminate color="primary" />
							<p class="mt-4">Caricamento dataset...</p>
						</div>

						<div v-else-if="sortedDatasets.length === 0" class="empty-state">
							<v-icon size="48" class="text-grey-5">mdi-database-off-outline</v-icon>
							<p class="mt-4 text-body2">Nessun dataset disponibile per questa mappa</p>
						</div>

						<v-card v-for="dataset in sortedDatasets" :key="dataset.pk" class="dataset-card"
							:class="{ 'active-card': selectedDatasetDetails?.pk === dataset.pk }"
							@click="selectDataset(dataset.pk)">
							<div class="card-image-wrapper">
								<v-img :src="dataset.thumbnail_url" :alt="dataset.title" height="180" cover
									class="bg-grey-2">
									<template #placeholder>
										<div class="d-flex align-center justify-center h-100 bg-grey-3">
											<v-icon size="48" color="grey-5">mdi-image-off</v-icon>
										</div>
									</template>
								</v-img>
							</div>

							<v-card-item class="card-content">
								<v-card-title class="text-subtitle2 font-weight-bold line-clamp-2">
									{{ dataset.title }}
								</v-card-title>

								<v-card-subtitle v-if="dataset.abstract" class="text-caption line-clamp-2 mt-2">
									{{ dataset.abstract }}
								</v-card-subtitle>

								<div class="card-footer mt-3 pt-3 border-t d-flex items-center justify-between">
									<div class="text-caption text-grey d-flex gap-2 flex-wrap">
										<span class="d-flex align-center gap-1">
											<v-icon size="12">mdi-account</v-icon>
											{{ dataset.owner_username }}
										</span>
										<span class="d-flex align-center gap-1">
											<v-icon size="12">mdi-eye</v-icon>
											{{ dataset.popular_count }}
										</span>
									</div>
									<div>
										<v-btn size="small" variant="outlined" @click.stop="selectDataset(dataset.pk)">Visualizza</v-btn>
									</div>
								</div>
							</v-card-item>
						</v-card>
					</div>
				</template>
			</card-list-layout>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.spatial-resources-container {
	background-color: rgb(var(--v-theme-main-rose));
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow: auto;
	display: flex;
	flex-direction: column;
}

.header-section {
	background-color: rgba(255, 255, 255, 0.5);
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	flex-shrink: 0;
}

.tab-content {
	flex: 1;
	min-height: 0;
	overflow: auto;
}

// Cards Section
.cards-section {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.datasets-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1.5rem;
	padding: 1rem 0;
}

.filters-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;
}

.sort-select {
	min-width: 220px;
	width: 100%;
	max-width: 280px;
}

.dataset-card {
	cursor: pointer;
	transition: box-shadow 0.18s ease, border-color 0.18s ease;
	border: 2px solid transparent;
	overflow: hidden;
	background-color: white;

	&:hover {
		/* subtle hover, no 3D transform */
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
	}

	&.active-card {
		border-color: var(--v-theme-primary);
		box-shadow: 0 0 0 3px rgba(var(--v-theme-primary-rgb), 0.06);
	}
}

.dataset-detail-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	background-color: white;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 16px;
	padding: 1rem;
}

.detail-card {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	gap: 1rem;
}

.detail-image {
	border-radius: 12px;
	overflow: hidden;
}

.detail-body {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.detail-title {
	font-size: 1.25rem;
	font-weight: 700;
	margin: 0;
}

.detail-description {
	color: rgba(0, 0, 0, 0.75);
	line-height: 1.6;
}

.detail-meta {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
	font-size: 0.9rem;
	color: rgba(0, 0, 0, 0.65);
}

.detail-actions {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.detail-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	min-height: 220px;
	color: var(--v-theme-grey);
}

.card-image-wrapper {
	position: relative;
	overflow: hidden;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card-content {
	padding: 1rem;
}

.card-footer {
	border-color: rgba(0, 0, 0, 0.08);
}

.line-clamp-2 {
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	color: var(--v-theme-grey);
}

.border-t {
	border-top: 1px solid currentColor;
}
</style>
