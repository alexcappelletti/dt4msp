<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { GeonodeMapListItem } from '#/shared/types/geonodeTypes';
import type { AssociatedMapRef } from '#/shared/types/msp-project';
import { useSpatialResourceStore } from '@/stores/spatialStore';
import MapListLayout from '#/app/components/layouts/MapListLayout.vue';

const props = defineProps<{
	modelValue?: AssociatedMapRef | null;
}>();
const emit = defineEmits<{
	(e: 'update:modelValue', value: AssociatedMapRef | null): void;
}>();

const mapStore = useSpatialResourceStore();
const selectedMap = ref<GeonodeMapListItem | null>(null);
const searchText = ref<string | null>('');
const sortBy = ref<'date_desc' | 'popular_desc' | 'title_asc' | 'title_desc'>('date_desc');
const isLoading = computed(() => mapStore.busy);

const sortOptions = [
	{ title: 'Data piu recente', value: 'date_desc' },
	{ title: 'Piu viste', value: 'popular_desc' },
	{ title: 'Titolo A-Z', value: 'title_asc' },
	{ title: 'Titolo Z-A', value: 'title_desc' },
];

const filteredLayers = computed(() => {
	const query = (searchText.value ?? '').trim().toLowerCase();
	const base = mapStore.availableMaps.filter((item) =>
		!query
		|| item.title.toLowerCase().includes(query)
		|| (item.abstract || '').toLowerCase().includes(query)
		|| item.owner_username.toLowerCase().includes(query),
	);
	const sorted = [...base];
	if (sortBy.value === 'title_asc') {
		sorted.sort((a, b) => a.title.localeCompare(b.title, 'it-IT'));
	} else if (sortBy.value === 'title_desc') {
		sorted.sort((a, b) => b.title.localeCompare(a.title, 'it-IT'));
	} else if (sortBy.value === 'popular_desc') {
		sorted.sort((a, b) => Number(b.popular_count || 0) - Number(a.popular_count || 0));
	} else {
		sorted.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
	}
	return sorted;
});

const resultCountLabel = computed(() => {
	const n = filteredLayers.value.length;
	if (n === 0) return 'Nessuna mappa trovata';
	return n === 1 ? '1 Mappa trovata' : `${n} Mappe trovate`;
});
const associatedMapLabel = computed(() => props.modelValue?.title || '');
const currentMap = computed(() => {
	if (selectedMap.value) return selectedMap.value;
	if (!props.modelValue?.pk) return null;
	return mapStore.availableMaps.find((item) => item.pk === props.modelValue?.pk) || null;
});

