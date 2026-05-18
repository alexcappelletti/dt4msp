<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { GeonodeMapListItem } from '#/shared/types/geonodeTypes';
import { useSpatialResourceStore } from '@/stores/spatialStore';

const mapStore = useSpatialResourceStore();
const selectedMap = ref<GeonodeMapListItem | null>(null);
const searchText = ref('');
const sortBy = ref<'date_desc' | 'popular_desc' | 'title_asc'>('date_desc');
const isLoading = computed(() => mapStore.busy);

const sortOptions = [
	{ value: 'date_desc', label: 'Data piu recente' },
	{ value: 'popular_desc', label: 'Piu viste' },
	{ value: 'title_asc', label: 'Titolo A-Z' },
];

const filteredLayers = computed(() => {
	const q = searchText.value.trim().toLowerCase();
	const base = mapStore.availableMaps.filter((l) =>
		!q
		|| l.title.toLowerCase().includes(q)
		|| l.abstract.toLowerCase().includes(q)
		|| l.owner_username.toLowerCase().includes(q),
	);
	const sorted = [...base];
	if (sortBy.value === 'title_asc') {
		sorted.sort((a, b) => a.title.localeCompare(b.title, 'it-IT'));
	} else if (sortBy.value === 'popular_desc') {
		sorted.sort((a, b) => Number(b.popular_count || 0) - Number(a.popular_count || 0));
	} else {
		sorted.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
	}
	return sorted;
});

const resultCountLabel = computed(() => {
	const n = filteredLayers.value.length;
	return n === 1 ? '1 Mappa trovata' : `${n} Mappe trovate`;
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
};

onMounted(async () => {
	if (mapStore.availableMaps.length === 0) {
		await mapStore.loadMaps();
	}
	if (mapStore.availableMaps.length > 0) {
		selectMap(mapStore.availableMaps[0]);
	}
});
</script>

<template>
	<div class="tw:grid tw:grid-cols-2 tw:gap-4 tw:items-stretch">
		<div class="tw:col-span-1 tw:bg-white tw:rounded-md tw:p-3 tw:border tw:border-red-500">
			<div class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3 tw:mb-3">
				<span class="tw:text-2xl tw:font-semibold">{{ resultCountLabel }}</span>
				<!-- <div class="tw:flex tw:gap-2 tw:w-full md:tw:w-auto">
					<v-text-field
						v-model="searchText"
						label="Cerca mappa"
						variant="outlined"
						density="compact"
						hide-details
						clearable
					/>
					<v-select
						v-model="sortBy"
						:items="sortOptions"
						item-title="label"
						item-value="value"
						label="Ordina"
						variant="outlined"
						density="compact"
						hide-details
						class="tw:min-w-[180px]"
					/>
				</div> -->
			</div>

			<div v-if="mapStore.error" class="tw:text-sm tw:text-red-700 tw:bg-red-50 tw:border tw:border-red-200 tw:rounded tw:p-2 tw:mb-3">
				Errore caricamento mappe: {{ mapStore.error.message }}
				<v-btn size="x-small" variant="text" class="tw:ml-2" @click="mapStore.loadMaps()">Riprova</v-btn>
			</div>
			<div v-if="isLoading" class="tw:py-3">
				<v-progress-linear indeterminate color="primary" />
			</div>
			<div v-else class="tw:h-[68vh] tw:overflow-y-auto tw:pr-1">
				<button
					v-for="item in filteredLayers"
					:key="item.pk"
					type="button"
					class="tw:w-full tw:text-left tw:p-1.5 tw:rounded-md tw:transition tw:border tw:border-transparent hover:tw:border-slate-200"
					:class="selectedMap?.pk === item.pk ? 'tw:bg-slate-50 tw:border-slate-300' : ''"
					@click="selectMap(item)"
				>
					<div class="tw:flex tw:gap-2 tw:items-start">
						<v-img :src="item.thumbnail_url" width="84" height="84" class="tw:rounded tw:bg-slate-200 tw:flex-shrink-0">
							<template #placeholder>
								<div class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-slate-500">no image</div>
							</template>
						</v-img>
						<div class="tw:min-w-0 tw:flex-1">
							<span class="tw:inline-flex tw:items-center tw:gap-1.5 tw:mb-0.5">
								<v-icon size="18" color="#1f5f96">mdi-map-outline</v-icon>
								<span class="tw:text-base tw:font-semibold tw:text-[#1f5f96] tw:leading-tight">{{ item.title }}</span>
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
							<div class="tw:mt-0.5">
								<span class="tw:inline-flex tw:items-center tw:gap-1 tw:text-[#2e5f8f] tw:text-xs">
									<v-icon size="14">mdi-map-marker-outline</v-icon>Visualizza mappa
								</span>
							</div>
						</div>
					</div>
				</button>
				<p v-if="filteredLayers.length === 0" class="tw:text-sm tw:text-slate-500 tw:py-4">Nessuna mappa trovata.</p>
			</div>
		</div>

		<div class="md:tw:col-span-2 tw:bg-white tw:rounded-md tw:p-3 tw:border tw:border-red-500">
			<div class="tw:w-full tw:h-[68vh] tw:rounded-md tw:border tw:border-dashed tw:border-slate-300 tw:bg-slate-50"></div>
		</div>
	</div>
</template>
