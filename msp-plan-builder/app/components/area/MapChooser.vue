<script setup lang="ts">
import type { GeonodeMap } from "#/shared/types/geonodeTypes";
import type { GeonodeMapReference } from "#/shared/types/msp-project";
import { useSpatialResourceStore } from "@/stores/spatialStore";
import { computed, onMounted, ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		selectedGeonodeMap?: GeonodeMapReference | null;
		title?: string;
		description?: string;
	}>(),
	{
		selectedGeonodeMap: null,
		title: "Mappa associata all'area",
		description:
			"Scegli la mappa GeoNode da associare all'area di studio.",
	},
);

const emit = defineEmits<{
	(e: "update:selectedGeonodeMap", value: GeonodeMapReference | null): void;
	(e: "open-details", item: GeonodeMap): void;
	(e: "close"): void;
}>();

const mapStore = useSpatialResourceStore();
const searchText = ref("");
const sortBy = ref<"date_desc" | "popular_desc" | "title_asc" | "title_desc">(
	"date_desc",
);
const selectedMap = ref<GeonodeMap | null>(null);
const showSwitchConfirmDialog = ref(false);
const confirmSwitchText = ref("");
const pendingSelection = ref<GeonodeMap | null>(null);

const sortOptions = [
	{ title: "Data piu recente", value: "date_desc" },
	{ title: "Piu viste", value: "popular_desc" },
	{ title: "Titolo A-Z", value: "title_asc" },
	{ title: "Titolo Z-A", value: "title_desc" },
] as const;
const skeletonCards = Array.from({ length: 6 }, (_, index) => index);

const isLoading = computed(() => mapStore.busy);

const filteredMaps = computed(() => {
	const query = searchText.value.trim().toLowerCase();
	const base = mapStore.availableMaps.filter((item) => {
		if (!query) return true;
		return (
			item.title.toLowerCase().includes(query) ||
			(item.abstract || "").toLowerCase().includes(query) ||
			item.owner_username.toLowerCase().includes(query)
		);
	});

	const sorted = [...base];
	switch (sortBy.value) {
		case "title_asc":
			sorted.sort((a, b) => a.title.localeCompare(b.title, "it-IT"));
			break;
		case "title_desc":
			sorted.sort((a, b) => b.title.localeCompare(a.title, "it-IT"));
			break;
		case "popular_desc":
			sorted.sort(
				(a, b) => Number(b.popular_count || 0) - Number(a.popular_count || 0),
			);
			break;
		case "date_desc":
		default:
			sorted.sort(
				(a, b) =>
					new Date(b.created).getTime() - new Date(a.created).getTime(),
			);
			break;
	}

	return sorted;
});

const resultCountLabel = computed(() => {
	const count = filteredMaps.value.length;
	if (count === 0) return "Nessuna mappa trovata";
	if (count === 1) return "1 mappa trovata";
	return `${count} mappe trovate`;
});

const currentMap = computed(() => {
	if (selectedMap.value) return selectedMap.value;
	if (!props.selectedGeonodeMap?.pk) return null;
	return (
		mapStore.availableMaps.find(
			(item) => String(item.pk) === String(props.selectedGeonodeMap?.pk),
		) || null
	);
});

const confirmTargetTitle = computed(() => pendingSelection.value?.title ?? "");
const canConfirmSwitch = computed(
	() => confirmSwitchText.value.trim() === confirmTargetTitle.value,
);

