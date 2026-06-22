<script setup lang="ts">
import type { Dataset, DatasetListItem } from "#/shared/types/geonodeTypes";
import type { MapLayer } from "#/shared/types/msp-project";
import LayerMapView from "@/components/LayerMapView.vue";
import { useLayeredMapStore } from "@/stores/layeredMapStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSpatialResourceStore } from "@/stores/spatialStore";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		modelValue?: MapLayer[];
		title?: string;
		emptyLabel?: string;
		readonly?: boolean;
	}>(),
	{
		modelValue: () => [],
		title: "Risorse spaziali",
		emptyLabel: "Nessun layer disponibile per la mappa associata.",
		readonly: false,
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: MapLayer[]): void;
}>();

const scenarioStore = useScenarioStore();
const spatialResourceStore = useSpatialResourceStore();
const layeredMapStore = useLayeredMapStore();

const { currentProject } = storeToRefs(scenarioStore);
const { availableSpatialResources } = storeToRefs(spatialResourceStore);

const mapId = computed(() =>
	String(currentProject.value?.areaOfInterest?.associatedMap?.pk || ""),
);
const isLoading = ref(false);
const isSyncingMap = ref(false);
const selectedPks = ref<Set<string>>(new Set());
const selectedPkOrder = ref<string[]>([]);
const datasetCache = ref<Record<string, Dataset>>({});
const latestSelectionIntent = ref<Record<string, boolean>>({});
let latestSyncRequestId = 0;
let latestHydratedSignature = "";

const allItems = computed(() =>

	availableSpatialResources.value.flatMap((group) => group.items),
);

const activeItems = computed(() =>
	[...selectedPkOrder.value]
		.reverse()
		.map((pk) => allItems.value.find((item) => item.pk === pk))
		.filter((item): item is DatasetListItem => Boolean(item)),
);

const availableItems = computed(() =>
	allItems.value.filter((item) => !selectedPks.value.has(item.pk)),
);

const selectedLayers = computed(() =>
	selectedPkOrder.value
		.map((pk) => datasetCache.value[pk])
		.filter((dataset): dataset is Dataset => Boolean(dataset)),
);

const resourceKey = (resource: MapLayer) =>
	String(
		resource.id
		?? resource.pk
		?? resource.datasetPk
		?? resource.name
		?? resource.title
		?? "",
	).trim();

const toMapLayerResource = (item: DatasetListItem): MapLayer => ({
	id: item.pk,
	pk: item.pk,
	name: item.title,
	title: item.title,
});

const syncSelectionFromModel = () => {
	// const nextOrder: string[] = [];
	// const nextSet = new Set<string>();

	// for (const resource of props.modelValue ?? []) {
	// 	const key = resourceKey(resource);
	// 	if (!key) continue;

	// 	const match = allItems.value.find(
	// 		(item) =>
	// 			String(item.pk) === key
	// 			|| item.title === key,
	// 	);
	// 	const resolvedPk = match?.pk ?? key;
	// 	if (nextSet.has(resolvedPk)) continue;
	// 	nextSet.add(resolvedPk);
	// 	nextOrder.push(resolvedPk);
	// }

	// selectedPks.value = nextSet;
	// selectedPkOrder.value = nextOrder;
};

const emitModelValue = () => {
	// const nextValue = selectedPkOrder.value
	// 	.map((pk) => allItems.value.find((item) => item.pk === pk))
	// 	.filter((item): item is DatasetListItem => Boolean(item))
	// 	.map(toMapLayerResource);

	// emit("update:modelValue", nextValue);
};

const getSelectionSignature = () => selectedPkOrder.value.join("|");

const hydrateSelectedDatasets = async () => {
	// const nextSignature = getSelectionSignature();
	// if (nextSignature === latestHydratedSignature) {
	// 	return;
	// }

	// const selectedItems = selectedPkOrder.value
	// 	.map((pk) => allItems.value.find((item) => item.pk === pk))
	// 	.filter((item): item is DatasetListItem => Boolean(item));

	// if (selectedItems.length === 0) {
	// 	latestHydratedSignature = "";
	// 	layeredMapStore.resetStore();
	// 	return;
	// }

	// await Promise.all(selectedItems.map((item) => ensureDatasetDetails(item)));
	// latestHydratedSignature = nextSignature;
	// await syncMapLayers();
};

