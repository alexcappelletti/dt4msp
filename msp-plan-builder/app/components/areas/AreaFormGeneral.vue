<!-- app/pages/areas/[id].vue -->
<script setup lang="ts">
import type { AreaOfInterest } from '#/shared/types/msp-project';
import { debounce } from 'lodash-es';
import { computed, onMounted, ref, watch } from 'vue';
import { useMspDataProvider } from '~/composables/useMspProvider';

const mpsDataProvider = useMspDataProvider();
const tab = ref('general');
const areaData = ref<AreaOfInterest | null>(null);
const isLoading = ref(true);
const isSaving = ref(true); // Feedback visivo per l'utente

onMounted(async () => {
	const project = await mpsDataProvider.fetchProject('001');
	areaData.value = project?.areaOfInterest || null;
	isLoading.value = false;
});

const hasArea = computed(() => areaData.value !== null);

const saveProjectData = async (updatedData: AreaOfInterest) => {
	isSaving.value = true;
	try {
		console.log('Salvataggio automatico in corso...', updatedData);
		// Assicurati che il tuo composable supporti un metodo di update
		// await mpsDataProvider.updateArea(updatedData);
	} catch (error) {
		console.error('Errore durante il salvataggio:', error);
	} finally {
		// Simuliamo un delay per il feedback visivo
		setTimeout(() => { isSaving.value = false; }, 500);
	}
};

const debouncedSave = debounce((newValue: AreaOfInterest) => {
	saveProjectData(newValue);
}, 500);


watch(
	areaData,
	(newValue) => {
		if (newValue && !isLoading.value) {
			debouncedSave(JSON.parse(JSON.stringify(newValue)));
		}
	},
	{ deep: true }
);
</script>

<template>
	<div class="container-panel">
		<!-- Stato di caricamento iniziale -->
		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

		<!-- Indicatore di salvataggio in corso -->
		<v-fade-transition>
			<div v-if="isSaving" class="text-caption text-primary d-flex align-center position-absolute"
				style="top: 10px; right: 20px; z-index: 10;">
				<v-progress-circular indeterminate size="16" width="2" class="mr-2"></v-progress-circular>
				Salvataggio in corso...
			</div>
		</v-fade-transition>

		<!-- Messaggio di info se i dati non sono disponibili -->
		<v-alert v-if="!isLoading && !hasArea" type="info" variant="tonal" icon="mdi-information-outline" prominent>
			Occorre selezionare un'area all'interno di un progetto per visualizzare o modificare i dettagli.
		</v-alert>

		<div v-if="hasArea" elevation="2">
			<v-tabs v-model="tab" color="primary" class="tab-style">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
			</v-tabs>
			<v-window v-model="tab" class="ma-2 mt-4">
				<!-- Tab 1: Dettagli Generali -->
				<v-window-item value="general">
					<v-form>
						<v-row>
							<v-col cols="12" md="6" class="mt-2">
								<v-text-field v-model="areaData!.name" label="Nome Progetto" variant="outlined"
									clearable></v-text-field>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12" md="6">
								<v-text-field v-model="areaData!.name" label="Nome Corto Area" variant="outlined"
									clearable></v-text-field>
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="areaData!.description" label="Nome Completo Area"
									variant="outlined" clearable></v-text-field>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12">
								<v-textarea v-model="areaData!.description" label="Descrizione Generale dell'area"
									variant="outlined" rows="4" clearable></v-textarea>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12">
								<v-textarea v-model="areaData!.description" label="Orizzonte temporale (Time horizon)"
									hint="La distanza temporale del progetto." variant="outlined" rows="3"
									clearable></v-textarea>
							</v-col>
						</v-row>
					</v-form>
				</v-window-item>

				<v-window-item value="statements">
					<p class="pa-4">Qui gestirai gli statements (interfacce `Statement`).</p>
				</v-window-item>

				<v-window-item value="map">
					<p class="pa-4">Qui integrerai la mappa.</p>
				</v-window-item>
			</v-window>


			<!-- Rimosso v-card-actions col bottone -->
		</div>
	</div>
</template>

<style scoped>
.position-absolute {
	position: absolute !important;
}

.container-panel {
	background-color: #FFFF;
	width: 100%;

}

.tab-style {
	background-color: #FEF7FF;

}
</style>
