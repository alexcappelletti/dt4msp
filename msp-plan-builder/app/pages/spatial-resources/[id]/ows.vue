<script setup lang="ts">
import type { Dataset, DatasetListItem } from "#/shared/types/geonodeTypes";
import LayerMapView from "@/components/LayerMapView.vue";
import { useLayeredMapStore } from "@/stores/layeredMapStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSpatialResourceStore } from "@/stores/spatialStore";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const scenarioStore = useScenarioStore();
const spatialResourceStore = useSpatialResourceStore();
const layeredMapStore = useLayeredMapStore();

const { currentProject } = storeToRefs(scenarioStore);
const { availableSpatialResources } = storeToRefs(spatialResourceStore);

const mapId = computed(() => String(route.params.id || ""));
const isLoading = ref(false);
const isSyncingMap = ref(false);
const selectedPks = ref<Set<string>>(new Set());
const selectedPkOrder = ref<string[]>([]);
const datasetCache = ref<Record<string, Dataset>>({});
const latestSelectionIntent = ref<Record<string, boolean>>({});
let latestSyncRequestId = 0;
const draggedPk = ref<string | null>(null);

const associatedMapTitle = computed(
	() => currentProject.value?.areaOfInterest?.associatedMap?.title || "Mappa",
);

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

const loadDatasetsForMap = async (mapIdValue: string) => {
	selectedPks.value = new Set();
	selectedPkOrder.value = [];
	datasetCache.value = {};
	layeredMapStore.resetStore();

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

const ensureDatasetDetails = async (summary: DatasetListItem) => {
	if (datasetCache.value[summary.pk]) {
		return datasetCache.value[summary.pk]!;
	}

	const details = await spatialResourceStore.getDataset(summary.pk);
	datasetCache.value = {
		...datasetCache.value,
		[summary.pk]: details,
	};
	return details;
};

const syncMapLayers = async () => {
	const requestId = ++latestSyncRequestId;
	isSyncingMap.value = true;
	try {
		const layersToSync = selectedLayers.value;

		if (layersToSync.length === 0) {
			layeredMapStore.resetStore();
			return;
		}

		layeredMapStore.setRenderOrder(selectedPkOrder.value);
		await layeredMapStore.fetchOGCLayerData(layersToSync);
	} finally {
		if (requestId === latestSyncRequestId) {
			isSyncingMap.value = false;
		}
	}
};

const toggleDataset = async (summary: DatasetListItem, checked: boolean) => {
	if (!summary.canVisualize) return;
	latestSelectionIntent.value = {
		...latestSelectionIntent.value,
		[summary.pk]: checked,
	};

	const next = new Set(selectedPks.value);
	const nextOrder = [...selectedPkOrder.value];
	if (checked) {
		await ensureDatasetDetails(summary);
		if (!latestSelectionIntent.value[summary.pk]) {
			return;
		}
		next.add(summary.pk);
		if (!nextOrder.includes(summary.pk)) {
			nextOrder.push(summary.pk);
		}
	} else {
		next.delete(summary.pk);
		const nextIndex = nextOrder.indexOf(summary.pk);
		if (nextIndex >= 0) {
			nextOrder.splice(nextIndex, 1);
		}
	}

	selectedPks.value = next;
	selectedPkOrder.value = nextOrder;
	await syncMapLayers();
};

const isDatasetSelected = (pk: string) => selectedPks.value.has(pk);

const onDragStart = (event: DragEvent, pk: string) => {
	draggedPk.value = pk;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", pk);
	}
};

const onDragOver = (event: DragEvent) => {
	event.preventDefault();
};

const onDrop = async (targetPk: string) => {
	const sourcePk = draggedPk.value;
	draggedPk.value = null;
	if (!sourcePk || sourcePk === targetPk) return;

	const nextVisualOrder = [...selectedPkOrder.value].reverse();
	const fromIndex = nextVisualOrder.indexOf(sourcePk);
	const toIndex = nextVisualOrder.indexOf(targetPk);
	if (fromIndex < 0 || toIndex < 0) return;

	nextVisualOrder.splice(fromIndex, 1);
	nextVisualOrder.splice(toIndex, 0, sourcePk);

	const nextOrder = [...nextVisualOrder].reverse();
	selectedPkOrder.value = nextOrder;
	layeredMapStore.setRenderOrder(nextOrder);
};