const loadDatasetsForMap = async (mapIdValue: string) => {
	// selectedPks.value = new Set();
	// selectedPkOrder.value = [];
	// datasetCache.value = {};
	// latestHydratedSignature = "";
	// layeredMapStore.resetStore();

	// if (!mapIdValue) {
	// 	spatialResourceStore.resetMapDatasets();
	// 	return;
	// }

	// isLoading.value = true;
	// try {
	// 	await spatialResourceStore.loadMapDatasets(mapIdValue);
	// 	syncSelectionFromModel();
	// 	await hydrateSelectedDatasets();
	// } finally {
	// 	isLoading.value = false;
	// }
};

const ensureDatasetDetails = async (summary: DatasetListItem) => {
	// if (datasetCache.value[summary.pk]) {
	// 	return datasetCache.value[summary.pk]!;
	// }

	// const details = await spatialResourceStore.getDataset(summary.pk);
	// datasetCache.value = {
	// 	...datasetCache.value,
	// 	[summary.pk]: details,
	// };
	// return details;
};

const syncMapLayers = async () => {
	// const requestId = ++latestSyncRequestId;
	// isSyncingMap.value = true;
	// try {
	// 	const layersToSync = selectedLayers.value;

	// 	if (layersToSync.length === 0) {
	// 		layeredMapStore.resetStore();
	// 		return;
	// 	}

	// 	layeredMapStore.setRenderOrder(selectedPkOrder.value);
	// 	await layeredMapStore.fetchOGCLayerData(layersToSync);
	// } finally {
	// 	if (requestId === latestSyncRequestId) {
	// 		isSyncingMap.value = false;
	// 	}
	// }
};

const toggleDataset = async (summary: DatasetListItem, checked: boolean) => {
	// if (props.readonly || !summary.canVisualize) return;

	// latestSelectionIntent.value = {
	// 	...latestSelectionIntent.value,
	// 	[summary.pk]: checked,
	// };

	// const next = new Set(selectedPks.value);
	// const nextOrder = [...selectedPkOrder.value];

	// if (checked) {
	// 	await ensureDatasetDetails(summary);
	// 	if (!latestSelectionIntent.value[summary.pk]) return;
	// 	next.add(summary.pk);
	// 	if (!nextOrder.includes(summary.pk)) {
	// 		nextOrder.push(summary.pk);
	// 	}
	// } else {
	// 	next.delete(summary.pk);
	// 	const nextIndex = nextOrder.indexOf(summary.pk);
	// 	if (nextIndex >= 0) {
	// 		nextOrder.splice(nextIndex, 1);
	// 	}
	// }

	// selectedPks.value = next;
	// selectedPkOrder.value = nextOrder;
	// latestHydratedSignature = "";
	// emitModelValue();
	// await syncMapLayers();
};

// watch(
// 	mapId,
// 	async (newMapId, oldMapId) => {
// 		if (!newMapId || newMapId === oldMapId) return;
// 		await loadDatasetsForMap(newMapId);
// 	},
// 	{ immediate: true },
// );

// watch(
// 	() => props.modelValue,
// 	async () => {
// 		syncSelectionFromModel();
// 		await hydrateSelectedDatasets();
// 	},
// 	{ deep: true },
// );

// watch(
// 	allItems,
// 	async () => {
// 		syncSelectionFromModel();
// 		await hydrateSelectedDatasets();
// 	},
// 	{ deep: true },
// );

onBeforeUnmount(() => {
	//layeredMapStore.resetStore();
});
</script>