const formatDate = (dateValue: string) => {
	if (!dateValue) return "-";
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return "-";
	return new Intl.DateTimeFormat("it-IT", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(parsed);
};
const abstract = (item: GeonodeMap) => {
	const noDescription = "Nessuna descrizione disponibile.";
	const cleaned = (item.abstract || "").replace(/<[^>]*>/g, "").trim();

	if (!cleaned || cleaned === item.title) {
		return noDescription;
	}
	return cleaned;
};

const toGeonodeMapReference = (
	item: GeonodeMap,
): GeonodeMapReference => ({
	pk: item.pk,
	title: item.title,
	detailUrl: item.detail_url,
	thumbnailUrl: item.thumbnail_url,
});

const emitSelection = (item: GeonodeMap) => {
	selectedMap.value = item;
	emit("update:selectedGeonodeMap", toGeonodeMapReference(item));
};

const closeSwitchDialog = () => {
	showSwitchConfirmDialog.value = false;
	confirmSwitchText.value = "";
	pendingSelection.value = null;
};

const requestSelection = (item: GeonodeMap) => {
	if (
		!props.selectedGeonodeMap?.pk ||
		String(props.selectedGeonodeMap.pk) === String(item.pk)
	) {
		emitSelection(item);
		return;
	}

	pendingSelection.value = item;
	confirmSwitchText.value = "";
	showSwitchConfirmDialog.value = true;
};

const confirmSelectionSwitch = () => {
	if (!pendingSelection.value || !canConfirmSwitch.value) return;
	emitSelection(pendingSelection.value);
	closeSwitchDialog();
};

const openDetails = (item: GeonodeMap) => {
	emit("open-details", item);
};

const isActiveMap = (item: GeonodeMap) => {
	const activePk = props.selectedGeonodeMap?.pk ?? selectedMap.value?.pk;
	if (!activePk) return false;
	return String(item.pk) === String(activePk);
};

onMounted(async () => {
	if (mapStore.availableMaps.length === 0) {
		await mapStore.loadMaps();
	}

	if (props.selectedGeonodeMap?.pk) {
		const found = mapStore.availableMaps.find(
			(item) => String(item.pk) === String(props.selectedGeonodeMap?.pk),
		);
		if (found) {
			selectedMap.value = found;
		}
	}
});

watch(
	() => props.selectedGeonodeMap?.pk,
	(pk) => {
		if (!pk) {
			selectedMap.value = null;
			return;
		}

		const found = mapStore.availableMaps.find(
			(item) => String(item.pk) === String(pk),
		);
		if (found) {
			selectedMap.value = found;
		}
	},
);
</script>

<template>
	<div class="component-panel tw:p-4">
		<div class="header tw:mb-4">
			<div class="map-chooser__header-row">
				<div class="map-chooser__header-copy">
					<p class="map-chooser-title">{{ props.title }}</p>
					<p class="map-chooser__description">{{ props.description }}</p>
				</div>
				<v-btn
					variant="text"
					prepend-icon="mdi-close"
					@click="emit('close')"
				>
					Chiudi
				</v-btn>
			</div>
		</div>
		<div v-if="currentMap" class="map-chooser-info">
			<div class="map-chooser__selection-content">
				<strong>{{ currentMap.title }}</strong>
				<span>{{ abstract(currentMap) }}</span>
			</div>
		</div>


		

		 <div class="map-chooser__toolbar">
			<v-text-field v-model="searchText" label="Filtra mappe" variant="outlined" density="compact" hide-details
				clearable class="map-chooser__search" />

			<div class="map-chooser__toolbar-meta">
				<span class="map-chooser__count">
					<v-icon size="16">mdi-map-search-outline</v-icon>
					{{ resultCountLabel }}
				</span>

				<v-menu location="bottom end">
					<template #activator="{ props: menuProps }">
						<v-btn v-bind="menuProps" variant="text" size="large" icon="mdi-sort-variant"
							aria-label="Ordina mappe" />
					</template>
					<v-list density="compact">
						<v-list-item v-for="option in sortOptions" :key="option.value" :title="option.title"
							:active="sortBy === option.value" @click="sortBy = option.value" />
					</v-list>
				</v-menu>
			</div>
		</div>
	
		<div v-if="mapStore.error" class="map-chooser__error">
			Errore caricamento mappe: {{ mapStore.error?.message }}
			<v-btn size="x-small" variant="text" class="tw:ml-2" @click="mapStore.loadMaps()">
				Riprova
			</v-btn>
		</div>

		<div class="map-chooser__cards">
			<div v-if="isLoading" class="map-card-grid">
				<div v-for="card in skeletonCards" :key="card" class="map-card-skeleton">
					<v-skeleton-loader type="image" class="map-card-skeleton__image" />
					<div class="map-card-skeleton__body">
						<v-skeleton-loader type="heading" class="map-card-skeleton__heading" />
						<v-skeleton-loader type="text" class="map-card-skeleton__text" />
						<v-skeleton-loader type="text" class="map-card-skeleton__text map-card-skeleton__text--short" />
					</div>
				</div>
			</div>

			<div v-else-if="filteredMaps.length === 0" class="map-chooser__empty">
				<v-icon size="42" color="grey">mdi-map-off</v-icon>
				<p>Nessuna mappa trovata.</p>
			</div>

			<div v-else class="map-card-grid">
				<article
					v-for="item in filteredMaps"
					:key="item.pk"
					class="map-card"
					:class="{ 'map-card--selected': isActiveMap(item) }"
					role="button"
					tabindex="0"
					@click="openDetails(item)"
					@keydown.enter.prevent="openDetails(item)"
					@keydown.space.prevent="openDetails(item)"
				>
					<div class="map-card__image">
						<div v-if="!isActiveMap(item)" class="map-card__action">
							<v-btn
								size="small"
								variant="flat"
								icon="mdi-map-plus"
								:aria-label="isActiveMap(item) ? 'Mappa selezionata' : 'Seleziona mappa'"
								@click.stop="requestSelection(item)"
							/>
						</div>
						<v-img :src="item.thumbnail_url" :alt="item.title" aspect-ratio="1.4" cover
							class="map-card__image-inner">
							<template #placeholder>
								<div class="map-card__placeholder">no image</div>
							</template>
						</v-img>
						<div class="map-card__badge">
							<v-icon size="14">mdi-map-outline</v-icon>
							<span>{{ formatDate(item.created) }}</span>
						</div>
					</div>

					<div class="map-card__body">
						<h3 class="map-card__title">{{ item.title }}</h3>
						<p class="map-card__description">
							{{ abstract(item) }}
						</p>

						<div class="map-card__meta">
							<span>
								<v-icon size="14">mdi-account</v-icon>
								{{ item.owner_username }}
							</span>
							<span>
								<v-icon size="14">mdi-eye-outline</v-icon>
								{{ item.popular_count }}
							</span>
						</div>
					</div>
				</article>
			</div>
		</div>

		<div v-if="mapStore.hasMoreMaps" class="map-chooser__more">
			<v-btn variant="outlined" :loading="mapStore.busy" :disabled="mapStore.busy" @click="mapStore.loadMoreMaps">
				Carica altre mappe
			</v-btn>
		</div>

		<v-dialog v-model="showSwitchConfirmDialog" max-width="560">
			<v-card class="map-switch-dialog">
				<v-card-title class="map-switch-dialog__title">
					Conferma sostituzione mappa
				</v-card-title>
				<v-card-text class="map-switch-dialog__content">
					<p>
						Esiste gia una mappa associata all'area:
						<strong>{{ props.selectedGeonodeMap?.title }}</strong>.
					</p>
					<p>
						Per sostituirla con
						<strong>{{ confirmTargetTitle }}</strong>,
						scrivi esattamente il nome della nuova mappa nel campo qui sotto.
					</p>

					<v-text-field
						v-model="confirmSwitchText"
						:label="`Scrivi: ${confirmTargetTitle}`"
						variant="outlined"
						autofocus
						hide-details="auto"
					/>
				</v-card-text>
				<v-card-actions class="map-switch-dialog__actions">
					<v-spacer />
					<v-btn variant="text" @click="closeSwitchDialog">
						Annulla
					</v-btn>
					<v-btn
						color="primary"
						variant="flat"
						:disabled="!canConfirmSwitch"
						@click="confirmSelectionSwitch"
					>
						Conferma modifica
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<div v-if="$slots.default" class="map-chooser__details-overlay">
			<slot />
		</div>
	</div>
	
</template>

<style scoped lang="scss">
@use "../../assets/scss/abstracts" as *;

.component-panel {
	background-color: transparent;
	width: 100%;
	height: 100%;
	max-height: 100%;
	min-width: 0;
	min-height: 0;
	display: flex;
	flex-direction: column;
	position: relative;
}



.map-chooser__intro {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.map-chooser-title {
	margin: 0;
	font-size: 1rem;
	font-weight: 700;
	color: $main-dark-rose-color;
}

.map-chooser__header-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
}

.map-chooser__header-copy {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.map-chooser__description {
	margin: 0;
	font-size: 0.925rem;
	line-height: 1.45;
	color: rgba(0, 0, 0, 0.62);
}

.map-chooser__toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
}

.map-chooser__search {
	flex: 1 1 320px;
}

.map-chooser__toolbar-meta {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.map-chooser__count {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.875rem;
	color: rgba(0, 0, 0, 0.65);
}

.map-chooser__error {
	font-size: 0.875rem;
	color: rgb(var(--v-theme-error));
	background: rgba(var(--v-theme-error), 0.08);
	border: 1px solid rgba(var(--v-theme-error), 0.3);
	border-radius: 12px;
	padding: 0.75rem 1rem;
	margin-top: auto;
}

.map-chooser__cards {
	flex: 1 1 auto;
	min-height: 0;
	overflow-y: auto;
	padding-right: 0.35rem;
}

.map-card-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
	gap: 1rem;
	align-items: stretch;
	justify-items: center;
}

.map-card-skeleton {
	width: 100%;
	max-width: none;
	border: 1px solid rgba(var(--v-theme-primary), 0.08);
	border-radius: 5px;
	overflow: hidden;
	background: 
		linear-gradient(180deg, 
			rgba($main-dark-rose-color, 0.22), 
			rgba($main-rose-color, 0.42));
}

.map-card-skeleton__image {
	:deep(.v-skeleton-loader) {
		background: rgba($main-rose-color, 0.12);
	}

	:deep(.v-skeleton-loader__bone) {
		background: rgba($main-dark-rose-color, 0.3);
	}

	:deep(.v-skeleton-loader__bone::after) {
		background: linear-gradient(
			90deg,
			rgba($main-light-rose-color, 0),
			rgba(255, 255, 255, 0.42),
			rgba($main-light-rose-color, 0)
		);
		animation: map-card-skeleton-wave 1.6s ease-in-out infinite;
	}

	:deep(.v-skeleton-loader__image) {
		height: 200px;
		background: rgba($main-dark-rose-color, 0.3);
	}
}

.map-card-skeleton__body {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;

	:deep(.v-skeleton-loader) {
		background: transparent;
	}

	:deep(.v-skeleton-loader__bone) {
		background: rgba($main-dark-rose-color, 0.22);
	}

	:deep(.v-skeleton-loader__bone::after) {
		background: linear-gradient(
			90deg,
			rgba($main-light-rose-color, 0),
			rgba(255, 255, 255, 0.32),
			rgba($main-light-rose-color, 0)
		);
		animation: map-card-skeleton-wave 1.6s ease-in-out infinite;
	}

	:deep(.v-skeleton-loader__heading),
	:deep(.v-skeleton-loader__text),
	:deep(.v-skeleton-loader__ossein) {
		background: rgba($main-dark-rose-color, 0.22);
	}

	:deep(.v-skeleton-loader__heading) {
		width: 60%;
		height: 20px;
		margin: 0;
	}

	:deep(.v-skeleton-loader__text) {
		height: 14px;
		width: 100%;
		margin: 0;
	}
}

.map-card-skeleton__text--short {
	:deep(.v-skeleton-loader__text) {
		width: 72%;
	}
}

@keyframes map-card-skeleton-wave {
	0% {
		transform: translateX(-100%);
	}

	100% {
		transform: translateX(100%);
	}
}

.map-card {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: clamp(240px, 28vw, 360px);
	min-width: 0;
	padding: 0;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 0.6rem;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 244, 245, 0.98));
	overflow: hidden;
	text-align: left;
	cursor: pointer;
	transition:
		filter 0.18s ease,
		border-color 0.18s ease;
	outline: none;

	&:hover {
		filter: brightness(0.97);
	}

	&:focus-visible {
		filter: brightness(0.97);
	}
}

