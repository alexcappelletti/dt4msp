<script setup lang="ts">
import type { Dataset, Keyword } from "#/shared/types/geonodeTypes";
import ListDetailLayout from "@/components/layouts/ListDetailLayout.vue";
import SpatialDatasetList from "@/components/spatial-resources/SpatialDatasetList.vue";
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
const { availableSpatialResources, currentlySelectedDataset } =
	storeToRefs(spatialResourceStore);

const mapId = computed(() => String(route.params.id || ""));
const isLoading = ref(false);
const selectedCardPk = ref<string | null>(null);
const searchText = ref("");
const sortBy = ref<"title" | "popular" | "created">("title");
const expandedDescriptionPks = ref<Set<string>>(new Set());

const sortOptions = [
	{ label: "Titolo", value: "title" },
	{ label: "Popolarita", value: "popular" },
	{ label: "Data di creazione", value: "created" },
];

const spatialResourceGroups = computed(() => availableSpatialResources.value);
const selectedDatasetDetails = computed(() => currentlySelectedDataset.value);

const normalizeText = (value?: string | null) => (value ?? "").toLowerCase();
const getKeywordKey = (keyword: Keyword) => keyword.slug || keyword.name;
const getKeywordLabel = (keyword: Keyword) => keyword.name;
const getSelectedDatasetOwner = (dataset: Dataset) =>
	dataset.owner?.username || "";
const formatItalianDate = (date?: string) =>
	date ? new Date(date).toLocaleDateString("it-IT") : "";
const isDetailsOpen = computed(() => Boolean(selectedCardPk.value));
const expandedDescriptionPkList = computed(() =>
	Array.from(expandedDescriptionPks.value),
);

const allItems = computed(() =>
	spatialResourceGroups.value.flatMap((group) => group.items),
);

const datasetCountLabel = computed(() => {
	const count = filteredAndSortedItems.value.length;
	if (count === 0) return "";
	if (count === 1) return "1 layer trovato";
	return `${count} layer trovati`;
});