const onDragEnd = () => {
	draggedPk.value = null;
};

watch(
	mapId,
	async (newMapId, oldMapId) => {
		if (!newMapId || newMapId === oldMapId) return;
		await loadDatasetsForMap(newMapId);
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	layeredMapStore.resetStore();
});
</script>

<template>
	<div class="ows-browser-page">
		<header class="ows-browser-page__header">
			<div>
				<p class="ows-browser-page__eyebrow">OWS Viewer</p>
				<h1>Layer attivabili su {{ associatedMapTitle }}</h1>
			</div>
		</header>

		<div class="ows-browser-page__layout">
			<section class="ows-browser-page__map-panel">
				<div class="ows-browser-page__map-shell">
					<LayerMapView />
					<div v-if="isLoading || isSyncingMap" class="ows-browser-page__map-loading">
						<v-progress-circular indeterminate color="primary" />
					</div>
				</div>
			</section>

			<aside class="ows-browser-page__sidebar">
				<div class="ows-browser-page__sidebar-header">
					<h2>Dataset</h2>
					<v-chip size="small" variant="outlined">
						{{ selectedLayers.length }} attivi
					</v-chip>
				</div>

				<div v-if="allItems.length === 0" class="ows-browser-page__empty">
					Nessun dataset disponibile per questa mappa.
				</div>

				<div v-else class="ows-browser-page__dataset-list">
					<section class="ows-browser-page__dataset-group">
						<div class="ows-browser-page__dataset-group-header">
							<h3>Layer attivi</h3>
							<v-chip size="x-small" variant="flat">{{ activeItems.length }}</v-chip>
						</div>

						<p v-if="activeItems.length === 0" class="ows-browser-page__group-empty">
							Nessun layer attivo.
						</p>

						<div
							v-for="item in activeItems"
							:key="`active-${item.pk}`"
							class="ows-browser-page__dataset-row"
							:class="{
								'ows-browser-page__dataset-row--disabled': !item.canVisualize,
								'ows-browser-page__dataset-row--dragging': draggedPk === item.pk,
							}"
							draggable="true"
							@dragstart="onDragStart($event, item.pk)"
							@dragover="onDragOver"
							@drop="onDrop(item.pk)"
							@dragend="onDragEnd"
						>
							<div class="ows-browser-page__drag-handle" aria-hidden="true">
								<v-icon size="16">mdi-drag</v-icon>
							</div>
							<div class="ows-browser-page__dataset-checkbox">
								<v-checkbox-btn
									v-if="item.canVisualize"
									:model-value="true"
									:disabled="!item.canVisualize"
									color="primary"
									@update:model-value="toggleDataset(item, Boolean($event))"
								/>
							</div>

							<div class="ows-browser-page__dataset-copy">
								<span class="ows-browser-page__dataset-title">{{ item.title }}</span>
							</div>
						</div>
					</section>

					<section class="ows-browser-page__dataset-group">
						<div class="ows-browser-page__dataset-group-header">
							<h3>Layer disponibili</h3>
							<v-chip size="x-small" variant="flat">{{ availableItems.length }}</v-chip>
						</div>

						<p v-if="availableItems.length === 0" class="ows-browser-page__group-empty">
							Nessun layer disponibile.
						</p>

						<div
							v-for="item in availableItems"
							:key="`available-${item.pk}`"
							class="ows-browser-page__dataset-row"
							:class="{ 'ows-browser-page__dataset-row--disabled': !item.canVisualize }"
						>
							<div class="ows-browser-page__dataset-checkbox">
								<v-checkbox-btn
									v-if="item.canVisualize"
									:model-value="false"
									:disabled="!item.canVisualize"
									color="primary"
									@update:model-value="toggleDataset(item, Boolean($event))"
								/>
							</div>

							<div class="ows-browser-page__dataset-copy">
								<span class="ows-browser-page__dataset-title">{{ item.title }}</span>
							</div>
						</div>
					</section>
				</div>
			</aside>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "../../../assets/scss/abstracts" as *;

.ows-browser-page {
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	height: 100%;
	min-height: 0;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba($main-rose-color, 0.92));
}

