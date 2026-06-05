<script setup lang="ts">
	import type { Dataset } from "#/shared/types/geonodeTypes";
	import ListDetailLayout from "@/components/layouts/ListDetailLayout.vue";
	import { useScenarioStore } from "@/stores/scenarioStore";
	import {
		useSpatialResourceStore,
		type SpatialResourceGroup,
	} from "@/stores/spatialStore";
	import { storeToRefs } from "pinia";
	import { computed, ref, watch } from "vue";
	import { useRoute } from "vue-router";

	const route = useRoute();
	const scenarioStore = useScenarioStore();
	const spatialResourceStore = useSpatialResourceStore();
	const { currentProject } = storeToRefs(scenarioStore);

	const mapId = computed(() => String(route.params.id || ""));
	const isLoading = ref(false);
	const selectedDatasetDetails = ref<Dataset | null>(null);
	const searchText = ref("");
	const sortBy = ref<"title" | "popular" | "created">("title");

	const sortOptions = [
		{ label: "Titolo", value: "title" },
		{ label: "Popolarita", value: "popular" },
		{ label: "Data di creazione", value: "created" },
	];

	const spatialResourceGroups = computed(
		() => spatialResourceStore.availableSpatialResources,
	);

	// Flat list of all items from all groups
	const allItems = computed(() => {
		return spatialResourceGroups.value.flatMap((group) => group.items);
	});

	const datasetCountLabel = computed(() => {
		const count = filteredAndSortedItems.value.length;
		if (count === 0) return "";
		if (count === 1) return "1 risorsa trovata";
		return `${count} risorse trovate`;
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

	// Filter all items across all groups
	const filteredItems = computed(() => {
		const query = searchText.value.trim().toLowerCase();
		if (!query) {
			return allItems.value;
		}
		return allItems.value.filter(
			(item) =>
				(item as any).title.toLowerCase().includes(query) ||
				(item as any).abstract.toLowerCase().includes(query) ||
				(item as any).owner_username.toLowerCase().includes(query),
		);
	});

	// Sort filtered items
	const filteredAndSortedItems = computed(() => {
		const items = [...filteredItems.value];
		switch (sortBy.value) {
			case "popular":
				return items.sort(
					(a, b) =>
						Number((b as any).popular_count ?? 0) -
						Number((a as any).popular_count ?? 0),
				);
			case "created":
				return items.sort((a, b) => {
					const aDate = new Date((a as any).created).getTime();
					const bDate = new Date((b as any).created).getTime();
					return bDate - aDate;
				});
			case "title":
			default:
				return items.sort((a, b) =>
					(a as any).title.localeCompare((b as any).title, "it"),
				);
		}
	});

	// Group sorted items back into groups
	const groupedAndSortedItems = computed(() => {
		const sorted = filteredAndSortedItems.value;
		const grouped: SpatialResourceGroup[] = [];

		for (const group of spatialResourceGroups.value) {
			const groupItems = sorted.filter((item) =>
				group.items.some(
					(groupItem) => (groupItem as any).pk === (item as any).pk,
				),
			);
			if (groupItems.length > 0) {
				grouped.push({
					...group,
					items: groupItems,
				});
			}
		}

		return grouped;
	});

	const associatedMapTitle = computed(
		() =>
			currentProject.value?.areaOfInterest?.associatedMap?.title ||
			"Mappa",
	);
	const areaTitle = computed(
		() => currentProject.value?.areaOfInterest?.name || "Area",
	);

	const selectDataset = async (pk: string) => {
		isLoading.value = true;
		try {
			await spatialResourceStore.selectDataset(pk);
			selectedDatasetDetails.value =
				(spatialResourceStore.currentlySelectedDataset as any)?.value ??
				null;
		} finally {
			isLoading.value = false;
		}
	};

	const handleSearchTyping = (query: string) => {
		searchText.value = query ?? "";
	};
</script>

<template>
	<div class="spatial-resources-container">
		<!-- Header -->
		<div class="pa-6 header-section">
			<p class="text-body2 text-grey">
				Risorse spaziali associate alla mappa
				<strong>{{ associatedMapTitle }}</strong> utilizzata nell'area
				di studio
				<strong>{{ areaTitle }}</strong>
			</p>
		</div>

		<list-detail-layout
			:loading="isLoading"
			:detail-open="!!selectedDatasetDetails"
		>
			<template #filters>
				<div class="filters-row">
					<v-text-field
						v-model="searchText"
						label="Ricerca dataset"
						variant="outlined"
						prepend-inner-icon="mdi-magnify"
						clearable
						hide-details
						class="mr-4"
						@update:model-value="handleSearchTyping"
					/>
					<v-select
						v-model="sortBy"
						:items="sortOptions"
						label="Ordina per"
						hide-details
						variant="outlined"
						class="sort-select"
					/>
				</div>
				<p class="text-caption text-medium-emphasis mb-2">
					{{ datasetCountLabel }}
				</p>
			</template>

			<template #supporting>
				<div class="supporting-pane">
					<div v-if="selectedDatasetDetails">
						<p class="text-caption">
							<strong>Keywords</strong>
						</p>
						<ul>
							<li
								v-for="kw in selectedDatasetDetails.keywords ||
								[]"
								:key="
									(kw as any).identifier || (kw as any).name
								"
							>
								{{ (kw as any).name || (kw as any).identifier }}
							</li>
						</ul>
					</div>
					<div v-else class="text-caption text-medium-emphasis">
						Nessun dettaglio selezionato
					</div>
				</div>
			</template>
			<template #list>
				<div
					v-if="filteredAndSortedItems.length === 0"
					class="empty-state"
				>
					<v-icon size="48" class="text-grey-5"
						>mdi-database-off-outline</v-icon
					>
					<p class="mt-4 text-body2">Nessuna risorsa trovata</p>
				</div>

				<div v-else>
					<div
						v-for="group in groupedAndSortedItems"
						:key="group.group"
						class="resource-group"
					>
						<h3 class="group-label">{{ group.label }}</h3>
						<div class="datasets-grid">
							<v-card
								v-for="item in group.items"
								:key="(item as any).pk"
								class="dataset-card"
								:class="{
									'active-card':
										selectedDatasetDetails?.pk ===
										(item as any).pk,
								}"
								@click="selectDataset((item as any).pk)"
							>
								<div class="card-image-wrapper">
									<v-img
										:src="(item as any).thumbnail_url"
										:alt="(item as any).title"
										height="180"
										cover
										class="bg-grey-2"
									>
										<template #placeholder>
											<div
												class="d-flex align-center justify-center h-100 bg-grey-3"
											>
												<v-icon size="48" color="grey-5"
													>mdi-image-off</v-icon
												>
											</div>
										</template>
									</v-img>
								</div>

								<v-card-item class="card-content">
									<v-card-title
										class="text-subtitle2 font-weight-bold line-clamp-2"
									>
										{{ (item as any).title }}
									</v-card-title>

									<v-card-subtitle
										v-if="(item as any).abstract"
										class="text-caption line-clamp-2 mt-2"
									>
										{{ (item as any).abstract }}
									</v-card-subtitle>

									<div
										class="card-footer mt-3 pt-3 border-t d-flex items-center justify-between"
									>
										<div
											class="text-caption text-grey d-flex gap-2 flex-wrap"
										>
											<span
												class="d-flex align-center gap-1"
											>
												<v-icon size="12"
													>mdi-account</v-icon
												>
												{{
													(item as any).owner_username
												}}
											</span>
											<span
												class="d-flex align-center gap-1"
											>
												<v-icon size="12"
													>mdi-eye</v-icon
												>
												{{
													(item as any).popular_count
												}}
											</span>
										</div>
										<div>
											<v-btn
												size="small"
												variant="outlined"
												@click.stop="
													selectDataset(
														(item as any).pk,
													)
												"
												>Visualizza</v-btn
											>
										</div>
									</div>
								</v-card-item>
							</v-card>
						</div>
					</div>
				</div>
			</template>
		</list-detail-layout>
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
	// Cards Section
	.cards-section {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.datasets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
		justify-items: start;
		grid-auto-flow: row;
		gap: 1.5rem;
		padding: 1rem 0;
	}

	.resource-group {
		margin-bottom: 2rem;
	}

	.group-label {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: rgba(0, 0, 0, 0.87);
	}

	@media (max-width: 960px) {
		.datasets-grid {
			grid-template-columns: repeat(auto-fit, minmax(260px, 260px));
			justify-content: start;
			justify-items: start;
		}
	}

	@media (max-width: 620px) {
		.datasets-grid {
			grid-template-columns: 1fr;
			justify-content: stretch;
		}
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
		width: 100%;
		max-width: 320px;
		cursor: pointer;
		transition:
			box-shadow 0.18s ease,
			border-color 0.18s ease;
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
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		max-height: calc(2 * 1.2rem);
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

	.empty-state {
		display: flex;
		flex-direction: column;
		grid-column: center;
		justify-self: center;
		min-height: 300px;
		width: 100%r;
	}

	.page-loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.6);
		z-index: 20;
	}

	.loading-dialog {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.border-t {
		border-top: 1px solid currentColor;
	}
</style>