const loadDatasetsForMap = async (mapIdValue: string) => {
	selectedCardPk.value = null;
	expandedDescriptionPks.value.clear();

	if (!mapIdValue) {
		spatialResourceStore.resetMapDatasets();
		return;
	}

	isLoading.value = true;
	try {
		await spatialResourceStore.loadMapDatasets(mapIdValue);
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

const filteredItems = computed(() => {
	const query = searchText.value.trim().toLowerCase();
	if (!query) {
		return allItems.value;
	}

	return allItems.value.filter(
		(item) =>
			normalizeText(item.title).includes(query) ||
			normalizeText(item.abstract).includes(query) ||
			normalizeText(item.owner_username).includes(query),
	);
});

const filteredAndSortedItems = computed(() => {
	const items = [...filteredItems.value];
	switch (sortBy.value) {
		case "popular":
			return items.sort(
				(a, b) => Number(b.popular_count ?? 0) - Number(a.popular_count ?? 0),
			);
		case "created":
			return items.sort((a, b) => {
				const aDate = new Date(a.created).getTime();
				const bDate = new Date(b.created).getTime();
				return bDate - aDate;
			});
		case "title":
		default:
			return items.sort((a, b) => a.title.localeCompare(b.title, "it"));
	}
});

const groupedAndSortedItems = computed(() => {
	const sorted = filteredAndSortedItems.value;
	const grouped: SpatialResourceGroup[] = [];

	for (const group of spatialResourceGroups.value) {
		const groupItems = sorted.filter((item) =>
			group.items.some((groupItem) => groupItem.pk === item.pk),
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
	() => currentProject.value?.areaOfInterest?.associatedMap?.title || "Mappa",
);
const areaTitle = computed(
	() => currentProject.value?.areaOfInterest?.name || "Area",
);

const selectDataset = async (pk: string) => {
	if (selectedCardPk.value === pk) {
		closeExpandedCard();
		return;
	}

	selectedCardPk.value = pk;
	isLoading.value = true;
	try {
		await spatialResourceStore.selectDataset(pk);
	} finally {
		isLoading.value = false;
	}
};

const updateSearchText = (query: string) => {
	searchText.value = query ?? "";
};

const toggleDescriptionExpansion = (pk: string) => {
	if (expandedDescriptionPks.value.has(pk)) {
		expandedDescriptionPks.value.delete(pk);
		return;
	}

	expandedDescriptionPks.value.add(pk);
};

const isDescriptionExpanded = (pk: string) =>
	expandedDescriptionPks.value.has(pk);

const closeExpandedCard = () => {
	selectedCardPk.value = null;
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

		<transition name="details-page-swap" mode="out-in">
			<section
				v-if="isDetailsOpen"
				key="details"
				class="details-page"
			>
				<div class="details-page-toolbar">
					<v-btn
						prepend-icon="mdi-arrow-left"
						variant="text"
						class="back-button"
						@click="closeExpandedCard"
					>
						Torna ai layer
					</v-btn>
				</div>

				<div
					v-if="selectedDatasetDetails"
					class="details-page-body"
				>
					<div class="details-page-hero">
						<v-img
							:src="selectedDatasetDetails.thumbnail_url"
							:alt="selectedDatasetDetails.title"
							height="320"
							cover
							class="details-page-image bg-grey-2"
						>
							<template #placeholder>
								<div
									class="d-flex align-center justify-center h-100 bg-grey-3"
								>
									<v-icon size="64" color="grey-5">
										mdi-image-off
									</v-icon>
								</div>
							</template>
						</v-img>
					</div>

					<div class="details-page-content">
						<p class="details-page-kicker">Scheda layer</p>
						<h1 class="details-page-title">
							{{ selectedDatasetDetails.title }}
						</h1>
						<p
							v-if="selectedDatasetDetails.abstract"
							class="details-page-abstract"
						>
							{{ selectedDatasetDetails.abstract }}
						</p>

						<div class="details-page-meta">
							<div
								v-if="getSelectedDatasetOwner(selectedDatasetDetails)"
								class="meta-item"
							>
								<v-icon size="18" class="mr-2">mdi-account</v-icon>
								<span>{{ getSelectedDatasetOwner(selectedDatasetDetails) }}</span>
							</div>
							<div
								v-if="selectedDatasetDetails.created"
								class="meta-item"
							>
								<v-icon size="18" class="mr-2">mdi-calendar</v-icon>
								<span>{{ formatItalianDate(selectedDatasetDetails.created) }}</span>
							</div>
							<div class="meta-item">
								<v-icon size="18" class="mr-2">mdi-pound</v-icon>
								<span>{{ selectedDatasetDetails.pk }}</span>
							</div>
						</div>

						<div
							v-if="
								selectedDatasetDetails.keywords &&
								selectedDatasetDetails.keywords.length > 0
							"
							class="details-keywords"
						>
							<p class="keywords-label">Keywords</p>
							<div class="keywords-list">
								<v-chip
									v-for="kw in selectedDatasetDetails.keywords"
									:key="getKeywordKey(kw)"
									size="small"
									class="keyword-chip"
								>
									{{ getKeywordLabel(kw) }}
								</v-chip>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="empty-details-page">
					<v-progress-circular indeterminate color="primary" />
				</div>
			</section>

			<list-detail-layout
				v-else
				key="catalog"
				:loading="isLoading"
			>
				<template #list>
					<SpatialDatasetList
						:groups="groupedAndSortedItems"
						:search-text="searchText"
						:sort-by="sortBy"
						:sort-options="sortOptions"
						:dataset-count-label="datasetCountLabel"
						:expanded-description-pks="expandedDescriptionPkList"
						@update:search-text="updateSearchText"
						@update:sort-by="sortBy = $event"
						@select-dataset="selectDataset"
						@toggle-description="toggleDescriptionExpansion"
					/>
				</template>
			</list-detail-layout>
		</transition>
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
	.details-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 1.5rem;
	}

	.details-page-toolbar {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.back-button {
		align-self: flex-start;
	}

	.details-page-body {
		display: grid;
		grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
		background: rgba(255, 255, 255, 0.75);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 24px;
		padding: 1.5rem;
		backdrop-filter: blur(8px);
		box-shadow: 0 24px 60px rgba(96, 56, 72, 0.12);
	}

	.details-page-image {
		border-radius: 18px;
		overflow: hidden;
	}

	.details-page-content {
		min-width: 0;
	}

	.details-page-kicker {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.5);
	}

	.details-page-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0.35rem 0 1rem;
		line-height: 1.3;
		color: rgba(0, 0, 0, 0.87);
	}

	.details-page-abstract {
		font-size: 1rem;
		line-height: 1.6;
		color: rgba(0, 0, 0, 0.75);
		margin: 0 0 1.5rem 0;
	}

	.details-page-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		font-size: 0.875rem;
		color: rgba(0, 0, 0, 0.65);
		padding: 0.75rem 0.9rem;
		background-color: rgba(255, 255, 255, 0.68);
		border: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 999px;
	}

	.details-keywords {
		margin-top: 1.5rem;
	}

	.keywords-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.87);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.keywords-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.keyword-chip {
		background-color: rgba(var(--v-theme-primary-rgb), 0.1);
		color: rgb(var(--v-theme-primary));
	}

	.empty-details-page {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 320px;
	}

	.details-page-swap-enter-active,
	.details-page-swap-leave-active {
		transition:
			opacity 0.22s ease,
			transform 0.28s cubic-bezier(0.2, 0, 0, 1);
	}

	.details-page-swap-enter-from,
	.details-page-swap-leave-to {
		opacity: 0;
		transform: translateY(14px);
	}

	@media (max-width: 960px) {
		.details-page {
			padding: 1rem;
		}

		.details-page-body {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
	}
</style>
