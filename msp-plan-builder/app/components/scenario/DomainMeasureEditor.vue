<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import type { DomainMeasure, Measure } from '#/shared/types/msp-project';
import SpatialResourcesPanel from './SpatialResourcesPanel.vue';
//import { useAspectStore } from '@/stores/aspectStore'; // Importa il tuo store Pinia
// import { useScenarioStore } from '@/stores/scenarioStore';

const store = useScenarioStore();
const themesStore = useThemesStore();
//const aspectStore = useAspectStore();



const props = defineProps<{
	initialData: Partial<DomainMeasure>;
}>();

const emit = defineEmits(['save', 'cancel']);

const availableThemes = computed(() => themesStore.predefinedThemes);
const loading = computed(() => themesStore.isThemesLoading);
onMounted(async () => {
	if (themesStore.predefinedThemes.length === 0) {
		await themesStore.fetchPredefinedThemes(store.currentProject?.id);
	}
});
const formData = ref<Partial<DomainMeasure>>({
	...props.initialData,
	referenceThemes: props.initialData.referenceThemes ? [...props.initialData.referenceThemes] : [],
});
const spatialResourcesPanel = useTemplateRef<InstanceType<typeof SpatialResourcesPanel>>('spatialResourcesPanel');
const canSave = computed(() => formData.value.name?.trim() && formData.value.longName?.trim());
const isSpatialMeasure = computed(() => formData.value.type === 'Spatial');
const measureKindLabel = computed(() => isSpatialMeasure.value ? 'Misura spaziale' : 'Misura non spaziale');

const saveForm = async () => {
	if (canSave.value) {
		if (isSpatialMeasure.value) {
			const thumbnail = await spatialResourcesPanel.value?.generateThumbnail?.();
			if (thumbnail) {
				formData.value.thumbnail = thumbnail;
			}
			const currentResources = (formData.value as Partial<Measure>).geospatialResources;
			(formData.value as Partial<Measure>).geospatialResources = Array.isArray(currentResources) ? currentResources : [];
		} else {
			delete (formData.value as Partial<Measure>).geospatialResources;
			delete formData.value.thumbnail;
		}
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	emit('cancel');
};

</script>
<template>
	
	<v-card class="pa-4 d-flex flex-column h-100" flat>
		<v-toolbar color="background" flat class="tw:sticky tw:top-0 tw:z-10 tw:bg-white">
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-toolbar-title class="font-weight-bold">
				<div v-if="isSpatialMeasure">
					<v-chip size="small" color="primary" variant="flat" class="mr-2">Spaziale</v-chip>
					{{ measureKindLabel }}</div>
				<div v-else>
					<v-chip size="small" color="primary" variant="flat" class="mr-2">N-S</v-chip>
					{{ measureKindLabel }}</div>
				
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
					<v-col cols="12" md="3">
						<!-- Short Name -->
						<v-text-field v-model="formData.name" label="Short name" variant="outlined" clearable
							hint="Short title of the measure" persistent-hint></v-text-field>
					</v-col>
					<v-col cols="12" md="9">
						<v-text-field v-model="formData.longName" label="long title" variant="outlined" clearable
							hint="Long title of the measure" persistent-hint></v-text-field>
					</v-col>
				</v-row>
				<!-- <v-expand-transition>
					<v-row v-if="formData.type === 'Spatial'">
						<v-col cols="12">
							<v-text-field v-model="formData.impact" label="Impatto" variant="outlined" />
						</v-col>
					</v-row><v-row v-if="formData.type === 'Spatial'">
						<v-col cols="12">
							<SpatialResourcesPanel
								v-model="formData.geospatialResources"
								title="Layer della misura"
							/>
						</v-col>
					</v-row>
				</v-expand-transition>
 -->
				<v-row v-if="isSpatialMeasure">
					<v-col cols="12">
						<SpatialResourcesPanel
							ref="spatialResourcesPanel"
							v-model="formData.geospatialResources"
							title="Layer della misura"
						/>
					</v-col>
				</v-row>


				<v-row>
					<v-col>
						<v-textarea v-model="formData.description" label="Description" variant="outlined" clearable
							rows="6" hint="Description of the measure" persistent-hint class="mb-4"></v-textarea>
					</v-col>
				</v-row>
				<v-expand-transition>
					<v-row>
						<v-col cols="12">
							<v-label>Temi</v-label>
							<v-progress-linear v-if="loading" indeterminate color="primary"
								class="mt-2"></v-progress-linear>
							<v-chip-group v-else v-model="formData.referenceThemes" column multiple
								selected-class="text-primary">
								<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme"
									variant="outlined">
									{{ theme.name }}
								</v-chip>
							</v-chip-group>
						</v-col>
					</v-row>
				</v-expand-transition>
			</v-form>
		</v-card-text>
	</v-card>
</template>


<style scoped>
</style>