.map-card--selected {
	border-color: rgba(var(--v-theme-primary-rgb), 0.5);
	background:$selection-light-color;
}

.map-card__image {
	position: relative;
}

.map-card__action {
	position: absolute;
	top: 0.75rem;
	right: 0.75rem;
	z-index: 2;
}

.map-card__image-inner {
	background: linear-gradient(135deg, #e8edf2 0%, #d3dde7 100%);
}

.map-card__placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	color: rgba(0, 0, 0, 0.45);
}

.map-card__badge {
	position: absolute;
	left: 0.75rem;
	bottom: 0.75rem;
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.35rem 0.55rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.88);
	backdrop-filter: blur(6px);
	font-size: 0.75rem;
	color: rgba(0, 0, 0, 0.7);
}

.map-card__body {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 0.75rem;
	padding: 1rem;
}

.map-card__title {
	margin: 0;
	font-size: 1rem;
	font-weight: 700;
	line-height: 1.3;
	color: #1f5f96;
}

.map-card__description {
	margin: 0;
	font-size: 0.875rem;
	line-height: 1.5;
	color: rgba(0, 0, 0, 0.68);
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.map-card__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	padding-top: 0.75rem;
	border-top: 1px solid rgba(0, 0, 0, 0.08);
	font-size: 0.8rem;
	color: rgba(0, 0, 0, 0.62);

	span {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
}

.map-chooser__empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-height: 240px;
	color: rgba(0, 0, 0, 0.52);
	border: 1px dashed rgba(0, 0, 0, 0.16);
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.45);
}