<template>
	<section class="tw:flex tw:flex-col tw:gap-4 tw:min-h-0">
		<header class="tw:flex tw:items-start tw:justify-between tw:gap-4">
			<div>
				<p>{{ props.title }}</p>
			</div>
			<v-chip size="small" variant="outlined">
				{{ selectedPkOrder.length }} attivi
			</v-chip>
		</header>

		<div v-if="!mapId" class="scenario-spatial-panel__empty">
			Associare prima una mappa all'area di studio.
		</div>

		<div v-else class="">
			<div class="">
				<LayerMapView class="tw:h-full tw:w-full" />
				<!-- <div
					v-if="isLoading || isSyncingMap"
					class="scenario-spatial-panel__map-loading"
				>
					<v-progress-circular indeterminate color="primary" size="28" />
				</div> -->
			</div>

			<!-- <aside class="scenario-spatial-panel__sidebar">
				<div v-if="allItems.length === 0" class="scenario-spatial-panel__empty">
					{{ props.emptyLabel }}
				</div>

				<div v-else class="scenario-spatial-panel__list">
					<section class="scenario-spatial-panel__group">
						<div class="scenario-spatial-panel__group-header">
							<h4>Layer attivi</h4>
							<v-chip size="x-small" variant="flat">{{ activeItems.length }}</v-chip>
						</div>

						<p v-if="activeItems.length === 0" class="scenario-spatial-panel__group-empty">
							Nessun layer attivo.
						</p>

						<div
							v-for="item in activeItems"
							:key="`active-${item.pk}`"
							class="scenario-spatial-panel__row"
						>
							<div class="scenario-spatial-panel__checkbox">
								<v-checkbox-btn
									:model-value="true"
									:disabled="props.readonly || !item.canVisualize"
									color="primary"
									@update:model-value="toggleDataset(item, Boolean($event))"
								/>
							</div>
							<div class="scenario-spatial-panel__copy">
								<span class="scenario-spatial-panel__title">{{ item.title }}</span>
							</div>
						</div>
					</section>

					<section v-if="!props.readonly" class="scenario-spatial-panel__group">
						<div class="scenario-spatial-panel__group-header">
							<h4>Layer disponibili</h4>
							<v-chip size="x-small" variant="flat">{{ availableItems.length }}</v-chip>
						</div>

						<p
							v-if="availableItems.length === 0"
							class="scenario-spatial-panel__group-empty"
						>
							Nessun layer disponibile.
						</p>

						<div
							v-for="item in availableItems"
							:key="`available-${item.pk}`"
							class="scenario-spatial-panel__row"
						>
							<div class="scenario-spatial-panel__checkbox">
								<v-checkbox-btn
									:model-value="false"
									:disabled="!item.canVisualize"
									color="primary"
									@update:model-value="toggleDataset(item, Boolean($event))"
								/>
							</div>
							<div class="scenario-spatial-panel__copy">
								<span class="scenario-spatial-panel__title">{{ item.title }}</span>
							</div>
						</div>
					</section>
				</div>
			</aside> -->
		</div>
	</section>
</template>

<style scoped lang="scss">
@use "../../assets/scss/abstracts" as *;

.scenario-spatial-panel {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	min-height: 0;
}

.scenario-spatial-panel__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 0.75rem;
	flex-wrap: wrap;

	h3 {
		margin: 0;
		font-size: 1rem;
	}
}

.scenario-spatial-panel__eyebrow {
	margin: 0 0 0.3rem;
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.45);
}

.scenario-spatial-panel__body {
	display: grid;
	grid-template-columns: minmax(0, 1.9fr) minmax(280px, 0.75fr);
	gap: 1rem;
	min-height: 0;
}

.scenario-spatial-panel__map-shell {
	position: relative;
	height: 500px;
	min-height: 500px;
	border-radius: 18px;
	overflow: hidden;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: rgba(255, 255, 255, 0.72);
}

.scenario-spatial-panel__map-loading {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.18);
	backdrop-filter: blur(2px);
	pointer-events: none;
}

.scenario-spatial-panel__sidebar {
	display: flex;
	flex-direction: column;
	min-height: 0;
	padding: 0.9rem;
	border-radius: 18px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: rgba($main-rose-color, 0.2);
}

.scenario-spatial-panel__list {
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
	overflow-y: auto;
	min-height: 0;
}

.scenario-spatial-panel__group {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.scenario-spatial-panel__group-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;

	h4 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
	}
}

.scenario-spatial-panel__group-empty,
.scenario-spatial-panel__empty {
	margin: 0;
	font-size: 0.84rem;
	color: rgba(0, 0, 0, 0.58);
}

.scenario-spatial-panel__row {
	display: flex;
	align-items: flex-start;
	gap: 6px;
	padding: 0.65rem 0.75rem;
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.82);
	border: 1px solid rgba(0, 0, 0, 0.06);
}

.scenario-spatial-panel__checkbox {
	display: flex;
	flex: 0 0 auto;
	align-items: flex-start;
	justify-content: center;
	margin-top: -0.1rem;
}

.scenario-spatial-panel__copy {
	flex: 1 1 auto;
	min-width: 0;
}

.scenario-spatial-panel__title {
	display: block;
	font-size: 0.9rem;
	font-weight: 600;
	line-height: 1.35;
	word-break: break-word;
}

@media (max-width: 960px) {
	.scenario-spatial-panel__body {
		grid-template-columns: 1fr;
	}

	.scenario-spatial-panel__map-shell {
		height: 500px;
		min-height: 500px;
	}
}
</style>
