<script setup lang="ts">
import type { Aspect, DomainEffect, DomainMeasure, MapLayer, Measure, Theme } from '#/shared/types/msp-project';
import { useScenarioStore } from '@/stores/scenarioStore';
import { computed, onMounted, ref } from 'vue';
import MeasurePicker from './MeasurePicker.vue';
import type { MeasureType } from './DomainMeasures.vue';
import { useThemesStore } from '@/stores/themesStore';
import SpatialResourcesPanel from './SpatialResourcesPanel.vue';

const store = useScenarioStore();
const themesStore = useThemesStore();
export type EffectInitProp = {
	effect: Partial<DomainEffect>,
	type: MeasureType
}
//const aspectStore = useAspectStore();
const props = defineProps<{
	initialData: EffectInitProp
}>();
const emit = defineEmits([
	'save',
	'cancel']);

const availableThemes = computed(() => themesStore.predefinedThemes);
const loading = computed(() => themesStore.isThemesLoading);
onMounted(async () => {
	if (themesStore.predefinedThemes.length === 0) {
		await themesStore.fetchPredefinedThemes(store.currentProject?.id);
	}
});
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

type EffectEditorData = Partial<DomainEffect> & {
	longName?: string;
	referenceThemes?: Theme[];
	effectType: MeasureType;
};

const formData = ref<EffectEditorData>({
	...props.initialData.effect,
	effectType: props.initialData.type,
	affected: cloneAffected(props.initialData.effect.affected),
} as EffectEditorData);

const canSave = computed(() => formData.value.name?.trim() && formData.value.description?.trim());
const saveForm = () => {
	if (canSave.value) {
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	emit('cancel');
};

const effectType = computed(() =>
	formData.value.effectType === "Spatial" ? "Spatial" : "Non-spatial",
);

const effectMeasureType = computed<DomainMeasure["type"]>(() =>
	formData.value.effectType === "Spatial" ? "Spatial" : "Non-spatial",
);

const availableMeasures = computed(() => {
	const list = store.selectedScenario?.domainMeasures ?? [];
	const requiredType = effectMeasureType.value;
	const affectedIds = new Set((formData.value.affected ?? []).map((m) => m.id));
	return list.filter((m) => m.type === requiredType && !affectedIds.has(m.id));
});

const selectedThemeIds = computed({
	get: () => (formData.value.referenceThemes ?? []).map((t) => t.id),
	set: (ids: string[]) => {
		const currentById = new Map(
			(formData.value.referenceThemes ?? []).map((theme) => [theme.id, theme]),
		);
		for (const theme of availableThemes.value) {
			if (ids.includes(theme.id)) {
				currentById.set(theme.id, theme);
			}
		}
		formData.value.referenceThemes = ids
			.map((id) => currentById.get(id))
			.filter((theme): theme is Theme => !!theme);
	},
});

const affectedModel = computed({
	get: () => (formData.value.affected ?? []) as DomainMeasure[],
	set: (val: DomainMeasure[]) => {
		formData.value.affected = val as DomainEffect["affected"];

		// Auto-seleziona i temi associati alle misure aggiunte
		const mergedIds = new Set(
			(formData.value.referenceThemes ?? []).map((theme) => theme.id),
		);
		for (const measure of val) {
			for (const theme of measure.referenceThemes ?? []) {
				mergedIds.add(theme.id);
			}
		}
		selectedThemeIds.value = Array.from(mergedIds);
	},
});

const effectGeospatialResources = computed<MapLayer[]>(() => {
	if (effectType.value !== "Spatial") return [];

	const merged = new Map<string, MapLayer>();
	for (const measure of affectedModel.value) {
		if (measure.type !== "Spatial") continue;
		for (const resource of measure.geospatialResources ?? []) {
			const key = String(
				resource.datasetPk
				?? resource.id
				?? resource.name
				?? resource.title
				?? "",
			).trim();
			if (!key) continue;
			merged.set(key, resource);
		}
	}
	return [...merged.values()];
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
				{{ effectType === "Spatial" ? "Effetto spaziale" : "Effetto non spaziale" }}
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
							<measure-picker class="flex-grow-1" :available="availableMeasures" v-model="affectedModel"
								label="Measure" />
						</v-col>
					</v-row>
				</v-expand-transition>

				<v-expand-transition>
					<v-row v-if="effectType === 'Spatial'" class="mt-4">
						<v-col cols="12">
							<SpatialResourcesPanel
								:model-value="effectGeospatialResources"
								title="Layer derivati dalle misure coinvolte"
								readonly
							/>
						</v-col>
					</v-row>
				</v-expand-transition>



			</v-form>
		</v-card-text>
	</v-card>
</template>

<style scoped></style>
