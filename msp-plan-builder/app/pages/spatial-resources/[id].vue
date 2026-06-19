<script setup lang="ts">
import ListDetailLayout from "@/components/layouts/ListDetailLayout.vue";
import SpatialDatasetDetailsPanel from "@/components/spatial-resources/SpatialDatasetDetailsPanel.vue";
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
const isOwsChildRoute = computed(() => route.path.endsWith("/ows"));
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

const closeExpandedCard = () => {
	selectedCardPk.value = null;
};
</script>

<template>
	<NuxtPage v-if="isOwsChildRoute" />

	<div v-else class="spatial-resources-container">
		<!-- Header -->
		<div class="pa-6 header-section">
			<div class="spatial-resources-header-bar">
				<p class="text-body2 text-grey">
					Risorse spaziali associate alla mappa
					<strong>{{ associatedMapTitle }}</strong> utilizzata nell'area
					di studio
					<strong>{{ areaTitle }}</strong>
				</p>
				<v-btn
					:to="`/spatial-resources/${mapId}/ows`"
					color="primary"
					variant="outlined"
					prepend-icon="mdi-map-check-outline"
				>
					Apri viewer OWS
				</v-btn>
			</div>
		</div>

		<div class="spatial-resources-stage">
			<list-detail-layout :loading="isLoading">
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

			<transition name="dataset-details-zoom" appear>
				<SpatialDatasetDetailsPanel
					v-if="isDetailsOpen"
					:dataset="selectedDatasetDetails"
					:loading="isLoading"
					@close="closeExpandedCard"
				/>
			</transition>
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

	.spatial-resources-header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.spatial-resources-stage {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.dataset-details-zoom-enter-active,
	.dataset-details-zoom-leave-active {
		transition:
			opacity 0.24s ease,
			transform 0.24s ease;
		transform-origin: center center;
	}

	.dataset-details-zoom-enter-from,
	.dataset-details-zoom-leave-to {
		opacity: 0;
		transform: scale(0.92);
	}

	.dataset-details-zoom-enter-to,
	.dataset-details-zoom-leave-from {
		opacity: 1;
		transform: scale(1);
	}
</style>
