<script setup lang="ts">
import type { DomainMeasure } from "#/shared/types/msp-project";
import { computed, ref } from "vue";

const props = defineProps<{
	available: DomainMeasure[];
	modelValue: DomainMeasure[];
	label?: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: DomainMeasure[]): void;
}>();

const selectedAvailableIds = ref<string[]>([]);
const selectedChosenIds = ref<string[]>([]);
const searchAvailable = ref("");
const searchChosen = ref("");

const chosenIds = computed(() => new Set((props.modelValue ?? []).map((m) => m.id)));

const availableList = computed(() =>
	(props.available ?? []).filter((m) => !chosenIds.value.has(m.id)),
);

const chosenList = computed(() => props.modelValue ?? []);

function sortByName(items: DomainMeasure[]) {
	return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

const filteredAvailable = computed(() => {
	const q = searchAvailable.value.trim().toLowerCase();
	if (!q) return availableList.value;
	return sortByName(availableList.value).filter((m) =>
		m.name.toLowerCase().includes(q),
	);
});

const filteredChosen = computed(() => {
	const q = searchChosen.value.trim().toLowerCase();
	if (!q) return chosenList.value;
	return sortByName(chosenList.value).filter((m) =>
		m.name.toLowerCase().includes(q),
	);
});

function toggleSelectedAvailable(id: string) {
	const idx = selectedAvailableIds.value.indexOf(id);
	if (idx >= 0) {
		selectedAvailableIds.value.splice(idx, 1);
	} else {
		selectedAvailableIds.value.push(id);
	}
}

function toggleSelectedChosen(id: string) {
	const idx = selectedChosenIds.value.indexOf(id);
	if (idx >= 0) {
		selectedChosenIds.value.splice(idx, 1);
	} else {
		selectedChosenIds.value.push(id);
	}
}

function moveToChosen() {
	if (selectedAvailableIds.value.length === 0) return;
	const toAdd = availableList.value.filter((m) =>
		selectedAvailableIds.value.includes(m.id),
	);
	const next = [...chosenList.value, ...toAdd];
	emit("update:modelValue", next);
	selectedAvailableIds.value = [];
}

function moveToAvailable() {
	if (selectedChosenIds.value.length === 0) return;
	const next = chosenList.value.filter(
		(m) => !selectedChosenIds.value.includes(m.id),
	);
	emit("update:modelValue", next);
	selectedChosenIds.value = [];
}
</script>

<template>
	<div class="tw:relative tw:w-full">
		<!-- Etichetta flottante nello stile Material outlined -->
		<label class="tw:absolute tw:left-4 tw:-top-3 tw:text-sm tw:font-medium tw:bg-white tw:px-1 tw:text-gray-600">
			{{ label ?? "Measure" }}
		</label>

		<div
			class="tw:flex tw:flex-col tw:flex-1 tw:gap-4 tw:border tw:border-gray-300 tw:rounded tw:bg-white tw:p-4 tw:min-h-[25vh] focus-within:tw:border-primary focus-within:tw:border-2">
			<!-- Prima riga: Campi di ricerca -->
			<div class="tw:grid tw:grid-cols-2 tw:gap-4">
				<v-text-field v-model="searchAvailable" placeholder="Search available..." variant="outlined"
					density="compact" />
				<v-text-field v-model="searchChosen" placeholder="Search selected..." variant="outlined"
					density="compact" />
			</div>

			<!-- Seconda riga: Liste e bottoni -->
			<div class="tw:grid tw:grid-cols-[1fr_auto_1fr] tw:gap-4 tw:items-start tw:flex-1 tw:min-h-0">
				<!-- Colonna 1: Lista disponibile -->
				<div class="tw:overflow-auto tw:space-y-0 tw:min-h-0 tw:max-h-[260px]">
					<div v-for="item in filteredAvailable" :key="item.id" @click="toggleSelectedAvailable(item.id)"
						:class="[
							'tw:px-2 tw:py-2 tw:cursor-pointer tw:transition-colors tw:text-sm tw:rounded',
							selectedAvailableIds.includes(item.id)
								? 'tw:bg-blue-50 tw:text-primary'
								: 'tw:bg-white tw:text-gray-800 hover:tw:bg-gray-50'
						]">
						<div class="tw:font-medium">{{ item.name }}</div>
						<div class="tw:text-xs tw:mt-1"
							:class="selectedAvailableIds.includes(item.id) ? 'tw:text-blue-600' : 'tw:text-gray-500'">
							{{ item.type === "Spatial" ? "Spatial" : "Non spatial" }}
						</div>
					</div>
					<p v-if="filteredAvailable.length === 0"
						class="tw:text-xs tw:text-gray-400 tw:py-2 tw:px-2 tw:text-center">
						No available measures
					</p>
				</div>

				<!-- Colonna 2: Bottoni -->
				<div
					class="tw:flex tw:flex-col tw:gap-2 tw:items-center tw:justify-center tw:self-stretch tw:border-x tw:border-gray-200 tw:px-3">
					<v-btn icon="mdi-chevron-right" size="small" variant="outlined" @click="moveToChosen"
						:disabled="!selectedAvailableIds.length" />
					<v-btn icon="mdi-chevron-left" size="small" variant="outlined" @click="moveToAvailable"
						:disabled="!selectedChosenIds.length" />
				</div>

				<!-- Colonna 3: Lista selezionata -->
				<div class="tw:overflow-auto tw:space-y-0 tw:min-h-0 tw:max-h-[260px]">
					<div v-for="item in filteredChosen" :key="item.id" @click="toggleSelectedChosen(item.id)" :class="[
						'tw:px-2 tw:py-2 tw:cursor-pointer tw:transition-colors tw:text-sm tw:rounded',
						selectedChosenIds.includes(item.id)
							? 'tw:bg-blue-50 tw:text-primary'
							: 'tw:bg-white tw:text-gray-800 hover:tw:bg-gray-50'
					]">
						<div class="tw:font-medium">{{ item.name }}</div>
						<div class="tw:text-xs tw:mt-1"
							:class="selectedChosenIds.includes(item.id) ? 'tw:text-blue-600' : 'tw:text-gray-500'">
							{{ item.type === "Spatial" ? "Spatial" : "Non spatial" }}
						</div>
					</div>
					<p v-if="filteredChosen.length === 0"
						class="tw:text-xs tw:text-gray-400 tw:py-2 tw:px-2 tw:text-center">
						No selected measures
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