.map-chooser__more {
	display: flex;
	justify-content: center;
}

.map-chooser__details-overlay {
	position: absolute;
	inset: 0;
	z-index: 6;
	pointer-events: none;
}

.map-chooser__details-overlay > * {
	pointer-events: auto;
}

.map-chooser-info {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	padding: 1rem 1.1rem;
	background: $main-light-rose-color;
	border: 1px solid $main-rose-color;
}

.selection-label {
	margin: 0;
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(0, 0, 0, 0.48);
}

.map-chooser__selection-content {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;

	strong {
		font-size: 0.95rem;
		color: rgba(0, 0, 0, 0.82);
	}

	span {
		font-size: 0.85rem;
		line-height: 1.45;
		color: rgba(0, 0, 0, 0.62);
	}
}

.map-switch-dialog__title {
	font-weight: 700;
	color: $main-dark-rose-color;
}

.map-switch-dialog__content {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;

	p {
		margin: 0;
		line-height: 1.5;
		color: rgba(0, 0, 0, 0.72);
	}
}

.map-switch-dialog__actions {
	padding: 0 1.5rem 1.25rem;
}

@media (max-width: 959px) {
	.map-card,
	.map-card-skeleton {
		max-width: clamp(220px, 42vw, 320px);
	}
}

@media (max-width: 640px) {
	.map-card-grid {
		grid-template-columns: 1fr;
		justify-items: stretch;
	}

	.map-chooser__toolbar {
		align-items: stretch;
	}

	.map-chooser__toolbar-meta {
		justify-content: space-between;
	}

	.map-card,
	.map-card-skeleton {
		max-width: none;
	}
}
</style>
