<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Aspect, DomainEffect, DomainMeasure, Measure, Theme } from '#/shared/types/msp-project';
//import { useAspectStore } from '@/stores/aspectStore'; // Importa il tuo store Pinia
// import { useScenarioStore } from '@/stores/scenarioStore';
// import {useThemesProvider} from '@/composables/useThemesProvider';

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

const affectedColumns = computed(() => {
	const list = availableAffected.value;
	const mid = Math.ceil(list.length / 2);
	return [list.slice(0, mid), list.slice(mid)];
});

function isSpatial(item: DomainMeasure): item is Measure {
	return item.type === "Spatial";
}

function isContextual(item: DomainMeasure): item is Aspect {
	return item.type === "Contextual";
}

function selectedIds() {
	return new Set((formData.value.affected ?? []).map((a) => a.id));
}

function isSelected(item: DomainMeasure): boolean {
	return selectedIds().has(item.id);
}

function toggleAffected(item: DomainMeasure) {
	const isSpatialEffect = effectType.value === "Spatial";
	const isValid =
		(isSpatialEffect && isSpatial(item)) ||
		(!isSpatialEffect && isContextual(item));

	if (!isValid) return;

	const current = (formData.value.affected ?? []) as DomainMeasure[];
	const next = isSelected(item)
		? current.filter((a) => a.id !== item.id)
		: [...current, { ...item }];

	formData.value.affected = next as DomainEffect["affected"];
}






</script>

<template>
	<v-card class="pa-4" flat>
		<v-toolbar color="background" flat>
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-toolbar-title class="font-weight-bold">
				<v-chip
					v-if="effectType === 'Spatial'"
					size="small"
					color="primary"
					variant="flat"
					class="mr-2"
				>
					Spaziale
				</v-chip>
				<v-chip
					v-else
					size="small"
					color="primary"
					variant="flat"
					class="mr-2"
				>
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

		<v-card-text>
			<v-form>
				<v-row>
					<v-col cols="12" md="6">
						<v-text-field
							v-model="formData.name"
							label="Short name"
							variant="outlined"
							clearable
							hint="Short title of the effect"
							persistent-hint
						/>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-text-field
							v-model="formData.longName"
							label="long title"
							variant="outlined"
							clearable
							hint="Long title of the effect"
							persistent-hint
						/>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea
							v-model="formData.description"
							label="Description"
							variant="outlined"
							clearable
							rows="6"
							hint="Description of the effect"
							persistent-hint
							class="mb-4"
						/>
					</v-col>
				</v-row>

				<v-expand-transition>
					<v-row>
						<v-col cols="12">
							<v-label>Temi</v-label>
							<v-progress-linear
								v-if="loading"
								indeterminate
								color="primary"
								class="mt-2"
							/>
							<v-chip-group
								v-else
								v-model="formData.referenceThemes"
								column
								multiple
								selected-class="text-primary"
							>
								<v-chip
									v-for="theme in availableThemes"
									:key="theme.id"
									:value="theme"
									variant="outlined"
								>
									{{ theme.name }}
								</v-chip>
							</v-chip-group>
						</v-col>
					</v-row>
				</v-expand-transition>

				<v-expand-transition>
					<v-row class="mt-4">
						<v-col cols="12">
							<v-label>Measure</v-label>
						</v-col>
						<v-col cols="12" md="6" v-for="(column, colIndex) in affectedColumns" :key="colIndex">
							<v-card variant="outlined" class="measure-list-card">
								<v-list density="compact">
									<v-list-item
										v-for="item in column"
										:key="item.id"
										class="measure-list-item"
										@click="toggleAffected(item)"
									>
										<template #prepend>
											<v-checkbox
												:model-value="isSelected(item)"
												@click.stop
												@update:model-value="() => toggleAffected(item)"
												hide-details
											/>
										</template>
										<v-list-item-title>{{ item.name }}</v-list-item-title>
									</v-list-item>
								</v-list>
							</v-card>
						</v-col>
					</v-row>
				</v-expand-transition>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<style scoped>
.measure-list-card {
	min-height: 220px;
	max-height: 280px;
	overflow: auto;
}

.measure-list-item {
	cursor: pointer;
}
</style>
