<script setup lang="ts">
import { ref } from 'vue';
import type { Theme, Aspect, DomainMeasure } from '#/shared/types/msp-project';
//import { useAspectStore } from '@/stores/aspectStore'; // Importa il tuo store Pinia
// import { useScenarioStore } from '@/stores/scenarioStore';
// import {useThemesProvider} from '@/composables/useThemesProvider';

const store = useScenarioStore();
const themesProvider = useThemesProvider();
//const aspectStore = useAspectStore();



const props = defineProps<{
	initialData: Partial<DomainMeasure>;
}>();

const emit = defineEmits(['save', 'cancel']);

const { availableThemes, loading } = useThemesProvider();
const formData = ref<Partial<DomainMeasure>>({
	...props.initialData,
	referenceThemes: props.initialData.referenceThemes ? [...props.initialData.referenceThemes] : []
});
const canSave = computed(() => formData.value.name?.trim() && formData.value.longName?.trim());

const saveForm = () => {
	if (canSave.value) {
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	emit('cancel');
};

</script>
<template>
	
	<v-card class="pa-4 " flat>
		<v-toolbar color="background" flat>
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-toolbar-title class="font-weight-bold">
				<div v-if="formData.type==='Spatial'">
					<v-chip size="small" color="primary" variant="flat" class="mr-2">Spaziale</v-chip>
					Misura spaziale</div>
				<div v-else>
					<v-chip size="small" color="primary" variant="flat" class="mr-2">N-S</v-chip>
					Misura non spaziale</div>
				
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
						<!-- Short Name -->
						<v-text-field v-model="formData.name" label="Short name" variant="outlined" clearable
							hint="Short title of the measure" persistent-hint></v-text-field>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-text-field v-model="formData.longName" label="long title" variant="outlined" clearable
							hint="Long title of the measure" persistent-hint></v-text-field>
					</v-col>
				</v-row>
				<v-expand-transition>
					<v-row v-if="formData.type === 'Spatial'">
						<v-col cols="12">
							<v-text-field v-model="formData.impact" label="Impatto" variant="outlined" />
						</v-col>
					</v-row><v-row v-if="formData.type === 'Spatial'">
						<v-col cols="12">
							MAppa con selezione dei layers
						</v-col>
					</v-row>
				</v-expand-transition>


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
/* Stili minimi, Vuetify gestisce la maggior parte dell'UI */
.themes-section {
	/* Per mantenere un po' di spaziatura visiva */
}
</style>