const formatDate = (dateValue: string) => {
	if (!dateValue) return '-';
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return '-';
	return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const selectMap = (item: GeonodeMapListItem) => {
	selectedMap.value = item;
	emit('update:modelValue', {
		pk: item.pk,
		title: item.title,
		detailUrl: item.detail_url,
		thumbnailUrl: item.thumbnail_url,
	});
};

const isActiveMap = (item: GeonodeMapListItem): boolean => {
	const activePk = props.modelValue?.pk ?? selectedMap.value?.pk;
	if (!activePk) return false;
	return String(item.pk) === String(activePk);
};

onMounted(async () => {
	if (mapStore.availableMaps.length === 0) {
		await mapStore.loadMaps();
	}
	if (mapStore.availableMaps.length > 0) {
		const fromArea = props.modelValue?.pk
			? mapStore.availableMaps.find((item) => item.pk === props.modelValue?.pk)
			: null;
		if (fromArea) {
			selectedMap.value = fromArea;
			return;
		}
		if (!props.modelValue?.pk) {
			selectMap(mapStore.availableMaps[0]);
		}
	}
});

watch(
	() => props.modelValue?.pk,
	(pk) => {
		if (!pk) {
			selectedMap.value = null;
			return;
		}
		const found = mapStore.availableMaps.find((item) => item.pk === pk);
		if (found) {
			selectedMap.value = found;
		}
	},
);
</script>

<template>
	<div class="tw:flex tw:flex-col tw:gap-2 tw:h-full">
		<v-text-field
			:model-value="associatedMapLabel"
			class="tw:py-6 px-4"
			label="Mappa associata all'area"
			variant="outlined"
			density="compact"
			hide-details
			readonly
			placeholder="Nessuna mappa associata"
		/>

		<MapListLayout :loading="isLoading">
		<template #header>
			<div class="tw:flex tw:flex-col tw:gap-2">
				<div class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
					<v-text-field
						v-model="searchText"
						label="Filtra mappe"
						variant="outlined"
						density="compact"
						hide-details
						clearable
						class="tw:min-w-[220px] tw:flex-1"
					/>
				</div>
				<div class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
					<span class="tw:inline-flex tw:items-center tw:gap-1.5 tw:text-sm tw:text-opacity-75">
						<v-icon size="16">mdi-map-search-outline</v-icon>
						{{ resultCountLabel }}
					</span>
					<v-menu location="bottom end">
						<template #activator="{ props: menuProps }">
							<v-btn
								v-bind="menuProps"
								variant="text"
								size="large"
								icon="mdi-sort-variant"
								aria-label="Ordina mappe"
							/>
						</template>
						<v-list density="compact">
							<v-list-item
								v-for="option in sortOptions"
								:key="option.value"
								:title="option.title"
								:active="sortBy === option.value"
								@click="sortBy = option.value"
							/>
						</v-list>
					</v-menu>
				</div>
			</div>
		</template>

		<template #list>
			<div v-if="mapStore.error" class="tw:text-sm tw:text-red-700 tw:bg-red-50 tw:border tw:border-red-200 tw:rounded tw:p-2 tw:mb-3">
				Errore caricamento mappe: {{ mapStore.error.message }}
				<v-btn size="x-small" variant="text" class="tw:ml-2" @click="mapStore.loadMaps()">Riprova</v-btn>
			</div>
			<div class="tw:pr-1">
				<button
					v-for="item in filteredLayers"
					:key="item.pk"
					type="button"
					class="tw:w-full tw:text-left tw:p-1.5 tw:rounded-md tw:transition tw:border tw:border-transparent hover:tw:border-slate-200"
					:class="isActiveMap(item) ? 'selected-map' : ''"
					@click="selectMap(item)"
				>
					<div class="tw:flex tw:gap-2 tw:items-start">
						<div class="tw:w-1/4 tw:max-w-[25%] tw:min-w-[72px] tw:flex-shrink-0">
							<v-img
								:src="item.thumbnail_url"
								aspect-ratio="1"
								cover
								class="tw:w-full tw:h-full tw:aspect-square tw:rounded"
							>
								<template #placeholder>
									<div class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-slate-500">no image</div>
								</template>
							</v-img>
						</div>
						<div class="tw:min-w-0 tw:flex-1">
							<span class="tw:flex tw:items-center tw:gap-1.5 tw:mb-0.5 tw:min-w-0">
								<v-icon size="18" color="#1f5f96">mdi-map-outline</v-icon>
								<span class="tw:block tw:min-w-0 tw:flex-1 tw:truncate tw:text-base tw:font-semibold tw:text-[#1f5f96] tw:leading-tight">{{ item.title }}</span>
							</span>
							<p class="tw:text-xs tw:text-slate-700 tw:my-1 tw:line-clamp-2">{{ stripHtml(item.abstract || '') || 'Nessuna descrizione disponibile.' }}</p>
							<div class="tw:border-t tw:border-slate-200 tw:my-1"></div>
							<div class="tw:flex tw:flex-wrap tw:gap-x-2 tw:gap-y-0.5 tw:text-xs tw:text-[#2e5f8f]">
								<span class="tw:inline-flex tw:items-center tw:gap-1"><v-icon size="14">mdi-account</v-icon>{{ item.owner_username }}</span>
								<span class="tw:inline-flex tw:items-center tw:gap-1"><v-icon size="14">mdi-calendar</v-icon>{{ formatDate(item.created) }}</span>
								<span class="tw:inline-flex tw:items-center tw:gap-1"><v-icon size="14">mdi-eye-outline</v-icon>{{ item.popular_count }}</span>
								<span class="tw:inline-flex tw:items-center tw:gap-1"><v-icon size="14">mdi-share-variant-outline</v-icon>{{ item.share_count || '0' }}</span>
								<span class="tw:inline-flex tw:items-center tw:gap-1"><v-icon size="14">mdi-star-outline</v-icon>{{ item.rating || '0' }}</span>
							</div>
							
						</div>
					</div>
				</button>
			</div>
		</template>

		<template #detail>
			<div class="tw:w-full tw:h-[68vh] tw:rounded-md tw:border tw:border-slate-200 tw:bg-slate-50 tw:p-3 tw:overflow-y-auto">
				<div v-if="currentMap" class="tw:flex tw:flex-col tw:gap-3">
					<v-img
						:src="currentMap.thumbnail_url"
						aspect-ratio="16/9"
						cover
						class="tw:w-full tw:rounded tw:bg-slate-200"
					>
						<template #placeholder>
							<div class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-slate-500">no image</div>
						</template>
					</v-img>

					<div class="tw:min-w-0">
						<h3 class="tw:text-base tw:font-semibold tw:text-slate-800 tw:truncate">{{ currentMap.title }}</h3>
						<p class="tw:text-sm tw:text-slate-600 tw:mt-1 tw:line-clamp-4">
							{{ stripHtml(currentMap.abstract || '') || 'Nessuna descrizione disponibile.' }}
						</p>
					</div>

					<div class="tw:grid tw:grid-cols-2 tw:gap-2 tw:text-xs tw:text-slate-700">
						<div><span class="tw:font-medium">Autore:</span> {{ currentMap.owner_username }}</div>
						<div><span class="tw:font-medium">Data:</span> {{ formatDate(currentMap.created) }}</div>
						<div><span class="tw:font-medium">Visite:</span> {{ currentMap.popular_count }}</div>
						<div><span class="tw:font-medium">Condivisioni:</span> {{ currentMap.share_count || '0' }}</div>
					</div>

					<div>
						<v-btn
							:href="currentMap.detail_url"
							target="_blank"
							rel="noopener noreferrer"
							variant="outlined"
							size="small"
							append-icon="mdi-open-in-new"
						>
							Apri su GeoNode
						</v-btn>
					</div>
				</div>
				<div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-slate-500">
					Nessuna mappa selezionata
				</div>
			</div>
		</template>
		</MapListLayout>
	</div>
</template>


<style scoped lang="scss">
.selected-map {
	background-color: $main-dark-rose-color !important; 
}
</style>