.ows-browser-page__header {
	padding: 0.85rem 1rem 0.5rem;

	h1 {
		margin: 0;
		font-size: 1.6rem;
		line-height: 1.2;
	}

	p {
		margin: 0.35rem 0 0;
		color: rgba(0, 0, 0, 0.68);
	}
}

.ows-browser-page__eyebrow {
	margin: 0 0 0.4rem;
	font-size: 0.76rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.45);
}

.ows-browser-page__layout {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
	position: relative;
	padding: 0 1rem 1rem;
}

.ows-browser-page__map-panel {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
}

.ows-browser-page__map-shell {
	position: relative;
	flex: 1 1 auto;
	min-height: clamp(34rem, 72dvh, 100%);
	border-radius: 20px;
	overflow: hidden;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: rgba(255, 255, 255, 0.72);
}

.ows-browser-page__map-loading {
	position: absolute;
	inset: 0;
	z-index: 4;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.18);
	backdrop-filter: blur(2px);
	pointer-events: none;
}

.ows-browser-page__sidebar {
	position: absolute;
	top: 1rem;
	right: 1rem;
	z-index: 5;
	width: min(360px, 92%);
	max-height: calc(100% - 2rem);
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	border-radius: 20px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: rgba($main-rose-color, 0.92);
	box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
	overflow: hidden;
}

.ows-browser-page__sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;

	h2 {
		margin: 0;
		font-size: 1rem;
	}
}

.ows-browser-page__empty {
	padding: 1rem 0.25rem;
	color: rgba(0, 0, 0, 0.58);
}

.ows-browser-page__dataset-list {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
	flex-direction: column;
	gap: 0.9rem;
	overflow-y: auto;
	padding-right: 0.2rem;
}

.ows-browser-page__dataset-group {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
}

.ows-browser-page__dataset-group-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;

	h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.72);
	}
}

.ows-browser-page__group-empty {
	margin: 0;
	padding: 0.25rem 0.15rem;
	font-size: 0.82rem;
	color: rgba(0, 0, 0, 0.55);
}

.ows-browser-page__dataset-row {
	display: flex;
	align-items: flex-start;
	gap: 6px;
	padding: 0.7rem 0.8rem;
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.78);
	border: 1px solid rgba(0, 0, 0, 0.06);
	cursor: pointer;
	transition:
		background-color 0.18s ease,
		border-color 0.18s ease;

	&:hover {
		background: rgba($selection-light-color, 0.92);
		border-color: rgba(0, 0, 0, 0.1);
	}
}

.ows-browser-page__dataset-row--dragging {
	opacity: 0.55;
}

.ows-browser-page__drag-handle {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 0 0 auto;
	padding-top: 0.3rem;
	color: rgba(0, 0, 0, 0.42);
	cursor: grab;
}

.ows-browser-page__dataset-checkbox {
	display: flex;
	flex: 0 0 auto;
	align-items: flex-start;
	justify-content: center;
	align-self: flex-start;
	padding-top: 0;
	margin-top: -0.1rem;
}

.ows-browser-page__dataset-row--disabled {
	cursor: default;
	opacity: 0.62;

	&:hover {
		background: rgba(255, 255, 255, 0.78);
		border-color: rgba(0, 0, 0, 0.06);
	}
}

.ows-browser-page__dataset-copy {
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	gap: 0.18rem;
	min-width: 0;
}

.ows-browser-page__dataset-title {
	display: block;
	font-size: 0.92rem;
	font-weight: 600;
	line-height: 1.35;
	white-space: normal;
	word-break: break-word;
	color: rgba(0, 0, 0, 0.84);
}

.ows-browser-page__dataset-meta {
	font-size: 0.76rem;
	color: rgba(0, 0, 0, 0.56);
}

@media (max-width: 1024px) {
	.ows-browser-page__sidebar {
		position: relative;
		top: auto;
		right: auto;
		width: 100%;
		max-height: none;
		box-shadow: none;
		margin-top: 1rem;
	}

	.ows-browser-page__layout {
		display: flex;
		flex-direction: column;
	}

	.ows-browser-page__map-shell {
		min-height: 60dvh;
	}
}
</style>
