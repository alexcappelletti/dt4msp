<script setup lang="ts">
import type { Aspect, DomainEffect, DomainMeasure, Measure, Theme } from '#/shared/types/msp-project';
import { useThemesProvider } from '@/composables/useThemesProvider';
import { useScenarioStore } from '@/stores/scenarioStore';
import { computed, ref } from 'vue';
import MeasurePicker from './MeasurePicker.vue';

const store = useScenarioStore();
//const aspectStore = useAspectStore();
const props = defineProps<{
	initialData: Partial<DomainEffect>;
}>();


const emit = defineEmits(['save', 'cancel']);

const { availableThemes, loading } = useThemesProvider();
function cloneArray<T>(items: T[] | undefined): T[] {
	if (!items || items.length === 0) return [];
	return items.map((item) => ({ ...item }));
}

function cloneAffected(
	affected: DomainEffect["affected"] | undefined,
): DomainEffect["affected"] {
	if (!affected || affected.length === 0) return [];

	return affected[0]?.type === "Spatial"
		? cloneArray(affected as Measure[])
		: cloneArray(affected as Aspect[]);
}

type EffectFormData = Partial<DomainEffect> & {
	longName?: string;
	referenceThemes?: Theme[];
};

const formData = ref<EffectFormData>({
	...props.initialData,
	affected: cloneAffected(props.initialData.affected),
} as EffectFormData);

const canSave = computed(() => formData.value.name?.trim() && formData.value.description?.trim());
const saveForm = () => {
	if (canSave.value) {
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	emit('cancel');
};

const effectType = computed(() => {
	const first = formData.value.affected?.[0] as DomainMeasure | undefined;
	return first?.type === "Spatial" ? "Spatial" : "Non-spatial";
});

const availableMeasures = computed(() => store.selectedScenario?.domainMeasures ?? []);
const availableAffected = computed(() =>
	availableMeasures.value.filter((m) =>
		effectType.value === "Spatial" ? m.type === "Spatial" : m.type === "Contextual",
	),
);

const selectedThemeIds = computed({
	get: () => (formData.value.referenceThemes ?? []).map((t) => t.id),
	set: (ids: string[]) => {
		formData.value.referenceThemes = availableThemes.value.filter((t) => ids.includes(t.id));
	},
});

const affectedModel = computed({
	get: () => (formData.value.affected ?? []) as DomainMeasure[],
	set: (val: DomainMeasure[]) => {
		formData.value.affected = val as DomainEffect["affected"];
	},
});






</script>

<template>
	<v-card class="pa-4 d-flex flex-column h-100" flat>
		<v-toolbar color="background" flat class="tw:sticky tw:top-0 tw:z-10 tw:bg-white">
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-toolbar-title class="font-weight-bold">
				<v-chip v-if="effectType === 'Spatial'" size="small" color="primary" variant="flat" class="mr-2">
					Spaziale
				</v-chip>
				<v-chip v-else size="small" color="primary" variant="flat" class="mr-2">
					N-S
				</v-chip>
				{{ effectType === "Spatial" ? "Spatial effect" : "Non-spatial effect" }}
			</v-toolbar-title>

			<v-spacer></v-spacer>

			<v-btn icon>
				<v-icon>mdi-star-outline</v-icon>
			</v-btn>
			<v-btn icon @click="saveForm" :disabled="!canSave">
				<v-icon color="primary" class="mr-2">mdi-content-save</v-icon>
			</v-btn>
		</v-toolbar>

		<v-card-text class="d-flex flex-column flex-grow-1 tw:overflow-y-auto">
			<v-form class="d-flex flex-column flex-grow-1">
				<v-row>
					<v-col cols="12" md="6">
						<v-text-field v-model="formData.name" label="Short name" variant="outlined" clearable
							hint="Short title of the effect" persistent-hint />
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-text-field v-model="formData.longName" label="long title" variant="outlined" clearable
							hint="Long title of the effect" persistent-hint />
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea v-model="formData.description" label="Description" variant="outlined" clearable
							rows="6" hint="Description of the effect" persistent-hint class="mb-4" />
					</v-col>
				</v-row>





				<v-expand-transition>
					<v-row>
						<v-col cols="12">
							<v-label>Temi</v-label>
							<v-progress-linear v-if="loading" indeterminate color="primary" class="mt-2" />
							<v-chip-group v-else v-model="selectedThemeIds" column multiple
								selected-class="text-primary">
								<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme.id"
									variant="outlined">
									{{ theme.name }}
								</v-chip>
							</v-chip-group>
						</v-col>
					</v-row>
				</v-expand-transition>

				<v-expand-transition>
					<v-row class="mt-4 flex-grow-1">
						<v-col cols="12" class="d-flex flex-column">
							<MeasurePicker class="flex-grow-1" :available="availableAffected"
								v-model="affectedModel" label="Measure" />
						</v-col>
					</v-row>
				</v-expand-transition>



			</v-form>
		</v-card-text>
	</v-card>
</template>

<style scoped></style>
